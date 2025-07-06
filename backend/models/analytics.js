const { query } = require('../config/database');

/**
 * Analytics Data Model
 * Handles analytics data operations with cannabis-specific calculations
 */

class AnalyticsModel {

  /**
   * Create new analytics record
   * @param {Object} analyticsData - Analytics data object
   * @param {number} analyticsData.plant_id - Plant ID
   * @param {number} analyticsData.yield_prediction - Predicted yield in grams
   * @param {number} analyticsData.growth_rate - Growth rate (cm/day or similar metric)
   * @param {Object} analyticsData.environmental_efficiency - Environmental efficiency scores
   * @param {Object} analyticsData.recommendations - AI-generated recommendations
   * @returns {Object} Created analytics record
   */
  static async create(analyticsData) {
    const validatedData = this.validateAnalyticsData(analyticsData);

    const result = await query(`
      INSERT INTO analytics_data (
        plant_id,
        yield_prediction,
        growth_rate,
        environmental_efficiency,
        recommendations,
        calculation_date
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      validatedData.plant_id,
      validatedData.yield_prediction,
      validatedData.growth_rate,
      JSON.stringify(validatedData.environmental_efficiency),
      JSON.stringify(validatedData.recommendations),
      validatedData.calculation_date || new Date()
    ]);

    return result.rows[0];
  }

  /**
   * Get analytics for a specific plant
   * @param {number} plantId - Plant ID
   * @param {Object} options - Query options
   * @param {number} options.limit - Limit results (default: 10)
   * @param {Date} options.since - Get analytics since this date
   * @returns {Array} Analytics records
   */
  static async getByPlantId(plantId, options = {}) {
    const { limit = 10, since } = options;

    let queryText = `
      SELECT
        analytics_id,
        plant_id,
        calculation_date,
        yield_prediction,
        growth_rate,
        environmental_efficiency,
        recommendations,
        created_at,
        updated_at
      FROM analytics_data
      WHERE plant_id = $1
    `;

    const params = [plantId];

    if (since) {
      queryText += ` AND calculation_date >= $2`;
      params.push(since);
    }

    queryText += ` ORDER BY calculation_date DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await query(queryText, params);
    return result.rows.map(this.formatAnalyticsRecord);
  }

  /**
   * Get latest analytics for a plant
   * @param {number} plantId - Plant ID
   * @returns {Object|null} Latest analytics record
   */
  static async getLatest(plantId) {
    const result = await query(`
      SELECT
        analytics_id,
        plant_id,
        calculation_date,
        yield_prediction,
        growth_rate,
        environmental_efficiency,
        recommendations,
        created_at,
        updated_at
      FROM analytics_data
      WHERE plant_id = $1
      ORDER BY calculation_date DESC
      LIMIT 1
    `, [plantId]);

    return result.rows[0] ? this.formatAnalyticsRecord(result.rows[0]) : null;
  }

  /**
   * Get analytics trends for dashboard charts
   * @param {number} plantId - Plant ID
   * @param {number} days - Number of days to look back (default: 30)
   * @returns {Object} Trend data for charts
   */
  static async getTrends(plantId, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const result = await query(`
      SELECT
        calculation_date,
        yield_prediction,
        growth_rate,
        environmental_efficiency
      FROM analytics_data
      WHERE plant_id = $1
        AND calculation_date >= $2
      ORDER BY calculation_date ASC
    `, [plantId, since]);

    return {
      yieldTrend: result.rows.map(row => ({
        date: row.calculation_date,
        value: parseFloat(row.yield_prediction) || 0
      })),
      growthTrend: result.rows.map(row => ({
        date: row.calculation_date,
        value: parseFloat(row.growth_rate) || 0
      })),
      environmentalTrend: result.rows.map(row => ({
        date: row.calculation_date,
        efficiency: row.environmental_efficiency?.overall_score || 0
      }))
    };
  }

  /**
   * Delete analytics records for a plant
   * @param {number} plantId - Plant ID
   * @param {Date} olderThan - Delete records older than this date (optional)
   * @returns {number} Number of deleted records
   */
  static async deleteByPlantId(plantId, olderThan = null) {
    let queryText = 'DELETE FROM analytics_data WHERE plant_id = $1';
    const params = [plantId];

    if (olderThan) {
      queryText += ' AND calculation_date < $2';
      params.push(olderThan);
    }

    const result = await query(queryText, params);
    return result.rowCount;
  }

  /**
   * Validate analytics data with cannabis-specific rules
   * @param {Object} data - Analytics data to validate
   * @returns {Object} Validated data
   * @throws {Error} If validation fails
   */
  static validateAnalyticsData(data) {
    const errors = [];

    // Required fields
    if (!data.plant_id || typeof data.plant_id !== 'number') {
      errors.push('plant_id is required and must be a number');
    }

    // Yield prediction validation (cannabis-specific ranges)
    if (data.yield_prediction !== null && data.yield_prediction !== undefined) {
      const yield_prediction = parseFloat(data.yield_prediction);
      if (isNaN(yield_prediction) || yield_prediction < 0 || yield_prediction > 2000) {
        errors.push('yield_prediction must be between 0 and 2000 grams');
      }
      data.yield_prediction = yield_prediction;
    }

    // Growth rate validation (cannabis-specific ranges)
    if (data.growth_rate !== null && data.growth_rate !== undefined) {
      const growth_rate = parseFloat(data.growth_rate);
      if (isNaN(growth_rate) || growth_rate < 0 || growth_rate > 10) {
        errors.push('growth_rate must be between 0 and 10 cm/day');
      }
      data.growth_rate = growth_rate;
    }

    // Environmental efficiency validation
    if (data.environmental_efficiency) {
      data.environmental_efficiency = this.validateEnvironmentalEfficiency(data.environmental_efficiency);
    }

    // Recommendations validation
    if (data.recommendations) {
      data.recommendations = this.validateRecommendations(data.recommendations);
    }

    if (errors.length > 0) {
      throw new Error(`Analytics validation failed: ${errors.join(', ')}`);
    }

    return data;
  }

  /**
   * Validate environmental efficiency object
   * @param {Object} efficiency - Environmental efficiency data
   * @returns {Object} Validated efficiency object
   */
  static validateEnvironmentalEfficiency(efficiency) {
    const validated = {
      overall_score: 0,
      vpd_efficiency: 0,
      temperature_stability: 0,
      humidity_control: 0,
      light_efficiency: 0
    };

    // Validate scores are between 0 and 1
    Object.keys(validated).forEach(key => {
      if (efficiency[key] !== undefined) {
        const score = parseFloat(efficiency[key]);
        if (!isNaN(score) && score >= 0 && score <= 1) {
          validated[key] = score;
        }
      }
    });

    return validated;
  }

  /**
   * Validate recommendations array
   * @param {Array} recommendations - Array of recommendation objects
   * @returns {Array} Validated recommendations
   */
  static validateRecommendations(recommendations) {
    if (!Array.isArray(recommendations)) {
      return [];
    }

    return recommendations.filter(rec => {
      return rec &&
             typeof rec.type === 'string' &&
             typeof rec.message === 'string' &&
             rec.message.length > 0 &&
             rec.message.length <= 500; // Reasonable message length limit
    }).map(rec => ({
      type: rec.type,
      message: rec.message,
      priority: rec.priority || 'medium',
      confidence: Math.min(Math.max(parseFloat(rec.confidence) || 0, 0), 1)
    }));
  }

  /**
   * Format analytics record for API response
   * @param {Object} record - Raw database record
   * @returns {Object} Formatted record
   */
  static formatAnalyticsRecord(record) {
    return {
      analytics_id: record.analytics_id,
      plant_id: record.plant_id,
      calculation_date: record.calculation_date,
      yield_prediction: parseFloat(record.yield_prediction) || null,
      growth_rate: parseFloat(record.growth_rate) || null,
      environmental_efficiency: record.environmental_efficiency || {},
      recommendations: record.recommendations || [],
      created_at: record.created_at,
      updated_at: record.updated_at
    };
  }

  /**
   * Calculate cannabis-specific growth stage efficiency
   * @param {string} growthStage - Current growth stage
   * @param {Object} environmentalData - Environmental readings
   * @returns {Object} Stage-specific efficiency scores
   */
  static calculateStageEfficiency(growthStage, environmentalData) {
    const { temperature, humidity, vpd, ppfd } = environmentalData;

    // Cannabis-specific optimal ranges by growth stage
    const optimalRanges = {
      seedling: {
        temperature: { min: 70, max: 75, optimal: 72.5 },
        humidity: { min: 65, max: 70, optimal: 67.5 },
        vpd: { min: 0.4, max: 0.8, optimal: 0.6 },
        ppfd: { min: 200, max: 400, optimal: 300 }
      },
      vegetative: {
        temperature: { min: 70, max: 85, optimal: 77.5 },
        humidity: { min: 40, max: 60, optimal: 50 },
        vpd: { min: 0.8, max: 1.2, optimal: 1.0 },
        ppfd: { min: 400, max: 600, optimal: 500 }
      },
      flowering: {
        temperature: { min: 65, max: 80, optimal: 72.5 },
        humidity: { min: 30, max: 50, optimal: 40 },
        vpd: { min: 0.8, max: 1.2, optimal: 1.0 },
        ppfd: { min: 600, max: 1000, optimal: 800 }
      }
    };

    const ranges = optimalRanges[growthStage] || optimalRanges.vegetative;

    // Calculate efficiency for each parameter (0-1 scale)
    const calculateParameterEfficiency = (value, range) => {
      if (value >= range.min && value <= range.max) {
        // Calculate how close to optimal
        const distanceFromOptimal = Math.abs(value - range.optimal);
        const maxDistance = Math.max(range.optimal - range.min, range.max - range.optimal);
        return 1 - (distanceFromOptimal / maxDistance);
      }
      return 0; // Outside acceptable range
    };

    const efficiency = {
      temperature_efficiency: temperature ? calculateParameterEfficiency(temperature, ranges.temperature) : 0,
      humidity_efficiency: humidity ? calculateParameterEfficiency(humidity, ranges.humidity) : 0,
      vpd_efficiency: vpd ? calculateParameterEfficiency(vpd, ranges.vpd) : 0,
      light_efficiency: ppfd ? calculateParameterEfficiency(ppfd, ranges.ppfd) : 0
    };

    // Calculate overall efficiency as weighted average
    efficiency.overall_score = (
      efficiency.temperature_efficiency * 0.25 +
      efficiency.humidity_efficiency * 0.25 +
      efficiency.vpd_efficiency * 0.3 +  // VPD is most important for cannabis
      efficiency.light_efficiency * 0.2
    );

    return efficiency;
  }
}

module.exports = AnalyticsModel;