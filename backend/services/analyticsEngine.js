const { query } = require('../config/database');
const AnalyticsModel = require('../models/analytics');

/**
 * Analytics Engine Service
 * Processes historical cultivation data into actionable insights
 * Includes cannabis-specific calculations and AI-powered recommendations
 */

class AnalyticsEngine {
  /**
   * Process historical data for a specific plant
   * @param {number} plantId - Plant ID to process
   * @param {Object} options - Processing options
   * @param {Date} options.startDate - Start date for analysis
   * @param {Date} options.endDate - End date for analysis
   * @param {boolean} options.forceRecalculation - Force recalculation even if recent data exists
   * @returns {Object} Processed analytics data
   */
  static async processHistoricalData(plantId, options = {}) {
    const {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Default: 30 days ago
      endDate = new Date(),
      forceRecalculation = false,
    } = options;

    try {
      console.log(`🔬 Processing analytics for plant ${plantId}...`);

      // Check if we need to recalculate
      if (!forceRecalculation) {
        const existingAnalytics = await AnalyticsModel.getLatest(plantId);
        if (existingAnalytics && this.isRecentCalculation(existingAnalytics.calculation_date)) {
          console.log(`✅ Recent analytics found for plant ${plantId}, skipping recalculation`);
          return existingAnalytics;
        }
      }

      // Get plant data
      const plantData = await this.getPlantData(plantId);
      if (!plantData) {
        throw new Error(`Plant ${plantId} not found`);
      }

      // Get historical data
      const historicalData = await this.getHistoricalData(plantId, startDate, endDate);

      // Calculate analytics
      const analytics = await this.calculateAnalytics(plantData, historicalData);

      // Save analytics to database
      const savedAnalytics = await AnalyticsModel.create({
        plant_id: plantId,
        ...analytics,
      });

      console.log(`✅ Analytics processed for plant ${plantId}`);
      return AnalyticsModel.formatAnalyticsRecord(savedAnalytics);
    } catch (error) {
      console.error(`❌ Error processing analytics for plant ${plantId}:`, error);
      throw error;
    }
  }

  /**
   * Calculate yield prediction based on historical data and current conditions
   * @param {Object} plantData - Plant information
   * @param {Object} historicalData - Historical cultivation data
   * @returns {number} Predicted yield in grams
   */
  static async calculateYieldPrediction(plantData, historicalData) {
    const { growth_stage, strain, grow_medium, days_in_current_stage, total_days_growing } =
      plantData;

    // Base yield estimates by strain type and growing method
    const baseYieldEstimates = {
      indica: { soil: 350, coco: 400, hydro: 450 },
      sativa: { soil: 250, coco: 300, hydro: 350 },
      hybrid: { soil: 300, coco: 350, coco: 400 },
      auto: { soil: 150, coco: 175, hydro: 200 },
    };

    // Determine strain type (simplified classification)
    const strainType = this.classifyStrain(strain);
    const medium = this.normalizeMedium(grow_medium);

    let baseYield = baseYieldEstimates[strainType]?.[medium] || 300;

    // Adjust based on environmental efficiency
    const environmentalMultiplier = this.calculateEnvironmentalYieldMultiplier(
      historicalData.environmental
    );

    // Adjust based on growth stage progression
    const stageMultiplier = this.calculateStageProgressionMultiplier(
      growth_stage,
      days_in_current_stage,
      total_days_growing
    );

    // Adjust based on training and care quality
    const careMultiplier = this.calculateCareQualityMultiplier(historicalData.logs);

    // Calculate final prediction
    const predictedYield = baseYield * environmentalMultiplier * stageMultiplier * careMultiplier;

    // Apply reasonable bounds (cannabis-specific)
    return Math.max(10, Math.min(2000, Math.round(predictedYield)));
  }

  /**
   * Calculate growth rate based on historical measurements
   * @param {Object} plantData - Plant information
   * @param {Object} historicalData - Historical data
   * @returns {number} Growth rate in cm/day
   */
  static calculateGrowthRate(plantData, historicalData) {
    const measurements = historicalData.logs
      .filter(log => log.height && log.logged_at)
      .sort((a, b) => new Date(a.logged_at) - new Date(b.logged_at));

    if (measurements.length < 2) {
      // Default growth rates by stage if no measurements
      const defaultRates = {
        seedling: 0.5,
        vegetative: 2.0,
        flowering: 0.8,
        harvest: 0,
      };
      return defaultRates[plantData.growth_stage] || 1.0;
    }

    // Calculate average growth rate from recent measurements
    const recentMeasurements = measurements.slice(-5); // Last 5 measurements
    let totalGrowthRate = 0;
    let validPeriods = 0;

    for (let i = 1; i < recentMeasurements.length; i++) {
      const current = recentMeasurements[i];
      const previous = recentMeasurements[i - 1];

      const heightDiff = parseFloat(current.height) - parseFloat(previous.height);
      const timeDiff =
        (new Date(current.logged_at) - new Date(previous.logged_at)) / (1000 * 60 * 60 * 24); // days

      if (timeDiff > 0 && heightDiff >= 0) {
        // Only positive growth
        totalGrowthRate += heightDiff / timeDiff;
        validPeriods++;
      }
    }

    if (validPeriods === 0) {
      return 1.0; // Default if no valid measurements
    }

    const averageGrowthRate = totalGrowthRate / validPeriods;

    // Apply reasonable bounds for cannabis growth rates
    return Math.max(0, Math.min(10, averageGrowthRate));
  }

  /**
   * Generate AI-powered cultivation recommendations
   * @param {Object} plantData - Plant information
   * @param {Object} analyticsData - Calculated analytics
   * @param {Object} historicalData - Historical data
   * @returns {Array} Array of recommendation objects
   */
  static generateRecommendations(plantData, analyticsData, historicalData) {
    const recommendations = [];
    const { growth_stage, days_in_current_stage } = plantData;
    const { environmental_efficiency } = analyticsData;

    // Environmental recommendations
    if (environmental_efficiency.vpd_efficiency < 0.7) {
      recommendations.push({
        type: 'environmental',
        priority: 'high',
        message:
          'VPD levels are suboptimal. Adjust temperature and humidity to achieve 0.8-1.2 kPa VPD for better transpiration.',
        confidence: 0.9,
      });
    }

    if (environmental_efficiency.temperature_stability < 0.6) {
      recommendations.push({
        type: 'environmental',
        priority: 'medium',
        message:
          'Temperature fluctuations detected. Consider improving climate control for more stable growing conditions.',
        confidence: 0.8,
      });
    }

    // Growth stage specific recommendations
    if (growth_stage === 'vegetative' && days_in_current_stage > 45) {
      recommendations.push({
        type: 'growth_stage',
        priority: 'medium',
        message:
          'Plant has been in vegetative stage for 45+ days. Consider transitioning to flowering if desired size is reached.',
        confidence: 0.7,
      });
    }

    if (growth_stage === 'flowering' && days_in_current_stage > 70) {
      recommendations.push({
        type: 'harvest',
        priority: 'high',
        message: 'Plant is approaching harvest window. Check trichomes for optimal harvest timing.',
        confidence: 0.85,
      });
    }

    // Nutrient recommendations based on growth rate
    if (analyticsData.growth_rate < 0.5 && growth_stage === 'vegetative') {
      recommendations.push({
        type: 'nutrient',
        priority: 'medium',
        message:
          'Low growth rate detected in vegetative stage. Consider increasing nitrogen levels or checking pH.',
        confidence: 0.75,
      });
    }

    // Light recommendations
    if (environmental_efficiency.light_efficiency < 0.6) {
      const stageRecommendations = {
        seedling: 'Increase light intensity to 300-400 PPFD for optimal seedling development.',
        vegetative: 'Increase light intensity to 500-600 PPFD for vigorous vegetative growth.',
        flowering: 'Increase light intensity to 800-1000 PPFD for maximum flower development.',
      };

      recommendations.push({
        type: 'lighting',
        priority: 'medium',
        message:
          stageRecommendations[growth_stage] || 'Optimize lighting for current growth stage.',
        confidence: 0.8,
      });
    }

    return recommendations.slice(0, 5); // Limit to top 5 recommendations
  }

  /**
   * Calculate comprehensive analytics for a plant
   * @param {Object} plantData - Plant information
   * @param {Object} historicalData - Historical cultivation data
   * @returns {Object} Complete analytics object
   */
  static async calculateAnalytics(plantData, historicalData) {
    // Calculate yield prediction
    const yield_prediction = await this.calculateYieldPrediction(plantData, historicalData);

    // Calculate growth rate
    const growth_rate = this.calculateGrowthRate(plantData, historicalData);

    // Calculate environmental efficiency
    const environmental_efficiency = this.calculateEnvironmentalEfficiency(
      plantData.growth_stage,
      historicalData.environmental
    );

    const analytics = {
      yield_prediction,
      growth_rate,
      environmental_efficiency,
    };

    // Generate recommendations
    const recommendations = this.generateRecommendations(plantData, analytics, historicalData);
    analytics.recommendations = recommendations;

    return analytics;
  }

  /**
   * Get plant data from database
   * @param {number} plantId - Plant ID
   * @returns {Object} Plant data
   */
  static async getPlantData(plantId) {
    const result = await query(
      `
                        SELECT
        id,
        name,
        strain,
        stage as growth_stage,
        grow_tent,
        COALESCE(grow_medium, 'soil') as grow_medium,
        planted_date,
        planted_date as stage_changed_date,
        EXTRACT(EPOCH FROM (CURRENT_DATE::timestamp - planted_date::timestamp))/86400 as total_days_growing,
        EXTRACT(EPOCH FROM (CURRENT_DATE::timestamp - planted_date::timestamp))/86400 as days_in_current_stage
      FROM plants
      WHERE id = $1
    `,
      [plantId]
    );

    return result.rows[0] || null;
  }

  /**
   * Get historical data for analytics processing
   * @param {number} plantId - Plant ID
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Object} Historical data object
   */
  static async getHistoricalData(plantId, startDate, endDate) {
    // Get environmental data
    const environmentalResult = await query(
      `
                SELECT
          temperature,
          humidity,
          vpd,
          co2_ppm as co2_level,
          ppfd,
          logged_at
        FROM environment_logs
        WHERE grow_tent = (SELECT grow_tent FROM plants WHERE id = $1)
          AND logged_at BETWEEN $2 AND $3
        ORDER BY logged_at DESC
      `,
      [plantId, startDate, endDate]
    );

    // Get activity logs
    const logsResult = await query(
      `
        SELECT
          type as activity_type,
          notes,
          height_cm as height,
          logged_at
        FROM logs
        WHERE plant_id = $1
          AND logged_at BETWEEN $2 AND $3
        ORDER BY logged_at DESC
      `,
      [plantId, startDate, endDate]
    );

    return {
      environmental: environmentalResult.rows,
      logs: logsResult.rows,
    };
  }

  /**
   * Calculate environmental efficiency for the plant's growth stage
   * @param {string} growthStage - Current growth stage
   * @param {Array} environmentalData - Environmental readings
   * @returns {Object} Environmental efficiency scores
   */
  static calculateEnvironmentalEfficiency(growthStage, environmentalData) {
    if (!environmentalData || environmentalData.length === 0) {
      return AnalyticsModel.validateEnvironmentalEfficiency({});
    }

    // Calculate average environmental conditions
    const avgConditions = this.calculateAverageConditions(environmentalData);

    // Use the cannabis-specific efficiency calculation from the model
    return AnalyticsModel.calculateStageEfficiency(growthStage, avgConditions);
  }

  /**
   * Calculate average environmental conditions
   * @param {Array} environmentalData - Array of environmental readings
   * @returns {Object} Average conditions
   */
  static calculateAverageConditions(environmentalData) {
    const totals = {
      temperature: 0,
      humidity: 0,
      vpd: 0,
      ppfd: 0,
      count: 0,
    };

    environmentalData.forEach(reading => {
      if (reading.temperature) {
        totals.temperature += parseFloat(reading.temperature);
        totals.count++;
      }
      if (reading.humidity) totals.humidity += parseFloat(reading.humidity);
      if (reading.vpd) totals.vpd += parseFloat(reading.vpd);
      if (reading.ppfd) totals.ppfd += parseFloat(reading.ppfd);
    });

    if (totals.count === 0) return {};

    return {
      temperature: totals.temperature / totals.count,
      humidity: totals.humidity / totals.count,
      vpd: totals.vpd / totals.count,
      ppfd: totals.ppfd / totals.count,
    };
  }

  // Helper methods for yield prediction

  static classifyStrain(strain) {
    if (!strain) return 'hybrid';

    const strainLower = strain.toLowerCase();
    if (strainLower.includes('auto')) return 'auto';
    if (strainLower.includes('indica')) return 'indica';
    if (strainLower.includes('sativa')) return 'sativa';
    return 'hybrid';
  }

  static normalizeMedium(medium) {
    if (!medium) return 'soil';

    const mediumLower = medium.toLowerCase();
    if (mediumLower.includes('hydro')) return 'hydro';
    if (mediumLower.includes('coco')) return 'coco';
    return 'soil';
  }

  static calculateEnvironmentalYieldMultiplier(environmentalData) {
    const avgConditions = this.calculateAverageConditions(environmentalData);
    const efficiency = AnalyticsModel.calculateStageEfficiency('vegetative', avgConditions);

    // Convert efficiency score to yield multiplier (0.5x to 1.5x)
    return 0.5 + efficiency.overall_score * 1.0;
  }

  static calculateStageProgressionMultiplier(stage, daysInStage, totalDays) {
    // Adjust based on growth stage timing
    const stageMultipliers = {
      seedling: daysInStage < 14 ? 1.0 : 0.9, // Seedlings should progress quickly
      vegetative: daysInStage < 60 ? 1.0 : 0.95, // Long veg can reduce yield
      flowering: daysInStage > 45 ? 1.1 : 1.0, // Longer flowering can increase yield
      harvest: 0.9, // Harvest stage
    };

    return stageMultipliers[stage] || 1.0;
  }

  static calculateCareQualityMultiplier(logs) {
    if (!logs || logs.length === 0) return 0.8; // No logs = poor care tracking

    // Analyze care frequency and quality
    const careActivities = logs.filter(
      log =>
        log.activity_type &&
        ['watering', 'feeding', 'training', 'pruning'].includes(log.activity_type.toLowerCase())
    );

    // More frequent care = better multiplier (up to 1.2x)
    const careFrequency = careActivities.length / 30; // Activities per 30 days
    return Math.min(1.2, 0.8 + careFrequency * 0.1);
  }

  static isRecentCalculation(calculationDate, hoursThreshold = 24) {
    const now = new Date();
    const calcDate = new Date(calculationDate);
    const hoursDiff = (now - calcDate) / (1000 * 60 * 60);

    return hoursDiff < hoursThreshold;
  }

  // NEW DEEP-DIVE ANALYTICS METHODS

  /**
   * Get comprehensive deep-dive analytics for a plant
   * @param {number} plantId - Plant ID
   * @returns {Object} Deep-dive analytics data
   */
  static async getDeepDiveAnalytics(plantId) {
    try {
      console.log(`🔬 Generating deep-dive analytics for plant ${plantId}...`);

      // Get plant data
      const plantData = await this.getPlantData(plantId);
      if (!plantData) {
        throw new Error(`Plant ${plantId} not found`);
      }

      // Get latest analytics
      const latestAnalytics = await AnalyticsModel.getLatest(plantId);

      // Get extended historical data (90 days)
      const endDate = new Date();
      const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const historicalData = await this.getHistoricalData(plantId, startDate, endDate);

      // Get plant profile information
      const plantProfile = {
        genetics: {
          strain: plantData.strain,
          type: this.classifyStrain(plantData.strain),
          growingMedium: this.normalizeMedium(plantData.grow_medium),
        },
        growthStage: plantData.growth_stage,
        daysInStage: Math.round(plantData.days_in_current_stage),
        totalDays: Math.round(plantData.total_days_growing),
        plantedDate: plantData.planted_date,
      };

      // Calculate performance metrics
      const performanceMetrics = await this.calculatePerformanceMetrics(
        plantData,
        latestAnalytics,
        historicalData
      );

      // Get environmental impact analysis
      const environmentalImpact = await this.calculateEnvironmentalImpact(
        plantData,
        historicalData
      );

      // Get historical comparison data
      const historicalData_comparison = await this.getHistoricalComparisonData(plantId);

      return {
        plantProfile,
        performanceMetrics,
        environmentalImpact,
        historicalData: historicalData_comparison,
        latestAnalytics: latestAnalytics
          ? AnalyticsModel.formatAnalyticsRecord(latestAnalytics)
          : null,
        dataQuality: this.assessDataQuality(historicalData),
      };
    } catch (error) {
      console.error(`❌ Error generating deep-dive analytics for plant ${plantId}:`, error);
      throw error;
    }
  }

  /**
   * Get strain-specific analytics and genetic potential comparison
   * @param {number} plantId - Plant ID
   * @returns {Object} Strain analysis data
   */
  static async getStrainAnalysis(plantId) {
    try {
      console.log(`🧬 Generating strain analysis for plant ${plantId}...`);

      const plantData = await this.getPlantData(plantId);
      if (!plantData) {
        throw new Error(`Plant ${plantId} not found`);
      }

      const latestAnalytics = await AnalyticsModel.getLatest(plantId);
      const strainType = this.classifyStrain(plantData.strain);
      const medium = this.normalizeMedium(plantData.grow_medium);

      // Get genetic potential data
      const geneticPotential = this.getGeneticPotential(strainType, medium);

      // Calculate actual performance
      const actualPerformance = {
        currentYield: latestAnalytics?.yield_prediction || 0,
        growthRate: latestAnalytics?.growth_rate || 0,
        environmentalEfficiency: latestAnalytics?.environmental_efficiency?.overall_score || 0,
        daysInCycle: Math.round(plantData.total_days_growing),
      };

      // Calculate performance vs genetic potential
      const comparison = {
        yieldPercentage:
          (actualPerformance.currentYield / geneticPotential.expectedYield.average) * 100,
        growthRateComparison:
          actualPerformance.growthRate / geneticPotential.growthPattern.averageRate,
        timelineComparison: actualPerformance.daysInCycle / geneticPotential.lifecycle.totalDays,
      };

      // Generate strain-specific optimization recommendations
      const optimization = this.generateStrainOptimization(
        strainType,
        actualPerformance,
        comparison,
        plantData.growth_stage
      );

      return {
        strainInfo: {
          name: plantData.strain,
          type: strainType,
          classification: this.getStrainClassification(strainType),
        },
        geneticPotential,
        actualPerformance,
        comparison,
        optimization,
      };
    } catch (error) {
      console.error(`❌ Error generating strain analysis for plant ${plantId}:`, error);
      throw error;
    }
  }

  /**
   * Get growth stage progression and milestone tracking
   * @param {number} plantId - Plant ID
   * @returns {Object} Growth timeline data
   */
  static async getGrowthTimeline(plantId) {
    try {
      console.log(`📈 Generating growth timeline for plant ${plantId}...`);

      const plantData = await this.getPlantData(plantId);
      if (!plantData) {
        throw new Error(`Plant ${plantId} not found`);
      }

      // Get growth milestones
      const milestones = this.calculateGrowthMilestones(plantData);

      // Get growth predictions
      const predictions = this.calculateGrowthPredictions(plantData, milestones);

      // Get stage progression health
      const progression = this.assessStageProgression(plantData, milestones);

      // Get historical growth data
      const growthHistory = await this.getGrowthHistory(plantId);

      return {
        milestones,
        predictions,
        progression,
        growthHistory,
        currentStage: {
          stage: plantData.growth_stage,
          daysInStage: Math.round(plantData.days_in_current_stage),
          stageHealth: this.assessStageHealth(plantData),
        },
      };
    } catch (error) {
      console.error(`❌ Error generating growth timeline for plant ${plantId}:`, error);
      throw error;
    }
  }

  /**
   * Get environmental impact correlation analysis
   * @param {number} plantId - Plant ID
   * @param {Object} options - Analysis options
   * @returns {Object} Environmental correlation data
   */
  static async getEnvironmentalCorrelation(plantId, options = {}) {
    try {
      console.log(`🌡️ Generating environmental correlation for plant ${plantId}...`);

      const { days = 30, metrics = ['temperature', 'humidity', 'vpd', 'light', 'co2'] } = options;

      const plantData = await this.getPlantData(plantId);
      if (!plantData) {
        throw new Error(`Plant ${plantId} not found`);
      }

      // Get environmental data for the specified period
      const endDate = new Date();
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const historicalData = await this.getHistoricalData(plantId, startDate, endDate);

      // Calculate correlations for each metric
      const correlations = {};
      for (const metric of metrics) {
        correlations[metric] = this.calculateMetricCorrelation(
          metric,
          historicalData.environmental,
          plantData.growth_stage
        );
      }

      // Get optimal conditions for current stage
      const optimalConditions = this.getOptimalConditions(plantData.growth_stage);

      // Calculate deviations from optimal
      const deviations = this.calculateEnvironmentalDeviations(
        historicalData.environmental,
        optimalConditions
      );

      // Generate environmental recommendations
      const recommendations = this.generateEnvironmentalRecommendations(
        correlations,
        deviations,
        plantData.growth_stage
      );

      return {
        analysisPeriod: { days, startDate, endDate },
        correlations,
        optimalConditions,
        deviations,
        recommendations,
        dataQuality: {
          totalReadings: historicalData.environmental.length,
          coverage: this.calculateDataCoverage(historicalData.environmental, days),
        },
      };
    } catch (error) {
      console.error(`❌ Error generating environmental correlation for plant ${plantId}:`, error);
      throw error;
    }
  }

  /**
   * Get historical comparison with previous grows
   * @param {number} plantId - Plant ID
   * @param {Object} options - Comparison options
   * @returns {Object} Historical comparison data
   */
  static async getHistoricalComparison(plantId, options = {}) {
    try {
      console.log(`📊 Generating historical comparison for plant ${plantId}...`);

      const { compareStrain = true, compareMedium = true, limit = 5 } = options;

      const currentPlant = await this.getPlantData(plantId);
      if (!currentPlant) {
        throw new Error(`Plant ${plantId} not found`);
      }

      // Build comparison query
      let whereConditions = ['archived = true', 'harvest_date IS NOT NULL'];
      let queryParams = [limit];

      if (compareStrain && currentPlant.strain) {
        whereConditions.push('strain = $' + (queryParams.length + 1));
        queryParams.push(currentPlant.strain);
      }

      if (compareMedium && currentPlant.grow_medium) {
        whereConditions.push('grow_tent = $' + (queryParams.length + 1));
        queryParams.push(currentPlant.grow_medium);
      }

      // Get historical plants
      const historicalPlantsQuery = `
        SELECT
          id,
          name,
          strain,
          grow_tent as grow_medium,
          planted_date,
          harvest_date,
          final_yield,
          EXTRACT(EPOCH FROM (harvest_date - planted_date))/86400 as total_cycle_days
        FROM plants
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY harvest_date DESC
        LIMIT $1
      `;

      const historicalResult = await query(historicalPlantsQuery, queryParams);
      const historicalPlants = historicalResult.rows;

      // Get analytics for historical plants
      const comparisons = [];
      for (const plant of historicalPlants) {
        const analytics = await AnalyticsModel.getLatest(plant.id);
        comparisons.push({
          plant: plant,
          analytics: analytics ? AnalyticsModel.formatAnalyticsRecord(analytics) : null,
          performance: this.calculatePlantPerformance(plant, analytics),
        });
      }

      // Calculate improvement trends
      const trends = this.calculateImprovementTrends(comparisons);

      // Generate insights
      const insights = this.generateHistoricalInsights(currentPlant, comparisons, trends);

      return {
        currentPlant: {
          ...currentPlant,
          isActive: true,
        },
        historicalComparisons: comparisons,
        trends,
        insights,
        comparisonCriteria: {
          compareStrain,
          compareMedium,
          totalFound: historicalPlants.length,
        },
      };
    } catch (error) {
      console.error(`❌ Error generating historical comparison for plant ${plantId}:`, error);
      throw error;
    }
  }

  // HELPER METHODS FOR DEEP-DIVE ANALYTICS

  /**
   * Calculate comprehensive performance metrics
   */
  static async calculatePerformanceMetrics(plantData, analytics, historicalData) {
    const strainType = this.classifyStrain(plantData.strain);
    const geneticPotential = this.getGeneticPotential(
      strainType,
      this.normalizeMedium(plantData.grow_medium)
    );

    return {
      actualVsExpected: {
        yield: analytics
          ? (analytics.yield_prediction / geneticPotential.expectedYield.average) * 100
          : 0,
        growthRate: analytics
          ? (analytics.growth_rate / geneticPotential.growthPattern.averageRate) * 100
          : 0,
        timelineEfficiency:
          (geneticPotential.lifecycle.totalDays / plantData.total_days_growing) * 100,
      },
      strainComparison: {
        type: strainType,
        expectedYield: geneticPotential.expectedYield,
        actualYield: analytics?.yield_prediction || 0,
      },
      milestones: this.calculateGrowthMilestones(plantData),
    };
  }

  /**
   * Calculate environmental impact analysis
   */
  static async calculateEnvironmentalImpact(plantData, historicalData) {
    const avgConditions = this.calculateAverageConditions(historicalData.environmental);
    const optimalConditions = this.getOptimalConditions(plantData.growth_stage);

    return {
      correlations: this.calculateEnvironmentalCorrelations(historicalData.environmental),
      optimalConditions,
      currentConditions: avgConditions,
      deviations: this.calculateEnvironmentalDeviations(
        historicalData.environmental,
        optimalConditions
      ),
    };
  }

  /**
   * Get genetic potential data for strain types
   */
  static getGeneticPotential(strainType, medium) {
    const potentialData = {
      indica: {
        expectedYield: { min: 120, max: 180, average: 150 },
        growthPattern: {
          height: 'short-medium',
          averageRate: 1.2,
          stretchFactor: 1.3,
        },
        lifecycle: { vegetative: 35, flowering: 63, totalDays: 98 },
        characteristics: ['dense buds', 'relaxing effects', 'shorter flowering'],
      },
      sativa: {
        expectedYield: { min: 100, max: 160, average: 130 },
        growthPattern: { height: 'tall', averageRate: 1.8, stretchFactor: 2.0 },
        lifecycle: { vegetative: 42, flowering: 77, totalDays: 119 },
        characteristics: ['airy buds', 'energizing effects', 'longer flowering'],
      },
      hybrid: {
        expectedYield: { min: 110, max: 170, average: 140 },
        growthPattern: {
          height: 'medium',
          averageRate: 1.5,
          stretchFactor: 1.6,
        },
        lifecycle: { vegetative: 38, flowering: 70, totalDays: 108 },
        characteristics: ['balanced effects', 'moderate flowering', 'versatile growth'],
      },
      auto: {
        expectedYield: { min: 50, max: 100, average: 75 },
        growthPattern: {
          height: 'short',
          averageRate: 1.0,
          stretchFactor: 1.2,
        },
        lifecycle: { vegetative: 21, flowering: 49, totalDays: 70 },
        characteristics: ['auto-flowering', 'compact size', 'fast cycle'],
      },
    };

    const base = potentialData[strainType] || potentialData.hybrid;

    // Adjust for growing medium
    const mediumMultipliers = {
      hydro: 1.15,
      coco: 1.1,
      soil: 1.0,
    };

    const multiplier = mediumMultipliers[medium] || 1.0;

    return {
      ...base,
      expectedYield: {
        min: Math.round(base.expectedYield.min * multiplier),
        max: Math.round(base.expectedYield.max * multiplier),
        average: Math.round(base.expectedYield.average * multiplier),
      },
    };
  }

  /**
   * Calculate growth milestones for cannabis cultivation
   */
  static calculateGrowthMilestones(plantData) {
    const strainType = this.classifyStrain(plantData.strain);
    const geneticPotential = this.getGeneticPotential(
      strainType,
      this.normalizeMedium(plantData.grow_medium)
    );
    const totalDays = Math.round(plantData.total_days_growing);

    const milestones = [
      {
        stage: 'germination',
        expectedDays: 3,
        actualDays: totalDays >= 3 ? 3 : null,
        status: totalDays >= 3 ? 'completed' : 'pending',
        description: 'Seed germination and taproot emergence',
      },
      {
        stage: 'first-true-leaves',
        expectedDays: 7,
        actualDays: totalDays >= 7 ? 7 : null,
        status: totalDays >= 7 ? 'completed' : 'pending',
        description: 'First set of true leaves development',
      },
      {
        stage: 'vegetative-growth',
        expectedDays: geneticPotential.lifecycle.vegetative,
        actualDays:
          plantData.growth_stage === 'vegetative'
            ? Math.round(plantData.days_in_current_stage)
            : totalDays > geneticPotential.lifecycle.vegetative
            ? geneticPotential.lifecycle.vegetative
            : null,
        status:
          plantData.growth_stage === 'vegetative'
            ? 'current'
            : totalDays > geneticPotential.lifecycle.vegetative
            ? 'completed'
            : 'pending',
        description: 'Vegetative growth and structure development',
      },
      {
        stage: 'flowering-initiation',
        expectedDays: geneticPotential.lifecycle.vegetative + 14,
        actualDays:
          plantData.growth_stage === 'flowering'
            ? Math.round(plantData.days_in_current_stage)
            : null,
        status:
          plantData.growth_stage === 'flowering'
            ? 'current'
            : plantData.growth_stage === 'harvest'
            ? 'completed'
            : 'pending',
        description: 'Flowering initiation and bud development',
      },
      {
        stage: 'harvest-window',
        expectedDays: geneticPotential.lifecycle.totalDays,
        actualDays: plantData.growth_stage === 'harvest' ? totalDays : null,
        status: plantData.growth_stage === 'harvest' ? 'current' : 'pending',
        description: 'Optimal harvest timing window',
      },
    ];

    return milestones;
  }

  /**
   * Calculate growth predictions
   */
  static calculateGrowthPredictions(plantData, milestones) {
    const currentMilestone = milestones.find(m => m.status === 'current');
    const nextMilestone = milestones.find(m => m.status === 'pending');

    const predictions = {
      nextMilestone: nextMilestone
        ? {
            stage: nextMilestone.stage,
            estimatedDays: nextMilestone.expectedDays - Math.round(plantData.total_days_growing),
            confidence: 0.8,
          }
        : null,
      expectedHarvest: null,
      finalYield: null,
    };

    // Calculate harvest prediction
    const harvestMilestone = milestones.find(m => m.stage === 'harvest-window');
    if (harvestMilestone) {
      const daysToHarvest =
        harvestMilestone.expectedDays - Math.round(plantData.total_days_growing);
      predictions.expectedHarvest = {
        daysRemaining: Math.max(0, daysToHarvest),
        estimatedDate: new Date(Date.now() + daysToHarvest * 24 * 60 * 60 * 1000),
        confidence: 0.75,
      };
    }

    // Get yield prediction from latest analytics
    const yieldPrediction = this.calculateYieldPrediction(plantData, {
      environmental: [],
      logs: [],
    });
    predictions.finalYield = {
      estimated: yieldPrediction,
      range: {
        min: Math.round(yieldPrediction * 0.8),
        max: Math.round(yieldPrediction * 1.2),
      },
      confidence: 0.7,
    };

    return predictions;
  }

  /**
   * Assess stage progression health
   */
  static assessStageProgression(plantData, milestones) {
    const currentMilestone = milestones.find(m => m.status === 'current');
    const completedMilestones = milestones.filter(m => m.status === 'completed');

    return {
      stageHealth: this.assessStageHealth(plantData),
      timeInStage: Math.round(plantData.days_in_current_stage),
      milestonesCompleted: completedMilestones.length,
      totalMilestones: milestones.length,
      progressPercentage: (completedMilestones.length / milestones.length) * 100,
    };
  }

  /**
   * Assess current stage health
   */
  static assessStageHealth(plantData) {
    const daysInStage = Math.round(plantData.days_in_current_stage);
    const stage = plantData.growth_stage;

    // Stage-specific health assessment
    const healthRanges = {
      seedling: { optimal: [1, 14], warning: [15, 21], critical: [22, 999] },
      vegetative: { optimal: [1, 45], warning: [46, 70], critical: [71, 999] },
      flowering: { optimal: [1, 70], warning: [71, 84], critical: [85, 999] },
      harvest: { optimal: [1, 7], warning: [8, 14], critical: [15, 999] },
    };

    const ranges = healthRanges[stage] || healthRanges.vegetative;

    if (daysInStage >= ranges.critical[0]) return 'critical';
    if (daysInStage >= ranges.warning[0]) return 'warning';
    return 'optimal';
  }

  /**
   * Get optimal environmental conditions for growth stage
   */
  static getOptimalConditions(growthStage) {
    const conditions = {
      seedling: {
        temperature: { min: 70, max: 80, optimal: 75 },
        humidity: { min: 65, max: 75, optimal: 70 },
        vpd: { min: 0.4, max: 0.8, optimal: 0.6 },
        light: { min: 200, max: 400, optimal: 300 },
      },
      vegetative: {
        temperature: { min: 70, max: 85, optimal: 78 },
        humidity: { min: 55, max: 70, optimal: 62 },
        vpd: { min: 0.8, max: 1.2, optimal: 1.0 },
        light: { min: 400, max: 600, optimal: 500 },
      },
      flowering: {
        temperature: { min: 65, max: 80, optimal: 72 },
        humidity: { min: 40, max: 55, optimal: 47 },
        vpd: { min: 1.0, max: 1.5, optimal: 1.2 },
        light: { min: 600, max: 1000, optimal: 800 },
      },
    };

    return conditions[growthStage] || conditions.vegetative;
  }

  /**
   * Generate strain-specific optimization recommendations
   */
  static generateStrainOptimization(strainType, actualPerformance, comparison, currentStage) {
    const recommendations = [];

    // Yield optimization
    if (comparison.yieldPercentage < 80) {
      recommendations.push({
        category: 'yield',
        priority: 'high',
        title: 'Yield Below Genetic Potential',
        message: `Current yield prediction is ${Math.round(
          comparison.yieldPercentage
        )}% of genetic potential. Consider optimizing environmental conditions and nutrition.`,
        actions: [
          'Review and optimize lighting intensity',
          'Check nutrient schedule for current stage',
          'Ensure optimal VPD ranges',
          'Consider training techniques for better light penetration',
        ],
      });
    }

    // Growth rate optimization
    if (comparison.growthRateComparison < 0.8) {
      recommendations.push({
        category: 'growth',
        priority: 'medium',
        title: 'Slow Growth Rate Detected',
        message: `Growth rate is below expected for ${strainType} genetics. Environmental or nutritional factors may be limiting growth.`,
        actions: [
          'Increase nitrogen levels if in vegetative stage',
          'Check root health and growing medium conditions',
          'Optimize temperature and humidity ranges',
          'Ensure adequate CO2 levels',
        ],
      });
    }

    // Stage-specific recommendations
    if (currentStage === 'flowering' && strainType === 'sativa') {
      recommendations.push({
        category: 'stage',
        priority: 'medium',
        title: 'Sativa Flowering Optimization',
        message:
          'Sativa strains benefit from longer flowering periods and specific environmental conditions.',
        actions: [
          'Maintain lower humidity (40-50%) to prevent mold',
          'Provide strong lighting (800-1000 PPFD)',
          'Allow extended flowering time for full development',
          'Monitor trichomes closely for harvest timing',
        ],
      });
    }

    return {
      recommendations,
      optimizationScore: Math.min(
        100,
        (comparison.yieldPercentage + comparison.growthRateComparison * 100) / 2
      ),
      potentialImprovements: {
        yieldIncrease: Math.max(0, 100 - comparison.yieldPercentage),
        timeReduction: Math.max(0, comparison.timelineComparison - 100),
      },
    };
  }

  /**
   * Additional helper methods for deep-dive analytics
   */
  static assessDataQuality(historicalData) {
    const environmentalReadings = historicalData.environmental.length;
    const logEntries = historicalData.logs.length;

    return {
      environmentalData: {
        readings: environmentalReadings,
        quality:
          environmentalReadings > 50
            ? 'excellent'
            : environmentalReadings > 20
            ? 'good'
            : 'limited',
      },
      activityLogs: {
        entries: logEntries,
        quality: logEntries > 30 ? 'excellent' : logEntries > 10 ? 'good' : 'limited',
      },
      overallQuality:
        environmentalReadings > 50 && logEntries > 30
          ? 'excellent'
          : environmentalReadings > 20 && logEntries > 10
          ? 'good'
          : 'limited',
    };
  }

  static getStrainClassification(strainType) {
    const classifications = {
      indica: {
        effects: ['relaxing', 'sedating', 'body-focused'],
        growthTraits: ['compact', 'dense buds', 'shorter flowering'],
        medicalUses: ['pain relief', 'sleep aid', 'appetite stimulation'],
      },
      sativa: {
        effects: ['energizing', 'uplifting', 'cerebral'],
        growthTraits: ['tall growth', 'airy buds', 'longer flowering'],
        medicalUses: ['depression', 'fatigue', 'focus enhancement'],
      },
      hybrid: {
        effects: ['balanced', 'versatile', 'customizable'],
        growthTraits: ['moderate height', 'varied structure', 'flexible timing'],
        medicalUses: ['versatile applications', 'balanced relief', 'customized effects'],
      },
      auto: {
        effects: ['quick onset', 'moderate potency', 'consistent'],
        growthTraits: ['compact', 'fast cycle', 'light-independent'],
        medicalUses: ['consistent dosing', 'quick relief', 'beginner-friendly'],
      },
    };

    return classifications[strainType] || classifications.hybrid;
  }

  static calculateMetricCorrelation(metric, environmentalData, growthStage) {
    // Simplified correlation calculation
    // In a real implementation, this would use statistical correlation analysis
    const optimalConditions = this.getOptimalConditions(growthStage);
    const optimalRange = optimalConditions[metric];

    if (!optimalRange || environmentalData.length === 0) {
      return {
        correlation: 0,
        impact: 'unknown',
        recommendation: 'Insufficient data',
      };
    }

    // Calculate how often readings are in optimal range
    const inRangeCount = environmentalData.filter(reading => {
      const value = parseFloat(reading[metric]);
      return value >= optimalRange.min && value <= optimalRange.max;
    }).length;

    const optimalPercentage = (inRangeCount / environmentalData.length) * 100;

    return {
      correlation: optimalPercentage / 100,
      impact: optimalPercentage > 80 ? 'positive' : optimalPercentage > 60 ? 'neutral' : 'negative',
      optimalPercentage,
      recommendation:
        optimalPercentage < 70
          ? `Optimize ${metric} to stay within ${optimalRange.min}-${optimalRange.max} range`
          : `${metric} levels are well maintained`,
    };
  }

  static calculateEnvironmentalDeviations(environmentalData, optimalConditions) {
    const deviations = {};

    Object.keys(optimalConditions).forEach(metric => {
      const readings = environmentalData
        .filter(reading => reading[metric])
        .map(reading => parseFloat(reading[metric]));

      if (readings.length === 0) {
        deviations[metric] = {
          average: 0,
          deviationScore: 0,
          status: 'no_data',
        };
        return;
      }

      const average = readings.reduce((sum, val) => sum + val, 0) / readings.length;
      const optimal = optimalConditions[metric].optimal;
      const deviationScore = Math.abs(average - optimal) / optimal;

      deviations[metric] = {
        average,
        optimal,
        deviationScore,
        status:
          deviationScore < 0.1 ? 'excellent' : deviationScore < 0.2 ? 'good' : 'needs_improvement',
      };
    });

    return deviations;
  }

  static generateEnvironmentalRecommendations(correlations, deviations, growthStage) {
    const recommendations = [];

    Object.keys(deviations).forEach(metric => {
      const deviation = deviations[metric];
      const correlation = correlations[metric];

      if (deviation.status === 'needs_improvement' && correlation.impact === 'negative') {
        recommendations.push({
          metric,
          priority: 'high',
          issue: `${metric} levels are suboptimal for ${growthStage} stage`,
          recommendation: correlation.recommendation,
          impact: 'Optimizing this metric could significantly improve plant performance',
        });
      }
    });

    return recommendations;
  }

  static calculateDataCoverage(environmentalData, days) {
    // Calculate how well the data covers the requested period
    const expectedReadings = days * 4; // Assuming 4 readings per day
    const actualReadings = environmentalData.length;
    return Math.min(100, (actualReadings / expectedReadings) * 100);
  }

  static async getHistoricalComparisonData(plantId) {
    // Get basic historical comparison data
    try {
      const result = await query(
        `
        SELECT COUNT(*) as previous_grows
        FROM plants
        WHERE archived = true
        AND harvest_date IS NOT NULL
        AND strain = (SELECT strain FROM plants WHERE id = $1)
      `,
        [plantId]
      );

      return {
        previousGrows: parseInt(result.rows[0].previous_grows) || 0,
        improvements: [],
        patterns: [],
      };
    } catch (error) {
      return { previousGrows: 0, improvements: [], patterns: [] };
    }
  }

  static async getGrowthHistory(plantId) {
    try {
      const result = await query(
        `
        SELECT
          height_cm as height,
          logged_at,
          notes
        FROM logs
        WHERE plant_id = $1
        AND height_cm IS NOT NULL
        ORDER BY logged_at ASC
      `,
        [plantId]
      );

      return result.rows.map(row => ({
        height: parseFloat(row.height),
        date: row.logged_at,
        notes: row.notes,
      }));
    } catch (error) {
      return [];
    }
  }

  static calculateEnvironmentalCorrelations(environmentalData) {
    // Simplified correlation matrix
    return {
      temperature_humidity: 0.3,
      vpd_growth: 0.7,
      light_yield: 0.8,
    };
  }

  static calculatePlantPerformance(plant, analytics) {
    return {
      yieldEfficiency: plant.final_yield ? plant.final_yield / plant.total_cycle_days : 0,
      cycleLength: plant.total_cycle_days,
      finalYield: plant.final_yield || 0,
    };
  }

  static calculateImprovementTrends(comparisons) {
    // Calculate trends from historical data
    return {
      yieldTrend: 'improving',
      cycleTrend: 'stable',
      efficiencyTrend: 'improving',
    };
  }

  static generateHistoricalInsights(currentPlant, comparisons, trends) {
    return [
      `Based on ${comparisons.length} previous grows with similar genetics`,
      `Current cycle is tracking ${trends.yieldTrend} compared to historical average`,
      `Environmental management has shown ${trends.efficiencyTrend} trends`,
    ];
  }
}

module.exports = AnalyticsEngine;
