/**
 * AI Recommendations API Client
 * Handles communication with the AI recommendation engine
 */

const API_BASE = '/api/recommendations';

// Cannabis-specific terminology constants
const CANNABIS_TERMINOLOGY = {
  growthStages: {
    seedling: 'Seedling',
    vegetative: 'Vegetative',
    flowering: 'Flowering',
    late_flowering: 'Late Flowering',
    harvest: 'Harvest'
  },
  strainTypes: {
    indica: 'Indica',
    sativa: 'Sativa',
    hybrid: 'Hybrid',
    autoflower: 'Autoflower'
  },
  trainingMethods: {
    lst: 'Low Stress Training (LST)',
    hst: 'High Stress Training (HST)',
    scrog: 'Screen of Green (SCROG)',
    topping: 'Topping',
    pruning: 'Pruning'
  },
  environmentalParams: {
    vpd: 'Vapor Pressure Deficit (VPD)',
    temperature: 'Temperature',
    humidity: 'Humidity',
    co2: 'CO₂ Level',
    light_intensity: 'Light Intensity'
  },
  nutrientTypes: {
    nitrogen: 'Nitrogen (N)',
    phosphorus: 'Phosphorus (P)',
    potassium: 'Potassium (K)',
    calcium: 'Calcium (Ca)',
    magnesium: 'Magnesium (Mg)',
    sulfur: 'Sulfur (S)'
  }
};

/**
 * Get recommendations for a specific plant
 */
export const getRecommendations = async (plantId, options = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (options.forceRefresh) params.append('forceRefresh', 'true');
    if (options.includeHistorical) params.append('includeHistorical', 'true');
    if (options.confidenceThreshold) params.append('confidenceThreshold', options.confidenceThreshold.toString());
    
    const response = await fetch(`${API_BASE}/${plantId}?${params}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch recommendations');
    }
    
    return data.data;
    
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    throw new Error(`Failed to get recommendations: ${error.message}`);
  }
};

/**
 * Get recommendation history for a plant
 */
export const getRecommendationHistory = async (plantId, options = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (options.limit) params.append('limit', options.limit.toString());
    
    const response = await fetch(`${API_BASE}/${plantId}/history?${params}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch recommendation history');
    }
    
    return data.data;
    
  } catch (error) {
    console.error('Error fetching recommendation history:', error);
    throw new Error(`Failed to get recommendation history: ${error.message}`);
  }
};

/**
 * Submit feedback on a recommendation
 */
export const submitRecommendationFeedback = async (recommendationId, feedback) => {
  try {
    const response = await fetch(`${API_BASE}/${recommendationId}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        implemented: feedback.implemented,
        effectiveness: feedback.effectiveness,
        notes: feedback.notes,
        outcome: feedback.outcome
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to submit feedback');
    }
    
    return data.data;
    
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw new Error(`Failed to submit feedback: ${error.message}`);
  }
};

/**
 * Manually trigger recommendation processing for a plant
 */
export const processRecommendations = async (plantId, options = {}) => {
  try {
    const response = await fetch(`${API_BASE}/${plantId}/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        forceRefresh: options.forceRefresh !== false
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to process recommendations');
    }
    
    return data.data;
    
  } catch (error) {
    console.error('Error processing recommendations:', error);
    throw new Error(`Failed to process recommendations: ${error.message}`);
  }
};

/**
 * Get recommendation service health status
 */
export const getRecommendationHealth = async () => {
  try {
    const response = await fetch(`${API_BASE}/health`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Health check failed');
    }
    
    return data.data;
    
  } catch (error) {
    console.error('Error checking recommendation health:', error);
    throw new Error(`Health check failed: ${error.message}`);
  }
};

/**
 * Get overall recommendation statistics
 */
export const getRecommendationStats = async () => {
  try {
    const response = await fetch(`${API_BASE}/stats/overview`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch recommendation statistics');
    }
    
    return data.data;
    
  } catch (error) {
    console.error('Error fetching recommendation stats:', error);
    throw new Error(`Failed to get recommendation statistics: ${error.message}`);
  }
};

/**
 * Clear recommendation cache for a plant
 */
export const clearRecommendationCache = async (plantId) => {
  try {
    const response = await fetch(`${API_BASE}/cache/${plantId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to clear recommendation cache');
    }
    
    return data.data;
    
  } catch (error) {
    console.error('Error clearing recommendation cache:', error);
    throw new Error(`Failed to clear recommendation cache: ${error.message}`);
  }
};

/**
 * Format recommendation data for display
 */
export const formatRecommendation = (recommendation) => {
  return {
    ...recommendation,
    formattedTitle: formatRecommendationTitle(recommendation),
    formattedDescription: formatRecommendationDescription(recommendation),
    formattedActions: formatRecommendationActions(recommendation),
    priorityColor: getPriorityColor(recommendation.priority),
    confidenceColor: getConfidenceColor(recommendation.confidence),
    categoryIcon: getCategoryIcon(recommendation.category)
  };
};

/**
 * Format recommendation title with cannabis terminology
 */
const formatRecommendationTitle = (recommendation) => {
  const { title, type, category } = recommendation;
  
  // Add cannabis-specific context to titles
  switch (category) {
    case 'vpd_optimization':
      return `🌱 ${title} - VPD Optimization`;
    case 'temperature_optimization':
      return `🌡️ ${title} - Temperature Control`;
    case 'humidity_optimization':
      return `💧 ${title} - Humidity Management`;
    case 'deficiency_prevention':
      return `🧪 ${title} - Nutrient Management`;
    case 'schedule_optimization':
      return `📅 ${title} - Feeding Schedule`;
    case 'training_optimization':
      return `✂️ ${title} - Plant Training`;
    case 'pruning_optimization':
      return `🌿 ${title} - Defoliation`;
    case 'timing_optimization':
      return `⏰ ${title} - Harvest Timing`;
    case 'pre_harvest_optimization':
      return `🌺 ${title} - Final Phase`;
    default:
      return `💡 ${title}`;
  }
};

/**
 * Format recommendation description with cannabis context
 */
const formatRecommendationDescription = (recommendation) => {
  const { description, reasoning } = recommendation;
  
  // Enhance description with cannabis-specific context
  let enhancedDescription = description;
  
  if (description.includes('VPD')) {
    enhancedDescription += ' VPD affects nutrient uptake and transpiration rates.';
  }
  
  if (description.includes('temperature')) {
    enhancedDescription += ' Temperature directly impacts metabolic activity and growth rate.';
  }
  
  if (description.includes('humidity')) {
    enhancedDescription += ' Humidity affects transpiration and disease resistance.';
  }
  
  if (description.includes('nutrient')) {
    enhancedDescription += ' Proper nutrient balance is crucial for healthy development.';
  }
  
  if (description.includes('training')) {
    enhancedDescription += ' Training improves light distribution and yield potential.';
  }
  
  if (description.includes('harvest')) {
    enhancedDescription += ' Optimal harvest timing maximizes potency and yield.';
  }
  
  return enhancedDescription;
};

/**
 * Format recommendation actions for display
 */
const formatRecommendationActions = (recommendation) => {
  return recommendation.actions.map(action => ({
    ...action,
    formattedAction: formatAction(action),
    actionIcon: getActionIcon(action.parameter),
    actionColor: getActionColor(action.parameter)
  }));
};

/**
 * Format individual action for display
 */
const formatAction = (action) => {
  const { parameter, action: actionType, currentValue, targetRange, expectedBenefit } = action;
  
  switch (parameter) {
    case 'humidity':
      return `Adjust humidity from ${currentValue}% to ${targetRange}`;
    case 'temperature':
      return `Adjust temperature from ${currentValue}°C to ${targetRange}`;
    case 'vpd':
      return `Optimize VPD from ${currentValue} kPa to ${targetRange}`;
    case 'nutrients':
      return `Adjust ${actionType} from ${currentValue} to ${targetRange}`;
    case 'feeding_schedule':
      return `Modify feeding schedule: ${actionType}`;
    case 'training':
      return `Apply ${actionType} for better growth structure`;
    case 'pruning':
      return `Perform ${actionType} to improve airflow`;
    case 'harvest':
      return `Prepare for harvest within ${targetRange}`;
    case 'environment':
      return `Optimize environment for ${actionType}`;
    default:
      return `${actionType}: ${currentValue} → ${targetRange}`;
  }
};

/**
 * Get priority color for UI display
 */
const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high':
      return '#ef4444'; // red
    case 'medium':
      return '#f59e0b'; // amber
    case 'low':
      return '#10b981'; // green
    default:
      return '#6b7280'; // gray
  }
};

/**
 * Get confidence color for UI display
 */
const getConfidenceColor = (confidence) => {
  if (confidence >= 0.9) return '#10b981'; // green
  if (confidence >= 0.8) return '#f59e0b'; // amber
  if (confidence >= 0.7) return '#ef4444'; // red
  return '#6b7280'; // gray
};

/**
 * Get category icon for UI display
 */
const getCategoryIcon = (category) => {
  switch (category) {
    case 'vpd_optimization':
    case 'temperature_optimization':
    case 'humidity_optimization':
      return '🌡️';
    case 'deficiency_prevention':
    case 'schedule_optimization':
      return '🧪';
    case 'training_optimization':
    case 'pruning_optimization':
      return '✂️';
    case 'timing_optimization':
    case 'pre_harvest_optimization':
      return '⏰';
    default:
      return '💡';
  }
};

/**
 * Get action icon for UI display
 */
const getActionIcon = (parameter) => {
  switch (parameter) {
    case 'humidity':
      return '💧';
    case 'temperature':
      return '🌡️';
    case 'vpd':
      return '🌱';
    case 'nutrients':
      return '🧪';
    case 'feeding_schedule':
      return '📅';
    case 'training':
      return '✂️';
    case 'pruning':
      return '🌿';
    case 'harvest':
      return '⏰';
    case 'environment':
      return '🌍';
    default:
      return '⚙️';
  }
};

/**
 * Get action color for UI display
 */
const getActionColor = (parameter) => {
  switch (parameter) {
    case 'humidity':
    case 'temperature':
    case 'vpd':
      return '#3b82f6'; // blue
    case 'nutrients':
    case 'feeding_schedule':
      return '#8b5cf6'; // purple
    case 'training':
    case 'pruning':
      return '#10b981'; // green
    case 'harvest':
      return '#f59e0b'; // amber
    case 'environment':
      return '#06b6d4'; // cyan
    default:
      return '#6b7280'; // gray
  }
};

/**
 * Validate recommendation feedback data
 */
export const validateFeedback = (feedback) => {
  const errors = [];
  
  if (typeof feedback.implemented !== 'boolean') {
    errors.push('Implemented field must be true or false');
  }
  
  if (feedback.implemented && !feedback.effectiveness) {
    errors.push('Effectiveness is required when recommendation was implemented');
  }
  
  if (feedback.effectiveness && !['positive', 'neutral', 'negative'].includes(feedback.effectiveness)) {
    errors.push('Effectiveness must be positive, neutral, or negative');
  }
  
  if (feedback.notes && feedback.notes.length > 1000) {
    errors.push('Notes must be less than 1000 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Get cannabis terminology constants
 */
export const getCannabisTerminology = () => CANNABIS_TERMINOLOGY;

export default {
  getRecommendations,
  getRecommendationHistory,
  submitRecommendationFeedback,
  processRecommendations,
  getRecommendationHealth,
  getRecommendationStats,
  clearRecommendationCache,
  formatRecommendation,
  validateFeedback,
  getCannabisTerminology
}; 