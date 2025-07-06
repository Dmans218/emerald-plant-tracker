const { query } = require("../config/database");

/**
 * Growth Stage Analysis Service
 * Provides cannabis growth stage analytics, milestone tracking, and predictions
 */

class GrowthStageAnalysisService {
  /**
   * Analyze growth stage progression for a plant
   * @param {Object} plantData - Plant information
   * @returns {Object} Growth stage analysis
   */
  static analyzeGrowthProgression(plantData) {
    const milestones = this.calculateGrowthMilestones(plantData);
    const predictions = this.calculateGrowthPredictions(plantData, milestones);
    const stageHealth = this.assessStageHealth(plantData);
    const recommendations = this.generateStageRecommendations(plantData, milestones);

    return {
      currentStage: {
        stage: plantData.growth_stage,
        daysInStage: Math.round(plantData.days_in_current_stage),
        totalDays: Math.round(plantData.total_days_growing),
        health: stageHealth
      },
      milestones,
      predictions,
      recommendations,
      progressScore: this.calculateProgressScore(milestones)
    };
  }

  /**
   * Calculate growth milestones for cannabis cultivation
   */
  static calculateGrowthMilestones(plantData) {
    const strainType = this.classifyStrain(plantData.strain);
    const expectedTimeline = this.getExpectedTimeline(strainType);
    const totalDays = Math.round(plantData.total_days_growing);
    const currentStage = plantData.growth_stage;

    const milestones = [
      {
        stage: 'germination',
        expectedDays: 3,
        actualDays: totalDays >= 3 ? 3 : null,
        status: totalDays >= 3 ? 'completed' : 'pending',
        description: 'Seed germination and taproot emergence',
        importance: 'critical',
        indicators: ['Taproot visible', 'Seed shell cracked', 'First growth visible']
      },
      {
        stage: 'seedling',
        expectedDays: 14,
        actualDays: totalDays >= 14 ? 14 : (currentStage === 'seedling' ? totalDays : null),
        status: this.getMilestoneStatus('seedling', currentStage, totalDays, 14),
        description: 'First true leaves and early development',
        importance: 'high',
        indicators: ['First true leaves', 'Root development', 'Stable growth']
      },
      {
        stage: 'vegetative',
        expectedDays: expectedTimeline.vegetative,
        actualDays: this.getActualDays('vegetative', plantData, expectedTimeline.vegetative),
        status: this.getMilestoneStatus('vegetative', currentStage, totalDays, expectedTimeline.vegetative),
        description: 'Vegetative growth and structure development',
        importance: 'high',
        indicators: ['Rapid height growth', 'Node development', 'Branch formation']
      },
      {
        stage: 'pre-flower',
        expectedDays: expectedTimeline.vegetative + 14,
        actualDays: this.getActualDays('pre-flower', plantData, expectedTimeline.vegetative + 14),
        status: this.getMilestoneStatus('pre-flower', currentStage, totalDays, expectedTimeline.vegetative + 14),
        description: 'Pre-flowering stretch and sex determination',
        importance: 'medium',
        indicators: ['Flowering stretch', 'Sex determination', 'Pistil/pollen sac formation']
      },
      {
        stage: 'flowering',
        expectedDays: expectedTimeline.vegetative + expectedTimeline.flowering,
        actualDays: this.getActualDays('flowering', plantData, expectedTimeline.vegetative + expectedTimeline.flowering),
        status: this.getMilestoneStatus('flowering', currentStage, totalDays, expectedTimeline.vegetative + expectedTimeline.flowering),
        description: 'Flower development and maturation',
        importance: 'critical',
        indicators: ['Bud formation', 'Trichome development', 'Aroma intensification']
      },
      {
        stage: 'harvest',
        expectedDays: expectedTimeline.totalDays,
        actualDays: currentStage === 'harvest' ? totalDays : null,
        status: currentStage === 'harvest' ? 'current' : 'pending',
        description: 'Optimal harvest timing window',
        importance: 'critical',
        indicators: ['Trichome maturity', 'Pistil darkening', 'Peak potency']
      }
    ];

    return milestones;
  }

  /**
   * Calculate growth predictions based on current progress
   */
  static calculateGrowthPredictions(plantData, milestones) {
    const currentMilestone = milestones.find(m => m.status === 'current');
    const nextMilestone = milestones.find(m => m.status === 'pending');
    const totalDays = Math.round(plantData.total_days_growing);

    const predictions = {
      nextMilestone: null,
      expectedHarvest: null,
      finalYield: null,
      stageTransitions: []
    };

    // Next milestone prediction
    if (nextMilestone) {
      predictions.nextMilestone = {
        stage: nextMilestone.stage,
        estimatedDays: Math.max(0, nextMilestone.expectedDays - totalDays),
        confidence: this.calculatePredictionConfidence(plantData, nextMilestone),
        indicators: nextMilestone.indicators
      };
    }

    // Harvest prediction
    const harvestMilestone = milestones.find(m => m.stage === 'harvest');
    if (harvestMilestone) {
      const daysToHarvest = harvestMilestone.expectedDays - totalDays;
      predictions.expectedHarvest = {
        daysRemaining: Math.max(0, daysToHarvest),
        estimatedDate: new Date(Date.now() + Math.max(0, daysToHarvest) * 24 * 60 * 60 * 1000),
        confidence: this.calculateHarvestConfidence(plantData, milestones),
        harvestWindow: this.getHarvestWindow(plantData.strain)
      };
    }

    // Stage transitions
    predictions.stageTransitions = this.predictStageTransitions(plantData, milestones);

    return predictions;
  }

  /**
   * Assess current stage health
   */
  static assessStageHealth(plantData) {
    const daysInStage = Math.round(plantData.days_in_current_stage);
    const stage = plantData.growth_stage;
    const totalDays = Math.round(plantData.total_days_growing);

    // Stage-specific health assessment
    const healthRanges = this.getStageHealthRanges();
    const ranges = healthRanges[stage] || healthRanges.vegetative;

    let healthStatus = 'optimal';
    let healthScore = 100;
    const issues = [];
    const recommendations = [];

    // Check time in stage
    if (daysInStage >= ranges.critical[0]) {
      healthStatus = 'critical';
      healthScore = 30;
      issues.push(`Plant has been in ${stage} stage for ${daysInStage} days (critical threshold: ${ranges.critical[0]})`);
      recommendations.push(this.getCriticalStageRecommendation(stage));
    } else if (daysInStage >= ranges.warning[0]) {
      healthStatus = 'warning';
      healthScore = 60;
      issues.push(`Plant approaching extended time in ${stage} stage`);
      recommendations.push(this.getWarningStageRecommendation(stage));
    }

    // Stage-specific health checks
    const stageSpecificHealth = this.getStageSpecificHealth(stage, daysInStage, totalDays);
    if (stageSpecificHealth.issues.length > 0) {
      issues.push(...stageSpecificHealth.issues);
      recommendations.push(...stageSpecificHealth.recommendations);
      healthScore = Math.min(healthScore, stageSpecificHealth.score);
    }

    return {
      status: healthStatus,
      score: healthScore,
      daysInStage,
      optimalRange: ranges.optimal,
      issues,
      recommendations
    };
  }

  /**
   * Generate stage-specific recommendations
   */
  static generateStageRecommendations(plantData, milestones) {
    const stage = plantData.growth_stage;
    const daysInStage = Math.round(plantData.days_in_current_stage);
    const recommendations = [];

    // Get base stage recommendations
    const baseRecs = this.getBaseStageRecommendations(stage);
    recommendations.push(...baseRecs);

    // Add time-sensitive recommendations
    const timeRecs = this.getTimeSensitiveRecommendations(stage, daysInStage);
    recommendations.push(...timeRecs);

    // Add milestone-based recommendations
    const milestoneRecs = this.getMilestoneRecommendations(milestones);
    recommendations.push(...milestoneRecs);

    // Add strain-specific recommendations
    const strainRecs = this.getStrainSpecificStageRecommendations(plantData.strain, stage);
    recommendations.push(...strainRecs);

    return recommendations.slice(0, 5); // Limit to top 5 recommendations
  }

  // HELPER METHODS

  static classifyStrain(strainName) {
    if (!strainName) return 'hybrid';

    const name = strainName.toLowerCase();

    if (name.includes('auto') || name.includes('ruderalis')) return 'auto';
    if (name.includes('indica') || name.includes('kush') || name.includes('afghan')) return 'indica';
    if (name.includes('sativa') || name.includes('haze') || name.includes('diesel')) return 'sativa';

    return 'hybrid';
  }

  static getExpectedTimeline(strainType) {
    const timelines = {
      indica: { vegetative: 35, flowering: 63, totalDays: 101 },
      sativa: { vegetative: 42, flowering: 77, totalDays: 122 },
      hybrid: { vegetative: 38, flowering: 70, totalDays: 111 },
      auto: { vegetative: 21, flowering: 49, totalDays: 73 }
    };

    return timelines[strainType] || timelines.hybrid;
  }

  static getMilestoneStatus(milestoneStage, currentStage, totalDays, expectedDays) {
    if (currentStage === milestoneStage) return 'current';
    if (totalDays >= expectedDays) return 'completed';
    return 'pending';
  }

  static getActualDays(milestoneStage, plantData, expectedDays) {
    const currentStage = plantData.growth_stage;
    const totalDays = Math.round(plantData.total_days_growing);
    const daysInStage = Math.round(plantData.days_in_current_stage);

    if (currentStage === milestoneStage) return daysInStage;
    if (totalDays >= expectedDays) return expectedDays;
    return null;
  }

  static calculateProgressScore(milestones) {
    const completedMilestones = milestones.filter(m => m.status === 'completed').length;
    const totalMilestones = milestones.length;
    return Math.round((completedMilestones / totalMilestones) * 100);
  }

  static calculatePredictionConfidence(plantData, milestone) {
    const strainType = this.classifyStrain(plantData.strain);
    const baseConfidence = strainType === 'auto' ? 0.9 : 0.8;

    // Adjust based on current progress
    const totalDays = Math.round(plantData.total_days_growing);
    const progressRatio = totalDays / milestone.expectedDays;

    if (progressRatio > 0.8) return Math.min(0.95, baseConfidence + 0.1);
    if (progressRatio > 0.5) return baseConfidence;
    return Math.max(0.6, baseConfidence - 0.2);
  }

  static calculateHarvestConfidence(plantData, milestones) {
    const completedMilestones = milestones.filter(m => m.status === 'completed').length;
    const totalMilestones = milestones.length;
    const progressRatio = completedMilestones / totalMilestones;

    return Math.min(0.9, 0.5 + (progressRatio * 0.4));
  }

  static getHarvestWindow(strainName) {
    const strainType = this.classifyStrain(strainName);
    const windows = {
      indica: { days: 7, description: 'Shorter harvest window, watch trichomes closely' },
      sativa: { days: 10, description: 'Longer harvest window, can wait for full development' },
      hybrid: { days: 8, description: 'Moderate harvest window, balance potency and yield' },
      auto: { days: 5, description: 'Narrow harvest window, harvest when ready' }
    };

    return windows[strainType] || windows.hybrid;
  }

  static predictStageTransitions(plantData, milestones) {
    const currentStage = plantData.growth_stage;
    const transitions = [];

    if (currentStage === 'vegetative') {
      transitions.push({
        from: 'vegetative',
        to: 'flowering',
        trigger: 'light cycle change',
        timing: 'when desired size reached',
        considerations: ['Plant size', 'Space constraints', 'Desired yield']
      });
    }

    if (currentStage === 'flowering') {
      transitions.push({
        from: 'flowering',
        to: 'harvest',
        trigger: 'trichome maturity',
        timing: 'when trichomes are optimal',
        considerations: ['Trichome color', 'Pistil maturity', 'Desired effects']
      });
    }

    return transitions;
  }

  static getStageHealthRanges() {
    return {
      seedling: { optimal: [1, 14], warning: [15, 21], critical: [22, 999] },
      vegetative: { optimal: [1, 45], warning: [46, 70], critical: [71, 999] },
      flowering: { optimal: [1, 70], warning: [71, 84], critical: [85, 999] },
      harvest: { optimal: [1, 7], warning: [8, 14], critical: [15, 999] }
    };
  }

  static getCriticalStageRecommendation(stage) {
    const recommendations = {
      seedling: 'Consider environmental factors - may need better conditions for growth',
      vegetative: 'Plant may be ready for flowering transition - check size and health',
      flowering: 'Check trichomes for harvest readiness - may be overripe if delayed',
      harvest: 'Harvest immediately - quality may be declining'
    };

    return recommendations[stage] || 'Monitor plant closely for stage transition needs';
  }

  static getWarningStageRecommendation(stage) {
    const recommendations = {
      seedling: 'Monitor growth progress - ensure optimal conditions',
      vegetative: 'Consider transitioning to flowering soon',
      flowering: 'Begin checking trichomes for harvest timing',
      harvest: 'Plan harvest within next few days'
    };

    return recommendations[stage] || 'Monitor for stage transition indicators';
  }

  static getStageSpecificHealth(stage, daysInStage, totalDays) {
    const health = { issues: [], recommendations: [], score: 100 };

    switch (stage) {
      case 'seedling':
        if (daysInStage > 10 && totalDays < 20) {
          health.issues.push('Slow seedling development');
          health.recommendations.push('Check light intensity and environmental conditions');
          health.score = 70;
        }
        break;

      case 'vegetative':
        if (daysInStage > 60) {
          health.issues.push('Extended vegetative period');
          health.recommendations.push('Consider flowering transition to prevent overgrowth');
          health.score = 80;
        }
        break;

      case 'flowering':
        if (daysInStage > 80) {
          health.issues.push('Extended flowering period');
          health.recommendations.push('Check trichomes - may be ready for harvest');
          health.score = 75;
        }
        break;
    }

    return health;
  }

  static getBaseStageRecommendations(stage) {
    const recommendations = {
      seedling: [
        { type: 'environment', message: 'Maintain 70-80°F temperature and high humidity' },
        { type: 'lighting', message: 'Provide gentle lighting (200-400 PPFD)' },
        { type: 'watering', message: 'Keep soil moist but not waterlogged' }
      ],
      vegetative: [
        { type: 'nutrition', message: 'Provide nitrogen-rich nutrients for growth' },
        { type: 'training', message: 'Consider LST or HST for structure development' },
        { type: 'lighting', message: 'Increase light intensity (400-600 PPFD)' }
      ],
      flowering: [
        { type: 'nutrition', message: 'Switch to phosphorus/potassium rich nutrients' },
        { type: 'environment', message: 'Lower humidity to prevent mold (40-50%)' },
        { type: 'monitoring', message: 'Monitor trichomes for harvest timing' }
      ],
      harvest: [
        { type: 'timing', message: 'Harvest when trichomes are optimal for desired effects' },
        { type: 'preparation', message: 'Prepare drying and curing setup' },
        { type: 'quality', message: 'Handle buds carefully to preserve trichomes' }
      ]
    };

    return recommendations[stage] || [];
  }

  static getTimeSensitiveRecommendations(stage, daysInStage) {
    const recommendations = [];

    if (stage === 'vegetative' && daysInStage > 40) {
      recommendations.push({
        type: 'transition',
        message: 'Consider flowering transition - plant structure is well developed'
      });
    }

    if (stage === 'flowering' && daysInStage > 50) {
      recommendations.push({
        type: 'monitoring',
        message: 'Begin daily trichome checks for harvest timing'
      });
    }

    return recommendations;
  }

  static getMilestoneRecommendations(milestones) {
    const recommendations = [];
    const currentMilestone = milestones.find(m => m.status === 'current');

    if (currentMilestone) {
      recommendations.push({
        type: 'milestone',
        message: `Focus on ${currentMilestone.stage} stage indicators: ${currentMilestone.indicators.join(', ')}`
      });
    }

    return recommendations;
  }

  static getStrainSpecificStageRecommendations(strainName, stage) {
    const strainType = this.classifyStrain(strainName);
    const recommendations = [];

    if (strainType === 'sativa' && stage === 'vegetative') {
      recommendations.push({
        type: 'strain-specific',
        message: 'Sativa strains benefit from longer vegetative periods and height control'
      });
    }

    if (strainType === 'indica' && stage === 'flowering') {
      recommendations.push({
        type: 'strain-specific',
        message: 'Indica strains finish faster - monitor trichomes starting week 7'
      });
    }

    if (strainType === 'auto') {
      recommendations.push({
        type: 'strain-specific',
        message: 'Auto-flowering strains transition automatically - focus on optimal conditions'
      });
    }

    return recommendations;
  }
}

module.exports = GrowthStageAnalysisService;