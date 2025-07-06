import { AlertCircle, Info, Target, TrendingUp } from 'lucide-react';
import React from 'react';
import { formatAnalyticsValue, getAnalyticsColor } from '../../utils/analyticsApi';

/**
 * YieldPredictionCard Component
 * Displays yield prediction with confidence scoring and context
 */
const YieldPredictionCard = ({ analytics, plantData, loading = false }) => {
  if (loading) {
    return (
      <div className="yield-prediction-card">
        <div className="card-header">
          <div className="loading-placeholder loading-title"></div>
        </div>
        <div className="prediction-content">
          <div className="loading-placeholder loading-value-large"></div>
          <div className="loading-placeholder loading-text"></div>
          <div className="loading-placeholder loading-text"></div>
        </div>
      </div>
    );
  }

  if (!analytics?.yieldPrediction) {
    return (
      <div className="yield-prediction-card">
        <div className="card-header">
          <Target className="card-icon" />
          <h3>Yield Prediction</h3>
        </div>
        <div className="no-data">
          <AlertCircle className="no-data-icon" />
          <p>No prediction available</p>
          <small>Yield prediction will appear once sufficient data is collected</small>
        </div>
      </div>
    );
  }

  const { yieldPrediction } = analytics;
  const { value, confidence } = yieldPrediction;

  // Calculate confidence level
  const getConfidenceLevel = (confidence) => {
    if (confidence >= 0.8) return { level: 'high', color: 'var(--success-color)', label: 'High Confidence' };
    if (confidence >= 0.6) return { level: 'medium', color: 'var(--warning-color)', label: 'Medium Confidence' };
    return { level: 'low', color: 'var(--error-color)', label: 'Low Confidence' };
  };

  const confidenceInfo = getConfidenceLevel(confidence || 0.8);
  const yieldColor = getAnalyticsColor(value, 'yield');

  // Calculate yield range based on confidence
  const yieldRange = {
    low: Math.round(value * (1 - (1 - confidence) * 0.5)),
    high: Math.round(value * (1 + (1 - confidence) * 0.5))
  };

  // Determine yield category
  const getYieldCategory = (yieldValue) => {
    if (yieldValue >= 200) return { category: 'Excellent', description: 'Outstanding yield potential' };
    if (yieldValue >= 150) return { category: 'Good', description: 'Above average yield expected' };
    if (yieldValue >= 100) return { category: 'Average', description: 'Standard yield expected' };
    return { category: 'Below Average', description: 'Consider optimization strategies' };
  };

  const yieldCategory = getYieldCategory(value);

  return (
    <div className="yield-prediction-card">
      <div className="card-header">
        <div className="header-content">
          <Target className="card-icon" style={{ color: yieldColor }} />
          <div className="header-text">
            <h3>Yield Prediction</h3>
            {plantData?.strain && (
              <span className="strain-info">{plantData.strain}</span>
            )}
          </div>
        </div>
        <div className="confidence-indicator">
          <div
            className="confidence-badge"
            style={{
              backgroundColor: `${confidenceInfo.color}20`,
              borderColor: confidenceInfo.color,
              color: confidenceInfo.color
            }}
          >
            {formatAnalyticsValue(confidence, 'confidence')}
          </div>
        </div>
      </div>

      <div className="prediction-content">
        <div className="main-prediction">
          <div className="prediction-value" style={{ color: yieldColor }}>
            {formatAnalyticsValue(value, 'yield')}
          </div>
          <div className="prediction-label">
            Estimated Final Yield
          </div>
        </div>

        <div className="prediction-details">
          <div className="detail-row">
            <span className="detail-label">Confidence Level:</span>
            <span className="detail-value" style={{ color: confidenceInfo.color }}>
              {confidenceInfo.label}
            </span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Expected Range:</span>
            <span className="detail-value">
              {yieldRange.low}g - {yieldRange.high}g
            </span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Performance:</span>
            <span className="detail-value" style={{ color: yieldColor }}>
              {yieldCategory.category}
            </span>
          </div>
        </div>

        <div className="yield-insights">
          <div className="insight-item">
            <Info className="insight-icon" />
            <span>{yieldCategory.description}</span>
          </div>

          {plantData?.growth_stage && (
            <div className="insight-item">
              <TrendingUp className="insight-icon" />
              <span>
                Currently in {plantData.growth_stage} stage
                {plantData.days_in_current_stage && (
                  ` (Day ${Math.round(plantData.days_in_current_stage)})`
                )}
              </span>
            </div>
          )}
        </div>

        {confidence < 0.7 && (
          <div className="confidence-warning">
            <AlertCircle size={16} />
            <span>
              Prediction confidence is {confidenceInfo.level}.
              More data will improve accuracy over time.
            </span>
          </div>
        )}
      </div>

      <div className="prediction-footer">
        <small>
          Prediction based on current growth patterns, environmental conditions,
          and historical data from similar strains and growing conditions.
        </small>
      </div>
    </div>
  );
};

export default YieldPredictionCard;
