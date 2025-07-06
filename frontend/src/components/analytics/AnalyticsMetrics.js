import { Activity, Target, TrendingUp, Zap } from 'lucide-react';
import React from 'react';
import { formatAnalyticsValue, getAnalyticsColor } from '../../utils/analyticsApi';

/**
 * AnalyticsMetrics Component
 * Displays key performance indicators for plant analytics
 */
const AnalyticsMetrics = ({ analytics, loading = false }) => {
  if (loading) {
    return (
      <div className="analytics-metrics">
        <div className="metrics-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="metric-card loading">
              <div className="metric-icon">
                <div className="loading-placeholder"></div>
              </div>
              <div className="metric-content">
                <div className="loading-placeholder loading-text"></div>
                <div className="loading-placeholder loading-value"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="analytics-metrics">
        <div className="no-data">
          <Activity className="no-data-icon" />
          <p>No analytics data available</p>
          <small>Analytics will appear once data is processed</small>
        </div>
      </div>
    );
  }

  const {
    yieldPrediction,
    growthRate,
    environmentalEfficiency
  } = analytics;

  const metrics = [
    {
      id: 'yield',
      label: 'Predicted Yield',
      value: yieldPrediction?.value || 0,
      type: 'yield',
      icon: Target,
      description: `Estimated final yield based on current growth patterns`,
      confidence: yieldPrediction?.confidence
    },
    {
      id: 'growth',
      label: 'Growth Rate',
      value: growthRate?.value || 0,
      type: 'growth_rate',
      icon: TrendingUp,
      description: `Current growth rate for ${growthRate?.stage || 'current'} stage`,
      unit: growthRate?.unit || 'cm/day'
    },
    {
      id: 'efficiency',
      label: 'Environmental Efficiency',
      value: environmentalEfficiency?.overall || 0,
      type: 'efficiency',
      icon: Zap,
      description: 'Overall environmental optimization score',
      breakdown: environmentalEfficiency
    },
    {
      id: 'vpd',
      label: 'VPD Efficiency',
      value: environmentalEfficiency?.vpd || 0,
      type: 'efficiency',
      icon: Activity,
      description: 'Vapor Pressure Deficit optimization (ideal: 0.8-1.2 kPa)',
      isVpd: true
    }
  ];

  return (
    <div className="analytics-metrics">
      <div className="metrics-header">
        <h3>Key Performance Indicators</h3>
        <p>Real-time cultivation metrics and predictions</p>
      </div>

      <div className="metrics-grid">
        {metrics.map(metric => {
          const IconComponent = metric.icon;
          const formattedValue = formatAnalyticsValue(metric.value, metric.type);
          const color = getAnalyticsColor(metric.value, metric.type);

          return (
            <div key={metric.id} className="metric-card">
              <div className="metric-header">
                <div className="metric-icon" style={{ color }}>
                  <IconComponent size={24} />
                </div>
                <div className="metric-info">
                  <h4>{metric.label}</h4>
                  {metric.confidence && (
                    <span className="confidence-badge">
                      {formatAnalyticsValue(metric.confidence, 'confidence')} confidence
                    </span>
                  )}
                </div>
              </div>

              <div className="metric-value" style={{ color }}>
                {formattedValue}
                {metric.unit && metric.type !== 'yield' && metric.type !== 'efficiency' && (
                  <span className="metric-unit">{metric.unit}</span>
                )}
              </div>

              <div className="metric-description">
                {metric.description}
              </div>

              {metric.breakdown && metric.id === 'efficiency' && (
                <div className="efficiency-breakdown">
                  <div className="breakdown-grid">
                    <div className="breakdown-item">
                      <span className="breakdown-label">VPD</span>
                      <span className="breakdown-value">
                        {formatAnalyticsValue(metric.breakdown.vpd, 'efficiency')}
                      </span>
                    </div>
                    <div className="breakdown-item">
                      <span className="breakdown-label">Temp</span>
                      <span className="breakdown-value">
                        {formatAnalyticsValue(metric.breakdown.temperature, 'efficiency')}
                      </span>
                    </div>
                    <div className="breakdown-item">
                      <span className="breakdown-label">Humidity</span>
                      <span className="breakdown-value">
                        {formatAnalyticsValue(metric.breakdown.humidity, 'efficiency')}
                      </span>
                    </div>
                    <div className="breakdown-item">
                      <span className="breakdown-label">Light</span>
                      <span className="breakdown-value">
                        {formatAnalyticsValue(metric.breakdown.light, 'efficiency')}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnalyticsMetrics;
