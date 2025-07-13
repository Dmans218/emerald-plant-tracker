const express = require('express');
const router = express.Router();
const recommendationEngine = require('../services/ai/recommendationEngine');
const { query } = require('../config/database');
const { logger } = require('../utils/logger');

/**
 * AI Recommendations API Routes
 * Provides intelligent cultivation recommendations based on plant data
 */

/**
 * GET /api/recommendations/:plantId
 * Get current recommendations for a specific plant
 */
router.get('/:plantId', async (req, res) => {
  try {
    const { plantId } = req.params;
    const { forceRefresh = false } = req.query;

    logger.info(`Fetching recommendations for plant ${plantId}`);

    // Validate plant exists
    const plantCheck = await query('SELECT id FROM plants WHERE id = $1', [plantId]);
    if (plantCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    // Clear cache if force refresh requested
    if (forceRefresh === 'true') {
      recommendationEngine.clearPlantCache(plantId);
    }

    // Generate recommendations
    const recommendations = await recommendationEngine.generateRecommendations(plantId, {
      includeHistorical: req.query.includeHistorical === 'true',
      confidenceThreshold: parseFloat(req.query.confidenceThreshold) || 0.7
    });

    res.json({
      success: true,
      data: recommendations,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error fetching recommendations:', error);
    res.status(500).json({ 
      error: 'Failed to generate recommendations',
      details: error.message 
    });
  }
});

/**
 * GET /api/recommendations/:plantId/history
 * Get recommendation history and outcomes for a plant
 */
router.get('/:plantId/history', async (req, res) => {
  try {
    const { plantId } = req.params;
    const { limit = 50 } = req.query;

    logger.info(`Fetching recommendation history for plant ${plantId}`);

    // Validate plant exists
    const plantCheck = await query('SELECT id FROM plants WHERE id = $1', [plantId]);
    if (plantCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    // Get recommendation history
    const result = await query(
      `SELECT 
        rh.id,
        rh.recommendation_id,
        rh.recommendation_data,
        rh.implemented,
        rh.effectiveness,
        rh.notes,
        rh.outcome_data,
        rh.created_at,
        rh.updated_at
       FROM recommendation_history rh
       WHERE rh.plant_id = $1
       ORDER BY rh.created_at DESC
       LIMIT $2`,
      [plantId, parseInt(limit)]
    );

    const history = result.rows.map(row => ({
      id: row.id,
      recommendationId: row.recommendation_id,
      recommendation: row.recommendation_data,
      implemented: row.implemented,
      effectiveness: row.effectiveness,
      notes: row.notes,
      outcome: row.outcome_data,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    res.json({
      success: true,
      data: {
        plantId,
        history,
        totalRecommendations: history.length,
        implementationRate: history.filter(h => h.implemented).length / history.length,
        averageEffectiveness: history
          .filter(h => h.effectiveness)
          .reduce((sum, h) => sum + (h.effectiveness === 'positive' ? 1 : h.effectiveness === 'neutral' ? 0.5 : 0), 0) / 
          history.filter(h => h.effectiveness).length
      }
    });

  } catch (error) {
    logger.error('Error fetching recommendation history:', error);
    res.status(500).json({ 
      error: 'Failed to fetch recommendation history',
      details: error.message 
    });
  }
});

/**
 * POST /api/recommendations/:recommendationId/feedback
 * Submit feedback on recommendation effectiveness
 */
router.post('/:recommendationId/feedback', async (req, res) => {
  try {
    const { recommendationId } = req.params;
    const { implemented, effectiveness, notes, outcome } = req.body;

    logger.info(`Submitting feedback for recommendation ${recommendationId}`);

    // Validate required fields
    if (typeof implemented !== 'boolean') {
      return res.status(400).json({ error: 'Implemented field is required and must be boolean' });
    }

    if (implemented && !effectiveness) {
      return res.status(400).json({ error: 'Effectiveness is required when recommendation was implemented' });
    }

    // Validate effectiveness value
    const validEffectiveness = ['positive', 'neutral', 'negative'];
    if (effectiveness && !validEffectiveness.includes(effectiveness)) {
      return res.status(400).json({ 
        error: 'Effectiveness must be one of: positive, neutral, negative' 
      });
    }

    // Store feedback
    const result = await query(
      `INSERT INTO recommendation_feedback (
        recommendation_id,
        implemented,
        effectiveness,
        notes,
        outcome_data,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id`,
      [recommendationId, implemented, effectiveness, notes, outcome]
    );

    // Update recommendation history if this is a new recommendation
    const historyCheck = await query(
      'SELECT id FROM recommendation_history WHERE recommendation_id = $1',
      [recommendationId]
    );

    if (historyCheck.rows.length === 0) {
      // Get the original recommendation data
      const recData = await query(
        'SELECT * FROM recommendations WHERE id = $1',
        [recommendationId]
      );

      if (recData.rows.length > 0) {
        await query(
          `INSERT INTO recommendation_history (
            recommendation_id,
            plant_id,
            recommendation_data,
            implemented,
            effectiveness,
            notes,
            outcome_data,
            created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
          [
            recommendationId,
            recData.rows[0].plant_id,
            recData.rows[0],
            implemented,
            effectiveness,
            notes,
            outcome
          ]
        );
      }
    } else {
      // Update existing history record
      await query(
        `UPDATE recommendation_history 
         SET implemented = $2, effectiveness = $3, notes = $4, outcome_data = $5, updated_at = NOW()
         WHERE recommendation_id = $1`,
        [recommendationId, implemented, effectiveness, notes, outcome]
      );
    }

    // Clear cache for the plant to ensure fresh recommendations
    const plantResult = await query(
      'SELECT plant_id FROM recommendations WHERE id = $1',
      [recommendationId]
    );

    if (plantResult.rows.length > 0) {
      recommendationEngine.clearPlantCache(plantResult.rows[0].plant_id);
    }

    res.json({
      success: true,
      data: {
        feedbackId: result.rows[0].id,
        message: 'Feedback submitted successfully'
      }
    });

  } catch (error) {
    logger.error('Error submitting feedback:', error);
    res.status(500).json({ 
      error: 'Failed to submit feedback',
      details: error.message 
    });
  }
});

/**
 * GET /api/recommendations/health
 * Check recommendation service health
 */
router.get('/health', async (req, res) => {
  try {
    // Check database connectivity
    const dbCheck = await query('SELECT 1 as health');
    
    // Check recommendation engine
    const engineHealth = recommendationEngine.cache ? 'healthy' : 'unhealthy';

    res.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: dbCheck.rows.length > 0 ? 'connected' : 'disconnected',
        recommendationEngine: engineHealth,
        cacheSize: recommendationEngine.cache ? recommendationEngine.cache.size : 0
      }
    });

  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({
      success: false,
      data: {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      }
    });
  }
});

/**
 * POST /api/recommendations/:plantId/process
 * Manually trigger recommendation generation for a plant
 */
router.post('/:plantId/process', async (req, res) => {
  try {
    const { plantId } = req.params;
    const { forceRefresh = true } = req.body;

    logger.info(`Manually processing recommendations for plant ${plantId}`);

    // Validate plant exists
    const plantCheck = await query('SELECT id FROM plants WHERE id = $1', [plantId]);
    if (plantCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    // Clear cache if force refresh
    if (forceRefresh) {
      recommendationEngine.clearPlantCache(plantId);
    }

    // Generate fresh recommendations
    const recommendations = await recommendationEngine.generateRecommendations(plantId, {
      forceRefresh: true
    });

    res.json({
      success: true,
      data: {
        message: 'Recommendations processed successfully',
        recommendations: recommendations,
        processedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Error processing recommendations:', error);
    res.status(500).json({ 
      error: 'Failed to process recommendations',
      details: error.message 
    });
  }
});

/**
 * GET /api/recommendations/stats/overview
 * Get overall recommendation statistics
 */
router.get('/stats/overview', async (req, res) => {
  try {
    // Get overall statistics
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_recommendations,
        COUNT(CASE WHEN implemented = true THEN 1 END) as implemented_count,
        COUNT(CASE WHEN effectiveness = 'positive' THEN 1 END) as positive_feedback,
        COUNT(CASE WHEN effectiveness = 'neutral' THEN 1 END) as neutral_feedback,
        COUNT(CASE WHEN effectiveness = 'negative' THEN 1 END) as negative_feedback
      FROM recommendation_history
    `);

    const stats = statsResult.rows[0];
    const implementationRate = stats.total_recommendations > 0 ? 
      (stats.implemented_count / stats.total_recommendations) : 0;
    
    const positiveRate = stats.implemented_count > 0 ? 
      (stats.positive_feedback / stats.implemented_count) : 0;

    res.json({
      success: true,
      data: {
        totalRecommendations: parseInt(stats.total_recommendations),
        implementedCount: parseInt(stats.implemented_count),
        implementationRate: implementationRate,
        positiveFeedback: parseInt(stats.positive_feedback),
        neutralFeedback: parseInt(stats.neutral_feedback),
        negativeFeedback: parseInt(stats.negative_feedback),
        positiveRate: positiveRate,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Error fetching recommendation stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch recommendation statistics',
      details: error.message 
    });
  }
});

/**
 * DELETE /api/recommendations/cache/:plantId
 * Clear recommendation cache for a specific plant
 */
router.delete('/cache/:plantId', async (req, res) => {
  try {
    const { plantId } = req.params;

    logger.info(`Clearing recommendation cache for plant ${plantId}`);

    recommendationEngine.clearPlantCache(plantId);

    res.json({
      success: true,
      data: {
        message: 'Recommendation cache cleared successfully',
        plantId: plantId,
        clearedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Error clearing recommendation cache:', error);
    res.status(500).json({ 
      error: 'Failed to clear recommendation cache',
      details: error.message 
    });
  }
});

module.exports = router; 