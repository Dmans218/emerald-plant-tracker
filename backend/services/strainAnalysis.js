const { query } = require("../config/database");

/**
 * Strain Analysis Service
 * Provides cannabis strain-specific analytics and genetic potential calculations
 */

class StrainAnalysisService {
  /**
   * Get comprehensive strain profile data
   */
  static getStrainProfile(strainName, medium = 'soil') {
    const strainType = this.classifyStrain(strainName);
    const baseProfile = this.getBaseStrainData(strainType);
    const mediumAdjusted = this.adjustForMedium(baseProfile, medium);
    
    return {
      ...mediumAdjusted,
      originalName: strainName,
      classification: this.getDetailedClassification(strainType),
      growingTips: this.getStrainSpecificTips(strainType, medium)
    };
  }

  /**
   * Classify strain type based on name and characteristics
   */
  static classifyStrain(strainName) {
    if (!strainName) return 'hybrid';
    
    const name = strainName.toLowerCase();
    
    if (name.includes('auto') || name.includes('ruderalis')) {
      return 'auto';
    }
    
    const indicaKeywords = ['kush', 'afghan', 'bubba', 'purple', 'og', 'cookies'];
    const sativaKeywords = ['haze', 'diesel', 'jack', 'amnesia', 'silver', 'durban'];
    
    const indicaMatches = indicaKeywords.filter(keyword => name.includes(keyword)).length;
    const sativaMatches = sativaKeywords.filter(keyword => name.includes(keyword)).length;
    
    if (indicaMatches > sativaMatches && indicaMatches > 0) return 'indica';
    if (sativaMatches > indicaMatches && sativaMatches > 0) return 'sativa';
    
    return 'hybrid';
  }

  /**
   * Get base strain data for each type
   */
  static getBaseStrainData(strainType) {
    const strainData = {
      indica: {
        expectedYield: { min: 120, max: 200, average: 160 },
        growthPattern: { height: 'short-medium', averageRate: 1.2, stretchFactor: 1.3 },
        lifecycle: { vegetative: 35, flowering: 63, totalDays: 101 },
        characteristics: { budStructure: 'dense', effects: ['relaxing', 'sedating'] },
        difficulty: 'beginner'
      },
      sativa: {
        expectedYield: { min: 100, max: 180, average: 140 },
        growthPattern: { height: 'tall', averageRate: 1.8, stretchFactor: 2.2 },
        lifecycle: { vegetative: 42, flowering: 77, totalDays: 122 },
        characteristics: { budStructure: 'airy', effects: ['energizing', 'uplifting'] },
        difficulty: 'intermediate'
      },
      hybrid: {
        expectedYield: { min: 110, max: 190, average: 150 },
        growthPattern: { height: 'medium', averageRate: 1.5, stretchFactor: 1.6 },
        lifecycle: { vegetative: 38, flowering: 70, totalDays: 111 },
        characteristics: { budStructure: 'medium-dense', effects: ['balanced', 'versatile'] },
        difficulty: 'beginner-intermediate'
      },
      auto: {
        expectedYield: { min: 50, max: 120, average: 85 },
        growthPattern: { height: 'short', averageRate: 1.0, stretchFactor: 1.1 },
        lifecycle: { vegetative: 21, flowering: 49, totalDays: 73 },
        characteristics: { budStructure: 'compact', effects: ['quick-onset', 'moderate'] },
        difficulty: 'beginner'
      }
    };

    return strainData[strainType] || strainData.hybrid;
  }

  /**
   * Adjust strain data for growing medium
   */
  static adjustForMedium(baseProfile, medium) {
    const mediumMultipliers = {
      hydro: { yield: 1.2, growthRate: 1.3 },
      coco: { yield: 1.1, growthRate: 1.15 },
      soil: { yield: 1.0, growthRate: 1.0 }
    };

    const multiplier = mediumMultipliers[medium] || mediumMultipliers.soil;
    
    return {
      ...baseProfile,
      expectedYield: {
        min: Math.round(baseProfile.expectedYield.min * multiplier.yield),
        max: Math.round(baseProfile.expectedYield.max * multiplier.yield),
        average: Math.round(baseProfile.expectedYield.average * multiplier.yield)
      },
      growthPattern: {
        ...baseProfile.growthPattern,
        averageRate: baseProfile.growthPattern.averageRate * multiplier.growthRate
      },
      medium: medium
    };
  }

  static getDetailedClassification(strainType) {
    const classifications = {
      indica: {
        origin: 'Hindu Kush mountains',
        effects: { physical: ['body relaxation'], mental: ['calming'], medical: ['pain relief'] },
        idealFor: ['evening use', 'pain relief'],
        growingTraits: ['compact size', 'dense buds']
      },
      sativa: {
        origin: 'Equatorial regions',
        effects: { physical: ['energizing'], mental: ['creativity'], medical: ['depression'] },
        idealFor: ['daytime use', 'creative work'],
        growingTraits: ['tall growth', 'airy buds']
      },
      hybrid: {
        origin: 'Cross-bred varieties',
        effects: { physical: ['balanced'], mental: ['adaptable'], medical: ['versatile'] },
        idealFor: ['any time use', 'beginners'],
        growingTraits: ['moderate size', 'balanced traits']
      },
      auto: {
        origin: 'Cannabis ruderalis genetics',
        effects: { physical: ['mild'], mental: ['balanced'], medical: ['consistent dosing'] },
        idealFor: ['beginners', 'quick harvests'],
        growingTraits: ['auto-flowering', 'compact size']
      }
    };

    return classifications[strainType] || classifications.hybrid;
  }

  static getStrainSpecificTips(strainType, medium) {
    const tips = {
      indica: {
        soil: ['Provide good drainage', 'Use LST early', 'Watch for mold'],
        coco: ['Feed more frequently', 'Monitor EC levels', 'Support heavy branches'],
        hydro: ['Keep solution cool', 'Monitor pH closely', 'Use SCROG']
      },
      sativa: {
        soil: ['Provide tall space', 'Use longer veg', 'Implement training early'],
        coco: ['Increase feeding in flower', 'Strong support', 'Good airflow'],
        hydro: ['Control height', 'Gradual light increase', 'Extended flowering']
      },
      hybrid: {
        soil: ['Adapt based on traits', 'Monitor response', 'Balanced nutrients'],
        coco: ['Moderate feeding', 'Versatile training', 'Monitor trichomes'],
        hydro: ['Conservative nutrients', 'Flexible approach', 'Fine-tune based on characteristics']
      },
      auto: {
        soil: ['Light soil mix', 'Avoid transplanting', 'Gentle training only'],
        coco: ['Smaller containers', 'Light frequent feeding', 'Avoid high stress'],
        hydro: ['DWC or NFT', 'Moderate nutrients', 'Consistent light']
      }
    };

    return tips[strainType]?.[medium] || tips.hybrid.soil;
  }
}

module.exports = StrainAnalysisService;
