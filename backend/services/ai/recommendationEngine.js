const { query } = require('../config/database');
const { logger } = require('../utils/logger');

/**
 * AI-Powered Cultivation Recommendation Engine
 * Analyzes historical data to provide intelligent cultivation recommendations
 */

class RecommendationEngine {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 3600000; // 1 hour
    this.confidenceThreshold = 0.7;
  }

  /**
   * Generate comprehensive recommendations for a plant
   */
  async generateRecommendations(plantId, options = {}) {
    try {
      const cacheKey = `rec_${plantId}_${JSON.stringify(options)}`;
      const cached = this.getCachedRecommendations(cacheKey);
      if (cached) return cached;

      logger.info(`Generating AI recommendations for plant ${plantId}`);

      // Get plant and analytics data
      const plantData = await this.getPlantData(plantId);
      const analyticsData = await this.getAnalyticsData(plantId);
      const environmentalData = await this.getEnvironmentalData(plantId);
      const historicalData = await this.getHistoricalData(plantId);

      // Generate recommendations by category
      const recommendations = await Promise.all([
        this.generateEnvironmentalRecommendations(plantData, environmentalData, analyticsData),
        this.generateNutrientRecommendations(plantData, analyticsData, historicalData),
        this.generateCultivationRecommendations(plantData, analyticsData),
        this.generateHarvestRecommendations(plantData, analyticsData, historicalData)
      ]);

      // Flatten and prioritize recommendations
      const allRecommendations = recommendations.flat().filter(rec => rec.confidence >= this.confidenceThreshold);
      const prioritizedRecommendations = this.prioritizeRecommendations(allRecommendations);

      const result = {
        plantId,
        recommendations: prioritizedRecommendations,
        lastUpdated: new Date().toISOString(),
        totalRecommendations: prioritizedRecommendations.length,
        confidence: this.calculateOverallConfidence(prioritizedRecommendations)
      };

      this.cacheRecommendations(cacheKey, result);
      return result;

    } catch (error) {
      logger.error(`Error generating recommendations for plant ${plantId}:`, error);
      throw new Error(`Failed to generate recommendations: ${error.message}`);
    }
  }

  /**
   * Generate environmental optimization recommendations
   */
  async generateEnvironmentalRecommendations(plantData, environmentalData, analyticsData) {
    const recommendations = [];
    const { strain, growthStage, daysInStage } = plantData;
    const { currentVPD, temperature, humidity, co2 } = environmentalData;

    // VPD Optimization
    const vpdRecommendation = this.analyzeVPDOptimization(strain, growthStage, currentVPD);
    if (vpdRecommendation) {
      recommendations.push({
        id: `env_vpd_${Date.now()}`,
        type: 'environmental',
        category: 'vpd_optimization',
        priority: vpdRecommendation.priority,
        title: 'Optimize VPD for Current Growth Stage',
        description: vpdRecommendation.description,
        actions: vpdRecommendation.actions,
        confidence: vpdRecommendation.confidence,
        reasoning: vpdRecommendation.reasoning,
        expectedBenefit: vpdRecommendation.expectedBenefit
      });
    }

    // Temperature Optimization
    const tempRecommendation = this.analyzeTemperatureOptimization(strain, growthStage, temperature);
    if (tempRecommendation) {
      recommendations.push({
        id: `env_temp_${Date.now()}`,
        type: 'environmental',
        category: 'temperature_optimization',
        priority: tempRecommendation.priority,
        title: 'Temperature Optimization',
        description: tempRecommendation.description,
        actions: tempRecommendation.actions,
        confidence: tempRecommendation.confidence,
        reasoning: tempRecommendation.reasoning,
        expectedBenefit: tempRecommendation.expectedBenefit
      });
    }

    // Humidity Optimization
    const humidityRecommendation = this.analyzeHumidityOptimization(strain, growthStage, humidity);
    if (humidityRecommendation) {
      recommendations.push({
        id: `env_humidity_${Date.now()}`,
        type: 'environmental',
        category: 'humidity_optimization',
        priority: humidityRecommendation.priority,
        title: 'Humidity Optimization',
        description: humidityRecommendation.description,
        actions: humidityRecommendation.actions,
        confidence: humidityRecommendation.confidence,
        reasoning: humidityRecommendation.reasoning,
        expectedBenefit: humidityRecommendation.expectedBenefit
      });
    }

    return recommendations;
  }

  /**
   * Generate nutrient management recommendations
   */
  async generateNutrientRecommendations(plantData, analyticsData, historicalData) {
    const recommendations = [];
    const { strain, growthStage, currentNutrients } = plantData;
    const { nutrientEfficiency, deficiencyIndicators } = analyticsData;

    // Nutrient Deficiency Prevention
    const deficiencyRecommendation = this.analyzeNutrientDeficiencies(strain, growthStage, deficiencyIndicators);
    if (deficiencyRecommendation) {
      recommendations.push({
        id: `nutrient_def_${Date.now()}`,
        type: 'nutrient',
        category: 'deficiency_prevention',
        priority: deficiencyRecommendation.priority,
        title: 'Prevent Nutrient Deficiency',
        description: deficiencyRecommendation.description,
        actions: deficiencyRecommendation.actions,
        confidence: deficiencyRecommendation.confidence,
        reasoning: deficiencyRecommendation.reasoning,
        expectedBenefit: deficiencyRecommendation.expectedBenefit
      });
    }

    // Feeding Schedule Optimization
    const scheduleRecommendation = this.analyzeFeedingSchedule(strain, growthStage, currentNutrients, nutrientEfficiency);
    if (scheduleRecommendation) {
      recommendations.push({
        id: `nutrient_schedule_${Date.now()}`,
        type: 'nutrient',
        category: 'schedule_optimization',
        priority: scheduleRecommendation.priority,
        title: 'Optimize Feeding Schedule',
        description: scheduleRecommendation.description,
        actions: scheduleRecommendation.actions,
        confidence: scheduleRecommendation.confidence,
        reasoning: scheduleRecommendation.reasoning,
        expectedBenefit: scheduleRecommendation.expectedBenefit
      });
    }

    return recommendations;
  }

  /**
   * Generate cultivation technique recommendations
   */
  async generateCultivationRecommendations(plantData, analyticsData) {
    const recommendations = [];
    const { strain, growthStage, height, nodeCount, trainingHistory } = plantData;
    const { growthRate, environmentalEfficiency } = analyticsData;

    // Training Recommendations
    const trainingRecommendation = this.analyzeTrainingOpportunities(strain, growthStage, height, nodeCount, trainingHistory);
    if (trainingRecommendation) {
      recommendations.push({
        id: `cult_training_${Date.now()}`,
        type: 'cultivation',
        category: 'training_optimization',
        priority: trainingRecommendation.priority,
        title: 'Training Technique Recommendation',
        description: trainingRecommendation.description,
        actions: trainingRecommendation.actions,
        confidence: trainingRecommendation.confidence,
        reasoning: trainingRecommendation.reasoning,
        expectedBenefit: trainingRecommendation.expectedBenefit
      });
    }

    // Pruning Recommendations
    const pruningRecommendation = this.analyzePruningNeeds(strain, growthStage, nodeCount, environmentalEfficiency);
    if (pruningRecommendation) {
      recommendations.push({
        id: `cult_pruning_${Date.now()}`,
        type: 'cultivation',
        category: 'pruning_optimization',
        priority: pruningRecommendation.priority,
        title: 'Pruning and Defoliation',
        description: pruningRecommendation.description,
        actions: pruningRecommendation.actions,
        confidence: pruningRecommendation.confidence,
        reasoning: pruningRecommendation.reasoning,
        expectedBenefit: pruningRecommendation.expectedBenefit
      });
    }

    return recommendations;
  }

  /**
   * Generate harvest optimization recommendations
   */
  async generateHarvestRecommendations(plantData, analyticsData, historicalData) {
    const recommendations = [];
    const { strain, growthStage, daysInFlower, trichomeData } = plantData;
    const { yieldPrediction, environmentalEfficiency } = analyticsData;

    // Harvest Timing
    const harvestTimingRecommendation = this.analyzeHarvestTiming(strain, daysInFlower, trichomeData, yieldPrediction);
    if (harvestTimingRecommendation) {
      recommendations.push({
        id: `harvest_timing_${Date.now()}`,
        type: 'harvest',
        category: 'timing_optimization',
        priority: harvestTimingRecommendation.priority,
        title: 'Harvest Timing Optimization',
        description: harvestTimingRecommendation.description,
        actions: harvestTimingRecommendation.actions,
        confidence: harvestTimingRecommendation.confidence,
        reasoning: harvestTimingRecommendation.reasoning,
        expectedBenefit: harvestTimingRecommendation.expectedBenefit
      });
    }

    // Pre-Harvest Optimization
    const preHarvestRecommendation = this.analyzePreHarvestOptimization(strain, growthStage, environmentalEfficiency);
    if (preHarvestRecommendation) {
      recommendations.push({
        id: `harvest_pre_${Date.now()}`,
        type: 'harvest',
        category: 'pre_harvest_optimization',
        priority: preHarvestRecommendation.priority,
        title: 'Pre-Harvest Optimization',
        description: preHarvestRecommendation.description,
        actions: preHarvestRecommendation.actions,
        confidence: preHarvestRecommendation.confidence,
        reasoning: preHarvestRecommendation.reasoning,
        expectedBenefit: preHarvestRecommendation.expectedBenefit
      });
    }

    return recommendations;
  }

  /**
   * Analyze VPD optimization opportunities
   */
  analyzeVPDOptimization(strain, growthStage, currentVPD) {
    const optimalVPDRanges = {
      seedling: { min: 0.4, max: 0.8 },
      vegetative: { min: 0.8, max: 1.2 },
      flowering: { min: 1.0, max: 1.5 },
      late_flowering: { min: 1.2, max: 1.8 }
    };

    const strainAdjustments = {
      indica: { offset: -0.1, humidity: 'lower' },
      sativa: { offset: 0.1, humidity: 'higher' },
      hybrid: { offset: 0, humidity: 'moderate' },
      autoflower: { offset: 0, humidity: 'consistent' }
    };

    const optimalRange = optimalVPDRanges[growthStage] || optimalVPDRanges.vegetative;
    const adjustment = strainAdjustments[strain] || strainAdjustments.hybrid;
    
    const adjustedMin = optimalRange.min + adjustment.offset;
    const adjustedMax = optimalRange.max + adjustment.offset;

    if (currentVPD < adjustedMin || currentVPD > adjustedMax) {
      const deviation = currentVPD < adjustedMin ? 'low' : 'high';
      const action = currentVPD < adjustedMin ? 'increase humidity' : 'decrease humidity';
      
      return {
        priority: Math.abs(currentVPD - (adjustedMin + adjustedMax) / 2) > 0.5 ? 'high' : 'medium',
        description: `Current VPD (${currentVPD.toFixed(2)} kPa) is ${deviation}. Target range: ${adjustedMin.toFixed(2)}-${adjustedMax.toFixed(2)} kPa`,
        actions: [{
          parameter: 'humidity',
          action: action,
          currentValue: currentVPD,
          targetRange: `${adjustedMin.toFixed(2)}-${adjustedMax.toFixed(2)} kPa`,
          expectedBenefit: 'Improved nutrient uptake and growth rate'
        }],
        confidence: 0.85,
        reasoning: `Based on ${strain} strain characteristics and ${growthStage} stage requirements. ${strain} strains typically prefer ${adjustment.humidity} humidity levels.`,
        expectedBenefit: '15-25% improvement in growth rate and nutrient efficiency'
      };
    }

    return null;
  }

  /**
   * Analyze temperature optimization
   */
  analyzeTemperatureOptimization(strain, growthStage, currentTemp) {
    const optimalTemps = {
      seedling: { day: 22, night: 20 },
      vegetative: { day: 24, night: 22 },
      flowering: { day: 26, night: 22 },
      late_flowering: { day: 25, night: 20 }
    };

    const strainAdjustments = {
      indica: { dayOffset: -2, nightOffset: -2 },
      sativa: { dayOffset: 2, nightOffset: 1 },
      hybrid: { dayOffset: 0, nightOffset: 0 },
      autoflower: { dayOffset: 0, nightOffset: 0 }
    };

    const optimal = optimalTemps[growthStage] || optimalTemps.vegetative;
    const adjustment = strainAdjustments[strain] || strainAdjustments.hybrid;
    
    const targetDay = optimal.day + adjustment.dayOffset;
    const targetNight = optimal.night + adjustment.nightOffset;

    if (Math.abs(currentTemp - targetDay) > 3) {
      const action = currentTemp > targetDay ? 'decrease temperature' : 'increase temperature';
      
      return {
        priority: Math.abs(currentTemp - targetDay) > 5 ? 'high' : 'medium',
        description: `Current temperature (${currentTemp}°C) is outside optimal range for ${strain} during ${growthStage}`,
        actions: [{
          parameter: 'temperature',
          action: action,
          currentValue: currentTemp,
          targetRange: `${targetNight}-${targetDay}°C`,
          expectedBenefit: 'Optimal metabolic activity and growth'
        }],
        confidence: 0.8,
        reasoning: `${strain} strains prefer ${currentTemp > targetDay ? 'cooler' : 'warmer'} temperatures during ${growthStage}.`,
        expectedBenefit: '10-20% improvement in growth rate and stress resistance'
      };
    }

    return null;
  }

  /**
   * Analyze humidity optimization
   */
  analyzeHumidityOptimization(strain, growthStage, currentHumidity) {
    const optimalHumidity = {
      seedling: { min: 65, max: 75 },
      vegetative: { min: 50, max: 70 },
      flowering: { min: 40, max: 60 },
      late_flowering: { min: 35, max: 50 }
    };

    const strainAdjustments = {
      indica: { offset: -5 },
      sativa: { offset: 5 },
      hybrid: { offset: 0 },
      autoflower: { offset: 0 }
    };

    const optimal = optimalHumidity[growthStage] || optimalHumidity.vegetative;
    const adjustment = strainAdjustments[strain] || strainAdjustments.hybrid;
    
    const targetMin = optimal.min + adjustment.offset;
    const targetMax = optimal.max + adjustment.offset;

    if (currentHumidity < targetMin || currentHumidity > targetMax) {
      const action = currentHumidity < targetMin ? 'increase humidity' : 'decrease humidity';
      
      return {
        priority: Math.abs(currentHumidity - (targetMin + targetMax) / 2) > 10 ? 'high' : 'medium',
        description: `Current humidity (${currentHumidity}%) is outside optimal range for ${growthStage}`,
        actions: [{
          parameter: 'humidity',
          action: action,
          currentValue: currentHumidity,
          targetRange: `${targetMin}-${targetMax}%`,
          expectedBenefit: 'Prevent mold/mildew and optimize transpiration'
        }],
        confidence: 0.75,
        reasoning: `${growthStage} stage requires ${action} humidity to prevent issues and optimize growth.`,
        expectedBenefit: 'Reduced risk of disease and improved plant health'
      };
    }

    return null;
  }

  /**
   * Analyze nutrient deficiencies
   */
  analyzeNutrientDeficiencies(strain, growthStage, deficiencyIndicators) {
    if (!deficiencyIndicators || deficiencyIndicators.length === 0) {
      return null;
    }

    const strainNutrientNeeds = {
      indica: { nitrogen: 'high', calcium: 'high', magnesium: 'medium' },
      sativa: { nitrogen: 'medium', phosphorus: 'high', potassium: 'high' },
      hybrid: { nitrogen: 'medium', phosphorus: 'medium', potassium: 'medium' },
      autoflower: { nitrogen: 'low', phosphorus: 'medium', potassium: 'medium' }
    };

    const needs = strainNutrientNeeds[strain] || strainNutrientNeeds.hybrid;
    const criticalDeficiencies = deficiencyIndicators.filter(def => def.severity === 'high');

    if (criticalDeficiencies.length > 0) {
      const primaryDeficiency = criticalDeficiencies[0];
      
      return {
        priority: 'high',
        description: `Detected ${primaryDeficiency.nutrient} deficiency - ${primaryDeficiency.symptoms.join(', ')}`,
        actions: [{
          parameter: 'nutrients',
          action: `increase ${primaryDeficiency.nutrient}`,
          currentValue: primaryDeficiency.currentLevel,
          targetRange: primaryDeficiency.optimalRange,
          expectedBenefit: 'Prevent growth stunting and yield loss'
        }],
        confidence: 0.9,
        reasoning: `${strain} strains are ${needs[primaryDeficiency.nutrient]} ${primaryDeficiency.nutrient} feeders. Deficiency detected through ${primaryDeficiency.detectionMethod}.`,
        expectedBenefit: 'Prevent 20-40% yield loss and restore healthy growth'
      };
    }

    return null;
  }

  /**
   * Analyze feeding schedule optimization
   */
  analyzeFeedingSchedule(strain, growthStage, currentNutrients, nutrientEfficiency) {
    if (nutrientEfficiency < 0.7) {
      const strainFeeding = {
        indica: { frequency: 'heavy', strength: 'high' },
        sativa: { frequency: 'moderate', strength: 'medium' },
        hybrid: { frequency: 'moderate', strength: 'medium' },
        autoflower: { frequency: 'light', strength: 'low' }
      };

      const feeding = strainFeeding[strain] || strainFeeding.hybrid;
      
      return {
        priority: 'medium',
        description: `Low nutrient efficiency (${(nutrientEfficiency * 100).toFixed(1)}%) detected. Optimize feeding schedule for ${strain} strain.`,
        actions: [{
          parameter: 'feeding_schedule',
          action: `adjust to ${feeding.frequency} feeding with ${feeding.strength} strength`,
          currentValue: `${(nutrientEfficiency * 100).toFixed(1)}% efficiency`,
          targetRange: '70-90% efficiency',
          expectedBenefit: 'Improved nutrient uptake and growth'
        }],
        confidence: 0.8,
        reasoning: `${strain} strains typically respond well to ${feeding.frequency} feeding schedules. Current efficiency suggests suboptimal nutrient delivery.`,
        expectedBenefit: '15-25% improvement in growth rate and nutrient utilization'
      };
    }

    return null;
  }

  /**
   * Analyze training opportunities
   */
  analyzeTrainingOpportunities(strain, growthStage, height, nodeCount, trainingHistory) {
    if (growthStage === 'vegetative' && height > 30 && nodeCount >= 6 && !trainingHistory.includes('lst')) {
      const strainTraining = {
        indica: { method: 'LST', tolerance: 'high', benefit: 'bushy growth' },
        sativa: { method: 'SCROG', tolerance: 'medium', benefit: 'height control' },
        hybrid: { method: 'LST', tolerance: 'medium', benefit: 'balanced growth' },
        autoflower: { method: 'LST', tolerance: 'low', benefit: 'minimal stress' }
      };

      const training = strainTraining[strain] || strainTraining.hybrid;
      
      return {
        priority: 'medium',
        description: `Plant ready for ${training.method} training. Current height: ${height}cm, nodes: ${nodeCount}`,
        actions: [{
          parameter: 'training',
          action: `apply ${training.method}`,
          currentValue: 'no training applied',
          targetRange: `${training.method} training`,
          expectedBenefit: training.benefit
        }],
        confidence: 0.85,
        reasoning: `${strain} strains respond well to ${training.method}. Plant has sufficient height and node development for training.`,
        expectedBenefit: '20-30% increase in yield through better light distribution'
      };
    }

    return null;
  }

  /**
   * Analyze pruning needs
   */
  analyzePruningNeeds(strain, growthStage, nodeCount, environmentalEfficiency) {
    if (growthStage === 'vegetative' && nodeCount > 8 && environmentalEfficiency < 0.8) {
      return {
        priority: 'low',
        description: 'Consider selective defoliation to improve airflow and light penetration',
        actions: [{
          parameter: 'pruning',
          action: 'selective defoliation',
          currentValue: 'no pruning',
          targetRange: 'remove 20-30% of lower leaves',
          expectedBenefit: 'improved airflow and light distribution'
        }],
        confidence: 0.7,
        reasoning: 'High node count with low environmental efficiency suggests overcrowding. Defoliation can improve conditions.',
        expectedBenefit: '10-15% improvement in environmental efficiency and bud development'
      };
    }

    return null;
  }

  /**
   * Analyze harvest timing
   */
  analyzeHarvestTiming(strain, daysInFlower, trichomeData, yieldPrediction) {
    const strainFloweringTimes = {
      indica: { min: 56, max: 70 },
      sativa: { min: 70, max: 90 },
      hybrid: { min: 63, max: 80 },
      autoflower: { min: 50, max: 75 }
    };

    const floweringTime = strainFloweringTimes[strain] || strainFloweringTimes.hybrid;
    const optimalHarvest = (floweringTime.min + floweringTime.max) / 2;

    if (daysInFlower >= floweringTime.min && daysInFlower <= floweringTime.max) {
      const trichomeAnalysis = this.analyzeTrichomes(trichomeData);
      
      if (trichomeAnalysis.recommendation === 'harvest') {
        return {
          priority: 'high',
          description: `Optimal harvest window reached. Trichome analysis: ${trichomeAnalysis.description}`,
          actions: [{
            parameter: 'harvest',
            action: 'begin harvest preparation',
            currentValue: `${daysInFlower} days in flower`,
            targetRange: 'harvest within 3-7 days',
            expectedBenefit: 'peak potency and optimal yield'
          }],
          confidence: 0.9,
          reasoning: `Strain flowering time (${floweringTime.min}-${floweringTime.max} days) and trichome development indicate harvest readiness.`,
          expectedBenefit: 'Maximum potency and yield at optimal harvest window'
        };
      }
    }

    return null;
  }

  /**
   * Analyze pre-harvest optimization
   */
  analyzePreHarvestOptimization(strain, growthStage, environmentalEfficiency) {
    if (growthStage === 'late_flowering' && environmentalEfficiency < 0.8) {
      return {
        priority: 'medium',
        description: 'Optimize environment for final flowering phase to maximize resin production',
        actions: [{
          parameter: 'environment',
          action: 'optimize for resin production',
          currentValue: `${(environmentalEfficiency * 100).toFixed(1)}% efficiency`,
          targetRange: '80-90% efficiency',
          expectedBenefit: 'increased resin production and potency'
        }],
        confidence: 0.75,
        reasoning: 'Late flowering phase is critical for resin development. Environmental optimization can significantly impact final potency.',
        expectedBenefit: '15-25% increase in resin production and overall potency'
      };
    }

    return null;
  }

  /**
   * Analyze trichome development
   */
  analyzeTrichomes(trichomeData) {
    if (!trichomeData) {
      return { recommendation: 'continue', description: 'No trichome data available' };
    }

    const { clear, cloudy, amber } = trichomeData;
    const total = clear + cloudy + amber;

    if (total === 0) {
      return { recommendation: 'continue', description: 'No trichomes detected' };
    }

    const clearPercent = (clear / total) * 100;
    const cloudyPercent = (cloudy / total) * 100;
    const amberPercent = (amber / total) * 100;

    if (amberPercent > 30) {
      return { 
        recommendation: 'harvest', 
        description: `High amber trichomes (${amberPercent.toFixed(1)}%) - peak potency window` 
      };
    } else if (cloudyPercent > 70) {
      return { 
        recommendation: 'harvest', 
        description: `Mostly cloudy trichomes (${cloudyPercent.toFixed(1)}%) - good potency` 
      };
    } else if (clearPercent > 50) {
      return { 
        recommendation: 'continue', 
        description: `Mostly clear trichomes (${clearPercent.toFixed(1)}%) - continue flowering` 
      };
    }

    return { 
      recommendation: 'monitor', 
      description: `Mixed trichome development - monitor closely` 
    };
  }

  /**
   * Prioritize recommendations by impact and urgency
   */
  prioritizeRecommendations(recommendations) {
    const priorityScores = { high: 3, medium: 2, low: 1 };
    
    return recommendations.sort((a, b) => {
      const scoreA = priorityScores[a.priority] * a.confidence;
      const scoreB = priorityScores[b.priority] * b.confidence;
      return scoreB - scoreA;
    });
  }

  /**
   * Calculate overall confidence for recommendations
   */
  calculateOverallConfidence(recommendations) {
    if (recommendations.length === 0) return 0;
    
    const totalConfidence = recommendations.reduce((sum, rec) => sum + rec.confidence, 0);
    return totalConfidence / recommendations.length;
  }

  /**
   * Get plant data from database
   */
  async getPlantData(plantId) {
    const result = await query(
      `SELECT p.*, 
              s.name as strain_name, s.type as strain_type,
              EXTRACT(DAYS FROM NOW() - p.created_at) as total_days,
              EXTRACT(DAYS FROM NOW() - p.stage_start_date) as days_in_stage
       FROM plants p
       LEFT JOIN strains s ON p.strain_id = s.id
       WHERE p.id = $1`,
      [plantId]
    );

    if (result.rows.length === 0) {
      throw new Error(`Plant ${plantId} not found`);
    }

    const plant = result.rows[0];
    
    // Get training history
    const trainingResult = await query(
      `SELECT activity_type FROM logs 
       WHERE plant_id = $1 AND activity_type IN ('lst', 'hst', 'scrog', 'topping', 'pruning')
       ORDER BY created_at DESC`,
      [plantId]
    );

    return {
      ...plant,
      trainingHistory: trainingResult.rows.map(row => row.activity_type),
      strain: plant.strain_type || 'hybrid',
      growthStage: plant.growth_stage || 'vegetative'
    };
  }

  /**
   * Get analytics data for plant
   */
  async getAnalyticsData(plantId) {
    const result = await query(
      `SELECT * FROM analytics_data 
       WHERE plant_id = $1 
       ORDER BY calculation_date DESC 
       LIMIT 1`,
      [plantId]
    );

    if (result.rows.length === 0) {
      return {
        yieldPrediction: 0,
        growthRate: 0,
        environmentalEfficiency: 0,
        nutrientEfficiency: 0,
        deficiencyIndicators: []
      };
    }

    return result.rows[0];
  }

  /**
   * Get environmental data for plant
   */
  async getEnvironmentalData(plantId) {
    const result = await query(
      `SELECT temperature, humidity, vpd, co2_level, light_intensity
       FROM environment 
       WHERE plant_id = $1 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [plantId]
    );

    if (result.rows.length === 0) {
      return {
        temperature: 24,
        humidity: 60,
        vpd: 1.0,
        co2Level: 400,
        lightIntensity: 600
      };
    }

    return result.rows[0];
  }

  /**
   * Get historical data for pattern analysis
   */
  async getHistoricalData(plantId) {
    const result = await query(
      `SELECT * FROM analytics_data 
       WHERE plant_id = $1 
       ORDER BY calculation_date DESC 
       LIMIT 30`,
      [plantId]
    );

    return result.rows;
  }

  /**
   * Cache management
   */
  getCachedRecommendations(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  cacheRecommendations(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear cache for a specific plant
   */
  clearPlantCache(plantId) {
    const keysToDelete = [];
    for (const [key] of this.cache) {
      if (key.includes(`rec_${plantId}_`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
  }
}

module.exports = new RecommendationEngine(); 