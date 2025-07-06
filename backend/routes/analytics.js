const express = require('express');
const router = express.Router();
const AnalyticsModel = require('../models/analytics');
const AnalyticsEngine = require('../services/analyticsEngine');
const { query } = require('../config/database');

/**
 * Analytics API Routes
 * Provides endpoints for accessing and processing cultivation analytics
 */

/**
 * GET /api/analytics/health
 * Health check endpoint for analytics service
 */
router.get('/health', async (req, res) => {
  const startTime = Date.now();

  try {
    // Simple database connectivity test
    await query('SELECT 1 as health_check');

    const processingTime = Date.now() - startTime;

    res.json({
      success: true,
      data: {
        status: 'healthy',
        database_connection: 'ok',
        timestamp: new Date().toISOString(),
      },
      meta: {
        processing_time_ms: processingTime,
      },
    });
  } catch (error) {
    console.error('Analytics health check failed:', error);
    res.status(500).json({
      success: false,
      error: 'Analytics service unhealthy',
      data: {
        status: 'unhealthy',
        database_connection: 'failed',
        timestamp: new Date().toISOString(),
      },
    });
  }
});

/**
 * GET /api/analytics/tents
 * Get list of available grow tents with analytics data
 */
router.get('/tents', async (req, res) => {
  const startTime = Date.now();

  try {
    // Get all tents with plant and environment data
    const tentsResult = await query(`
      SELECT
        p.grow_tent,
        COUNT(DISTINCT p.id) as plant_count,
        COUNT(DISTINCT a.analytics_id) as analytics_count,
        COUNT(DISTINCT e.id) as environment_logs_count,
        MAX(e.logged_at) as latest_environment_data,
        MAX(a.calculation_date) as latest_analytics
      FROM plants p
      LEFT JOIN analytics_data a ON p.id = a.plant_id
      LEFT JOIN environment_logs e ON p.grow_tent = e.grow_tent
      WHERE p.grow_tent IS NOT NULL
      GROUP BY p.grow_tent
      ORDER BY p.grow_tent
    `);

    const processingTime = Date.now() - startTime;

    res.json({
      success: true,
      data: tentsResult.rows.map(tent => ({
        name: tent.grow_tent,
        plantCount: parseInt(tent.plant_count),
        analyticsCount: parseInt(tent.analytics_count),
        environmentLogsCount: parseInt(tent.environment_logs_count),
        latestEnvironmentData: tent.latest_environment_data,
        latestAnalytics: tent.latest_analytics,
        hasData: parseInt(tent.analytics_count) > 0 || parseInt(tent.environment_logs_count) > 0,
      })),
      meta: {
        processing_time_ms: processingTime,
      },
    });
  } catch (error) {
    console.error('Error fetching tents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tent data',
    });
  }
});

/**
 * GET /api/analytics/:plantId
 * Get analytics for a specific plant
 */
router.get('/:plantId', async (req, res) => {
  const startTime = Date.now();

  try {
    const plantId = parseInt(req.params.plantId);

    if (isNaN(plantId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plant ID',
      });
    }

    const { limit = 10, since } = req.query;
    const options = {
      limit: parseInt(limit) || 10,
    };

    if (since) {
      options.since = new Date(since);
      if (isNaN(options.since.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid since date format',
        });
      }
    }

    const analytics = await AnalyticsModel.getByPlantId(plantId, options);
    const processingTime = Date.now() - startTime;

    res.json({
      success: true,
      data: analytics,
      meta: {
        plant_id: plantId,
        count: analytics.length,
        processing_time_ms: processingTime,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics data',
    });
  }
});

/**
 * GET /api/analytics/:plantId/latest
 * Get the most recent analytics for a plant
 */
router.get('/:plantId/latest', async (req, res) => {
  const startTime = Date.now();

  try {
    const plantId = parseInt(req.params.plantId);

    if (isNaN(plantId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plant ID',
      });
    }

    const analytics = await AnalyticsModel.getLatest(plantId);
    const processingTime = Date.now() - startTime;

    if (!analytics) {
      return res.status(404).json({
        success: false,
        error: 'No analytics data found for this plant',
      });
    }

    res.json({
      success: true,
      data: analytics,
      meta: {
        plant_id: plantId,
        processing_time_ms: processingTime,
      },
    });
  } catch (error) {
    console.error('Error fetching latest analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch latest analytics',
    });
  }
});

/**
 * GET /api/analytics/:plantId/trends
 * Get trend data for charts and visualizations
 */
router.get('/:plantId/trends', async (req, res) => {
  const startTime = Date.now();

  try {
    const plantId = parseInt(req.params.plantId);

    if (isNaN(plantId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plant ID',
      });
    }

    const { days = 30 } = req.query;
    const daysInt = parseInt(days);

    if (isNaN(daysInt) || daysInt < 1 || daysInt > 365) {
      return res.status(400).json({
        success: false,
        error: 'Days parameter must be between 1 and 365',
      });
    }

    const trends = await AnalyticsModel.getTrends(plantId, daysInt);
    const processingTime = Date.now() - startTime;

    res.json({
      success: true,
      data: trends,
      meta: {
        plant_id: plantId,
        days_analyzed: daysInt,
        processing_time_ms: processingTime,
      },
    });
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trend data',
    });
  }
});

/**
 * POST /api/analytics/:plantId/process
 * Process/reprocess analytics for a plant
 */
router.post('/:plantId/process', async (req, res) => {
  const startTime = Date.now();

  try {
    const plantId = parseInt(req.params.plantId);

    if (isNaN(plantId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plant ID',
      });
    }

    const { force_recalculation = false, start_date, end_date } = req.body;

    const options = {
      forceRecalculation: Boolean(force_recalculation),
    };

    // Validate and set date range if provided
    if (start_date) {
      options.startDate = new Date(start_date);
      if (isNaN(options.startDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid start_date format',
        });
      }
    }

    if (end_date) {
      options.endDate = new Date(end_date);
      if (isNaN(options.endDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid end_date format',
        });
      }
    }

    // Validate date range
    if (options.startDate && options.endDate && options.startDate >= options.endDate) {
      return res.status(400).json({
        success: false,
        error: 'start_date must be before end_date',
      });
    }

    const analytics = await AnalyticsEngine.processHistoricalData(plantId, options);
    const processingTime = Date.now() - startTime;

    res.json({
      success: true,
      data: analytics,
      meta: {
        plant_id: plantId,
        processing_time_ms: processingTime,
        force_recalculation: options.forceRecalculation,
      },
    });
  } catch (error) {
    console.error('Error processing analytics:', error);

    // Handle specific error types
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }

    if (error.message.includes('validation failed')) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to process analytics',
    });
  }
});

/**
 * POST /api/analytics/batch-process
 * Process analytics for multiple plants
 */
router.post('/batch-process', async (req, res) => {
  const startTime = Date.now();

  try {
    const { plant_ids = [], force_recalculation = false, start_date, end_date } = req.body;

    if (!Array.isArray(plant_ids) || plant_ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'plant_ids must be a non-empty array',
      });
    }

    if (plant_ids.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 50 plants can be processed in a batch',
      });
    }

    // Validate all plant IDs are numbers
    const invalidIds = plant_ids.filter(id => isNaN(parseInt(id)));
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Invalid plant IDs: ${invalidIds.join(', ')}`,
      });
    }

    const options = {
      forceRecalculation: Boolean(force_recalculation),
    };

    if (start_date) {
      options.startDate = new Date(start_date);
      if (isNaN(options.startDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid start_date format',
        });
      }
    }

    if (end_date) {
      options.endDate = new Date(end_date);
      if (isNaN(options.endDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid end_date format',
        });
      }
    }

    // Process plants in parallel with limited concurrency
    const results = [];
    const errors = [];
    const concurrencyLimit = 5; // Process 5 plants at a time

    for (let i = 0; i < plant_ids.length; i += concurrencyLimit) {
      const batch = plant_ids.slice(i, i + concurrencyLimit);
      const batchPromises = batch.map(async plantId => {
        try {
          const analytics = await AnalyticsEngine.processHistoricalData(parseInt(plantId), options);
          return { plant_id: plantId, success: true, data: analytics };
        } catch (error) {
          console.error(`Error processing plant ${plantId}:`, error);
          return { plant_id: plantId, success: false, error: error.message };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    // Separate successful and failed results
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    const processingTime = Date.now() - startTime;

    res.json({
      success: true,
      data: {
        successful_count: successful.length,
        failed_count: failed.length,
        results: successful.map(r => r.data),
        errors: failed.map(r => ({ plant_id: r.plant_id, error: r.error })),
      },
      meta: {
        total_plants: plant_ids.length,
        processing_time_ms: processingTime,
        force_recalculation: options.forceRecalculation,
      },
    });
  } catch (error) {
    console.error('Error in batch processing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process batch analytics',
    });
  }
});

/**
 * DELETE /api/analytics/:plantId
 * Delete analytics data for a plant
 */
router.delete('/:plantId', async (req, res) => {
  const startTime = Date.now();

  try {
    const plantId = parseInt(req.params.plantId);

    if (isNaN(plantId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plant ID',
      });
    }

    const { older_than } = req.query;
    let olderThanDate = null;

    if (older_than) {
      olderThanDate = new Date(older_than);
      if (isNaN(olderThanDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid older_than date format',
        });
      }
    }

    const deletedCount = await AnalyticsModel.deleteByPlantId(plantId, olderThanDate);
    const processingTime = Date.now() - startTime;

    res.json({
      success: true,
      data: {
        deleted_count: deletedCount,
      },
      meta: {
        plant_id: plantId,
        processing_time_ms: processingTime,
      },
    });
  } catch (error) {
    console.error('Error deleting analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete analytics data',
    });
  }
});

/**
 * GET /api/analytics/:plantId/deep-dive
 * Get comprehensive deep-dive analytics for a plant
 */
router.get('/:plantId/deep-dive', async (req, res) => {
  const startTime = Date.now();

  try {
    const plantId = parseInt(req.params.plantId);

    if (isNaN(plantId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plant ID',
      });
    }

    // Get comprehensive plant analytics
    const deepDiveData = await AnalyticsEngine.getDeepDiveAnalytics(plantId);
    const processingTime = Date.now() - startTime;

    if (!deepDiveData) {
      return res.status(404).json({
        success: false,
        error: 'No deep-dive analytics data available for this plant',
      });
    }

    res.json({
      success: true,
      data: deepDiveData,
      meta: {
        plant_id: plantId,
        processing_time_ms: processingTime,
      },
    });
  } catch (error) {
    console.error('Error fetching deep-dive analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch deep-dive analytics',
    });
  }
});

/**
 * GET /api/analytics/:plantId/strain-analysis
 * Get strain-specific analytics and genetic potential comparison
 */
router.get('/:plantId/strain-analysis', async (req, res) => {
  const startTime = Date.now();

  try {
    const plantId = parseInt(req.params.plantId);

    if (isNaN(plantId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plant ID',
      });
    }

    // Get strain analysis data
    const strainAnalysis = await AnalyticsEngine.getStrainAnalysis(plantId);
    const processingTime = Date.now() - startTime;

    if (!strainAnalysis) {
      return res.status(404).json({
        success: false,
        error: 'No strain analysis data available for this plant',
      });
    }

    res.json({
      success: true,
      data: strainAnalysis,
      meta: {
        plant_id: plantId,
        processing_time_ms: processingTime,
      },
    });
  } catch (error) {
    console.error('Error fetching strain analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch strain analysis',
    });
  }
});

/**
 * GET /api/analytics/:plantId/growth-timeline
 * Get growth stage progression and milestone tracking
 */
router.get('/:plantId/growth-timeline', async (req, res) => {
  const startTime = Date.now();

  try {
    const plantId = parseInt(req.params.plantId);

    if (isNaN(plantId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plant ID',
      });
    }

    // Get growth timeline data
    const growthTimeline = await AnalyticsEngine.getGrowthTimeline(plantId);
    const processingTime = Date.now() - startTime;

    if (!growthTimeline) {
      return res.status(404).json({
        success: false,
        error: 'No growth timeline data available for this plant',
      });
    }

    res.json({
      success: true,
      data: growthTimeline,
      meta: {
        plant_id: plantId,
        processing_time_ms: processingTime,
      },
    });
  } catch (error) {
    console.error('Error fetching growth timeline:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch growth timeline',
    });
  }
});

/**
 * GET /api/analytics/:plantId/environmental-correlation
 * Get environmental impact correlation analysis
 */
router.get('/:plantId/environmental-correlation', async (req, res) => {
  const startTime = Date.now();

  try {
    const plantId = parseInt(req.params.plantId);

    if (isNaN(plantId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plant ID',
      });
    }

    const { days = 30, metrics } = req.query;
    const daysInt = parseInt(days);

    if (isNaN(daysInt) || daysInt < 7 || daysInt > 365) {
      return res.status(400).json({
        success: false,
        error: 'Days parameter must be between 7 and 365',
      });
    }

    const options = {
      days: daysInt,
      metrics: metrics ? metrics.split(',') : ['temperature', 'humidity', 'vpd', 'light', 'co2'],
    };

    // Get environmental correlation analysis
    const correlationData = await AnalyticsEngine.getEnvironmentalCorrelation(plantId, options);
    const processingTime = Date.now() - startTime;

    if (!correlationData) {
      return res.status(404).json({
        success: false,
        error: 'No environmental correlation data available for this plant',
      });
    }

    res.json({
      success: true,
      data: correlationData,
      meta: {
        plant_id: plantId,
        days_analyzed: daysInt,
        metrics_analyzed: options.metrics,
        processing_time_ms: processingTime,
      },
    });
  } catch (error) {
    console.error('Error fetching environmental correlation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch environmental correlation',
    });
  }
});

/**
 * GET /api/analytics/:plantId/historical-comparison
 * Get historical comparison with previous grows
 */
router.get('/:plantId/historical-comparison', async (req, res) => {
  const startTime = Date.now();

  try {
    const plantId = parseInt(req.params.plantId);

    if (isNaN(plantId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plant ID',
      });
    }

    const { compare_strain = true, compare_medium = true, limit = 5 } = req.query;
    const limitInt = parseInt(limit);

    if (isNaN(limitInt) || limitInt < 1 || limitInt > 20) {
      return res.status(400).json({
        success: false,
        error: 'Limit parameter must be between 1 and 20',
      });
    }

    const options = {
      compareStrain: Boolean(compare_strain),
      compareMedium: Boolean(compare_medium),
      limit: limitInt,
    };

    // Get historical comparison data
    const comparisonData = await AnalyticsEngine.getHistoricalComparison(plantId, options);
    const processingTime = Date.now() - startTime;

    res.json({
      success: true,
      data: comparisonData,
      meta: {
        plant_id: plantId,
        comparison_options: options,
        processing_time_ms: processingTime,
      },
    });
  } catch (error) {
    console.error('Error fetching historical comparison:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch historical comparison',
    });
  }
});

// Helper function to calculate tent-wide averages
function calculateTentAverages(plantAnalytics) {
  const validAnalytics = plantAnalytics.filter(pa => pa.analytics);

  if (validAnalytics.length === 0) {
    return {
      yieldPrediction: 0,
      growthRate: 0,
      environmentalEfficiency: 0,
      plantsWithData: 0,
      totalPlants: plantAnalytics.length,
    };
  }

  const totals = validAnalytics.reduce(
    (acc, pa) => {
      const analytics = pa.analytics;
      acc.yieldPrediction += analytics.yield_prediction || 0;
      acc.growthRate += analytics.growth_rate || 0;
      acc.environmentalEfficiency += analytics.environmental_efficiency?.overall_score || 0;
      return acc;
    },
    { yieldPrediction: 0, growthRate: 0, environmentalEfficiency: 0 }
  );

  return {
    yieldPrediction: Math.round(totals.yieldPrediction / validAnalytics.length),
    growthRate: Math.round((totals.growthRate / validAnalytics.length) * 100) / 100,
    environmentalEfficiency:
      Math.round((totals.environmentalEfficiency / validAnalytics.length) * 100) / 100,
    plantsWithData: validAnalytics.length,
    totalPlants: plantAnalytics.length,
  };
}

module.exports = router;
