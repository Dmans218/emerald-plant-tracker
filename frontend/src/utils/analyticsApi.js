/**
 * Analytics API Client
 * Provides functions to interact with the analytics backend endpoints
 */

const API_BASE = '/api/analytics';

/**
 * Fetch latest analytics data for a plant
 * @param {number} plantId - Plant ID
 * @returns {Promise<Object>} Latest analytics data
 */
export const getLatestAnalytics = async plantId => {
  try {
    const response = await fetch(`${API_BASE}/${plantId}/latest`);

    if (!response.ok) {
      throw new Error(`Failed to fetch analytics: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch analytics data');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching latest analytics:', error);
    throw error;
  }
};

/**
 * Fetch trend data for charts and visualizations
 * @param {number} plantId - Plant ID
 * @param {number} days - Number of days to look back
 * @returns {Promise<Object>} Trend data
 */
export const getTrendAnalytics = async (plantId, days = 30) => {
  try {
    const response = await fetch(`${API_BASE}/${plantId}/trends?days=${days}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch trends: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch trend data');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching trend analytics:', error);
    throw error;
  }
};

/**
 * Process analytics for a plant (manual trigger)
 * @param {number} plantId - Plant ID
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} Processed analytics data
 */
export const processAnalytics = async (plantId, options = {}) => {
  try {
    const response = await fetch(`${API_BASE}/${plantId}/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      throw new Error(`Failed to process analytics: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to process analytics');
    }

    return data.data;
  } catch (error) {
    console.error('Error processing analytics:', error);
    throw error;
  }
};

/**
 * Check analytics service health
 * @returns {Promise<Object>} Service health status
 */
export const getAnalyticsHealth = async () => {
  try {
    const response = await fetch(`${API_BASE}/health`);

    if (!response.ok) {
      return { success: false, error: 'Service unavailable' };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking analytics health:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Fetch list of available grow tents with analytics data
 * @returns {Promise<Array>} List of tents with data counts
 */
export const getTents = async () => {
  try {
    const response = await fetch(`${API_BASE}/tents`);

    if (!response.ok) {
      throw new Error(`Failed to fetch tents: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch tent data');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching tents:', error);
    throw error;
  }
};

/**
 * Fetch analytics overview for a specific tent
 * @param {string} tentName - Name of the grow tent
 * @returns {Promise<Object>} Tent analytics overview
 */
export const getTentOverview = async tentName => {
  try {
    const response = await fetch(`${API_BASE}/tent/${encodeURIComponent(tentName)}/overview`);

    if (!response.ok) {
      throw new Error(`Failed to fetch tent overview: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch tent overview');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching tent overview:', error);
    throw error;
  }
};

/**
 * Process analytics for all plants in a tent
 * @param {string} tentName - Name of the grow tent
 * @param {boolean} forceRecalculation - Whether to force recalculation
 * @returns {Promise<Object>} Processing results
 */
export const processTentAnalytics = async (tentName, forceRecalculation = false) => {
  try {
    const response = await fetch(`${API_BASE}/tent/${encodeURIComponent(tentName)}/process-all`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        force_recalculation: forceRecalculation,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to process tent analytics: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to process tent analytics');
    }

    return data.data;
  } catch (error) {
    console.error('Error processing tent analytics:', error);
    throw error;
  }
};

/**
 * Fetch comprehensive deep-dive analytics for a plant
 * @param {number} plantId - Plant ID
 * @returns {Promise<Object>} Deep-dive analytics data
 */
export const getDeepDiveAnalytics = async plantId => {
  try {
    const response = await fetch(`${API_BASE}/${plantId}/deep-dive`);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch deep-dive analytics: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch deep-dive analytics');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching deep-dive analytics:', error);
    throw error;
  }
};

/**
 * Fetch strain-specific analytics and genetic potential comparison
 * @param {number} plantId - Plant ID
 * @returns {Promise<Object>} Strain analysis data
 */
export const getStrainAnalysis = async plantId => {
  try {
    const response = await fetch(`${API_BASE}/${plantId}/strain-analysis`);

    if (!response.ok) {
      throw new Error(`Failed to fetch strain analysis: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch strain analysis');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching strain analysis:', error);
    throw error;
  }
};

/**
 * Fetch growth stage progression and milestone tracking
 * @param {number} plantId - Plant ID
 * @returns {Promise<Object>} Growth timeline data
 */
export const getGrowthTimeline = async plantId => {
  try {
    const response = await fetch(`${API_BASE}/${plantId}/growth-timeline`);

    if (!response.ok) {
      throw new Error(`Failed to fetch growth timeline: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch growth timeline');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching growth timeline:', error);
    throw error;
  }
};

/**
 * Fetch environmental impact correlation analysis
 * @param {number} plantId - Plant ID
 * @param {Object} options - Analysis options
 * @param {number} options.days - Number of days to analyze (default: 30)
 * @param {Array} options.metrics - Metrics to analyze
 * @returns {Promise<Object>} Environmental correlation data
 */
export const getEnvironmentalCorrelation = async (plantId, options = {}) => {
  try {
    const { days = 30, metrics = ['temperature', 'humidity', 'vpd', 'light', 'co2'] } = options;
    const queryParams = new URLSearchParams({
      days: days.toString(),
      metrics: metrics.join(','),
    });

    const response = await fetch(`${API_BASE}/${plantId}/environmental-correlation?${queryParams}`);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch environmental correlation: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch environmental correlation');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching environmental correlation:', error);
    throw error;
  }
};

/**
 * Fetch historical comparison with previous grows
 * @param {number} plantId - Plant ID
 * @param {Object} options - Comparison options
 * @param {boolean} options.compareStrain - Compare plants with same strain
 * @param {boolean} options.compareMedium - Compare plants with same growing medium
 * @param {number} options.limit - Maximum number of historical plants to compare
 * @returns {Promise<Object>} Historical comparison data
 */
export const getHistoricalComparison = async (plantId, options = {}) => {
  try {
    const { compareStrain = true, compareMedium = true, limit = 5 } = options;
    const queryParams = new URLSearchParams({
      compare_strain: compareStrain.toString(),
      compare_medium: compareMedium.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(`${API_BASE}/${plantId}/historical-comparison?${queryParams}`);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch historical comparison: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch historical comparison');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching historical comparison:', error);
    throw error;
  }
};

/**
 * Transform analytics data for chart visualization
 * @param {Object} analyticsData - Raw analytics data
 * @returns {Object} Transformed data for charts
 */
export const transformAnalyticsForCharts = analyticsData => {
  if (!analyticsData) return null;

  return {
    yieldPrediction: {
      value: analyticsData.yield_prediction || 0,
      confidence: analyticsData.confidence || 0.8,
      unit: 'grams',
    },
    growthRate: {
      value: analyticsData.growth_rate || 0,
      unit: 'cm/day',
      stage: analyticsData.current_stage || 'unknown',
    },
    environmentalEfficiency: {
      overall: analyticsData.environmental_efficiency?.overall_score || 0,
      vpd: analyticsData.environmental_efficiency?.vpd_score || 0,
      temperature: analyticsData.environmental_efficiency?.temperature_score || 0,
      humidity: analyticsData.environmental_efficiency?.humidity_score || 0,
      light: analyticsData.environmental_efficiency?.light_score || 0,
    },
    recommendations: analyticsData.recommendations || [],
  };
};

/**
 * Format analytics values for display
 * @param {number} value - Raw value
 * @param {string} type - Value type (yield, growth_rate, efficiency, confidence)
 * @returns {string} Formatted value
 */
export const formatAnalyticsValue = (value, type) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '--';
  }

  switch (type) {
    case 'yield':
      return `${Math.round(value)}g`;
    case 'growth_rate':
      return `${value.toFixed(1)} cm/day`;
    case 'efficiency':
    case 'confidence':
      return `${Math.round(value * 100)}%`;
    case 'temperature':
      return `${value.toFixed(1)}°C`;
    case 'humidity':
      return `${Math.round(value)}%`;
    case 'vpd':
      return `${value.toFixed(2)} kPa`;
    case 'co2':
      return `${Math.round(value)} ppm`;
    case 'light':
      return `${Math.round(value)} PPFD`;
    default:
      return value.toString();
  }
};

/**
 * Get color for analytics values based on performance
 * @param {number} value - Analytics value
 * @param {string} type - Value type
 * @returns {string} CSS color value
 */
export const getAnalyticsColor = (value, type) => {
  if (value === null || value === undefined || isNaN(value)) {
    return 'var(--text-muted)';
  }

  switch (type) {
    case 'yield':
      if (value >= 150) return 'var(--success-color, #22c55e)';
      if (value >= 100) return 'var(--warning-color, #f59e0b)';
      return 'var(--error-color, #ef4444)';

    case 'efficiency':
    case 'confidence':
      if (value >= 0.8) return 'var(--success-color, #22c55e)';
      if (value >= 0.6) return 'var(--warning-color, #f59e0b)';
      return 'var(--error-color, #ef4444)';

    case 'growth_rate':
      if (value >= 1.5) return 'var(--success-color, #22c55e)';
      if (value >= 1.0) return 'var(--warning-color, #f59e0b)';
      return 'var(--error-color, #ef4444)';

    default:
      return 'var(--primary-color, #4ade80)';
  }
};

/**
 * Cannabis-specific terminology for analytics
 */
export const CANNABIS_TERMINOLOGY = {
  growth_stages: {
    germination: 'Germination',
    seedling: 'Seedling',
    vegetative: 'Vegetative',
    pre_flower: 'Pre-flower',
    flowering: 'Flowering',
    harvest: 'Harvest',
    cured: 'Cured',
  },
  strain_types: {
    indica: 'Indica',
    sativa: 'Sativa',
    hybrid: 'Hybrid',
    auto: 'Autoflower',
  },
  recommendation_types: {
    environmental: 'Environmental',
    nutrient: 'Nutrients',
    training: 'Training',
    harvest: 'Harvest Timing',
    pest_disease: 'Pest & Disease',
    general: 'General Care',
  },
  growing_mediums: {
    soil: 'Soil',
    coco: 'Coco Coir',
    hydro: 'Hydroponic',
    dwc: 'Deep Water Culture',
    nft: 'Nutrient Film Technique',
  },
};

export const OPTIMAL_CONDITIONS = {
  seedling: {
    temperature: { min: 20, max: 25, optimal: 22.5 },
    humidity: { min: 65, max: 75, optimal: 70 },
    vpd: { min: 0.4, max: 0.8, optimal: 0.6 },
    light: { min: 200, max: 400, optimal: 300 },
    co2: { min: 400, max: 600, optimal: 500 },
  },
  vegetative: {
    temperature: { min: 22, max: 28, optimal: 25 },
    humidity: { min: 55, max: 65, optimal: 60 },
    vpd: { min: 0.8, max: 1.2, optimal: 1.0 },
    light: { min: 400, max: 600, optimal: 500 },
    co2: { min: 600, max: 1000, optimal: 800 },
  },
  flowering: {
    temperature: { min: 20, max: 26, optimal: 23 },
    humidity: { min: 45, max: 55, optimal: 50 },
    vpd: { min: 1.0, max: 1.4, optimal: 1.2 },
    light: { min: 600, max: 1000, optimal: 800 },
    co2: { min: 800, max: 1200, optimal: 1000 },
  },
};

export default {
  getLatestAnalytics,
  getTrendAnalytics,
  processAnalytics,
  getAnalyticsHealth,
  getDeepDiveAnalytics,
  getStrainAnalysis,
  getGrowthTimeline,
  getEnvironmentalCorrelation,
  getHistoricalComparison,
  transformAnalyticsForCharts,
  formatAnalyticsValue,
  getAnalyticsColor,
  CANNABIS_TERMINOLOGY,
  OPTIMAL_CONDITIONS,
};
