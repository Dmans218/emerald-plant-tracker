import {
    Activity,
    AlertTriangle,
    Droplets,
    Sun,
    Target,
    Thermometer,
    TrendingDown,
    TrendingUp,
    Wind
} from 'lucide-react';
import React, { useState } from 'react';
import { formatAnalyticsValue, getAnalyticsColor } from '../../utils/analyticsApi';
import AnalyticsChart from '../AnalyticsChart';

/**
 * EnvironmentalCorrelation Component
 * Displays environmental impact correlation analysis with heat maps
 */
const EnvironmentalCorrelation = ({ environmentalData, plantData, loading = false }) => {
  const [selectedMetric, setSelectedMetric] = useState('temperature');
  const [timeRange, setTimeRange] = useState(30); // days

  if (loading) {
    return (
      <div className="environmental-correlation">
        <div className="correlation-header">
          <div className="loading-placeholder loading-title"></div>
          <div className="loading-placeholder loading-controls"></div>
        </div>
        <div className="correlation-content">
          <div className="loading-placeholder loading-chart"></div>
        </div>
      </div>
    );
  }

  if (!environmentalData) {
    return (
      <div className="environmental-correlation">
        <div className="correlation-header">
          <Thermometer className="correlation-icon" />
          <h3>Environmental Impact Analysis</h3>
        </div>
        <div className="no-data">
          <AlertTriangle className="no-data-icon" />
          <p>No environmental correlation data available</p>
          <small>Analysis will appear once environmental data is processed</small>
        </div>
      </div>
    );
  }

  const { correlations, optimalConditions, deviations, recommendations, dataQuality } = environmentalData;

  // Get metric icon and color
  const getMetricIcon = (metric) => {
    switch (metric) {
      case 'temperature':
        return <Thermometer className="metric-icon" style={{ color: '#f87171' }} />;
      case 'humidity':
        return <Droplets className="metric-icon" style={{ color: '#60a5fa' }} />;
      case 'vpd':
        return <Wind className="metric-icon" style={{ color: '#22d3ee' }} />;
      case 'light':
        return <Sun className="metric-icon" style={{ color: '#fbbf24' }} />;
      case 'co2':
        return <Activity className="metric-icon" style={{ color: '#a78bfa' }} />;
      default:
        return <Activity className="metric-icon" />;
    }
  };

  const getMetricColor = (metric) => {
    switch (metric) {
      case 'temperature':
        return '#f87171';
      case 'humidity':
        return '#60a5fa';
      case 'vpd':
        return '#22d3ee';
      case 'light':
        return '#fbbf24';
      case 'co2':
        return '#a78bfa';
      default:
        return '#6b7280';
    }
  };

  // Get correlation strength description
  const getCorrelationStrength = (correlation) => {
    const abs = Math.abs(correlation);
    if (abs >= 0.8) return { strength: 'Very Strong', color: '#22c55e' };
    if (abs >= 0.6) return { strength: 'Strong', color: '#10b981' };
    if (abs >= 0.4) return { strength: 'Moderate', color: '#f59e0b' };
    if (abs >= 0.2) return { strength: 'Weak', color: '#f97316' };
    return { strength: 'Very Weak', color: '#6b7280' };
  };

  // Get correlation direction
  const getCorrelationDirection = (correlation) => {
    if (correlation > 0.1) return { direction: 'Positive', icon: TrendingUp, color: '#22c55e' };
    if (correlation < -0.1) return { direction: 'Negative', icon: TrendingDown, color: '#ef4444' };
    return { direction: 'Neutral', icon: Activity, color: '#6b7280' };
  };

  // Prepare correlation chart data
  const prepareCorrelationChartData = () => {
    if (!correlations) return null;

    const metrics = Object.keys(correlations);
    const correlationValues = metrics.map(metric =>
      correlations[metric]?.correlation || 0
    );

    return {
      labels: metrics.map(metric => metric.charAt(0).toUpperCase() + metric.slice(1)),
      datasets: [
        {
          label: 'Correlation with Growth',
          data: correlationValues,
          backgroundColor: correlationValues.map(value => {
            const abs = Math.abs(value);
            if (abs >= 0.6) return value > 0 ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)';
            if (abs >= 0.4) return value > 0 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(249, 115, 22, 0.8)';
            if (abs >= 0.2) return 'rgba(245, 158, 11, 0.8)';
            return 'rgba(107, 114, 128, 0.8)';
          }),
          borderColor: correlationValues.map(value => {
            const abs = Math.abs(value);
            if (abs >= 0.6) return value > 0 ? 'rgba(34, 197, 94, 1)' : 'rgba(239, 68, 68, 1)';
            if (abs >= 0.4) return value > 0 ? 'rgba(16, 185, 129, 1)' : 'rgba(249, 115, 22, 1)';
            if (abs >= 0.2) return 'rgba(245, 158, 11, 1)';
            return 'rgba(107, 114, 128, 1)';
          }),
          borderWidth: 2
        }
      ]
    };
  };

  // Prepare deviations chart data
  const prepareDeviationsChartData = () => {
    if (!deviations || !optimalConditions) return null;

    const metrics = Object.keys(deviations);
    const deviationPercentages = metrics.map(metric => {
      const deviation = deviations[metric];
      const optimal = optimalConditions[metric];
      if (!deviation || !optimal) return 0;

      // Calculate percentage deviation from optimal range
      const range = optimal.max - optimal.min;
      const avgDeviation = (Math.abs(deviation.avgDeviation) / range) * 100;
      return Math.min(avgDeviation, 100); // Cap at 100%
    });

    return {
      labels: metrics.map(metric => metric.charAt(0).toUpperCase() + metric.slice(1)),
      datasets: [
        {
          label: 'Deviation from Optimal (%)',
          data: deviationPercentages,
          backgroundColor: deviationPercentages.map(value => {
            if (value <= 10) return 'rgba(34, 197, 94, 0.8)';
            if (value <= 25) return 'rgba(245, 158, 11, 0.8)';
            if (value <= 50) return 'rgba(249, 115, 22, 0.8)';
            return 'rgba(239, 68, 68, 0.8)';
          }),
          borderColor: deviationPercentages.map(value => {
            if (value <= 10) return 'rgba(34, 197, 94, 1)';
            if (value <= 25) return 'rgba(245, 158, 11, 1)';
            if (value <= 50) return 'rgba(249, 115, 22, 1)';
            return 'rgba(239, 68, 68, 1)';
          }),
          borderWidth: 2
        }
      ]
    };
  };

  return (
    <div className="environmental-correlation">
      <div className="correlation-header">
        <div className="header-content">
          <Thermometer className="correlation-icon" style={{ color: 'var(--primary-color)' }} />
          <div className="header-text">
            <h3>Environmental Impact Analysis</h3>
            <span className="correlation-subtitle">
              Correlation between environmental conditions and plant performance
            </span>
          </div>
        </div>

        <div className="correlation-controls">
          <div className="metric-selector">
            {Object.keys(correlations || {}).map(metric => (
              <button
                key={metric}
                className={`metric-btn ${selectedMetric === metric ? 'active' : ''}`}
                onClick={() => setSelectedMetric(metric)}
                style={{
                  borderColor: selectedMetric === metric ? getMetricColor(metric) : 'transparent'
                }}
              >
                {getMetricIcon(metric)}
                <span>{metric.charAt(0).toUpperCase() + metric.slice(1)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Data Quality Indicator */}
      {dataQuality && (
        <div className="data-quality-indicator">
          <div className="quality-metrics">
            <div className="quality-metric">
              <span className="quality-label">Readings:</span>
              <span className="quality-value">{dataQuality.totalReadings}</span>
            </div>
            <div className="quality-metric">
              <span className="quality-label">Coverage:</span>
              <span className="quality-value">
                {(dataQuality.coverage * 100).toFixed(1)}%
              </span>
            </div>
            <div className="quality-metric">
              <span className="quality-label">Analysis Period:</span>
              <span className="quality-value">{timeRange} days</span>
            </div>
          </div>
        </div>
      )}

      {/* Correlation Overview */}
      <div className="correlation-overview">
        <div className="correlation-stats">
          {correlations && Object.entries(correlations).map(([metric, data]) => {
            const strength = getCorrelationStrength(data.correlation || 0);
            const direction = getCorrelationDirection(data.correlation || 0);
            const DirectionIcon = direction.icon;

            return (
              <div
                key={metric}
                className={`correlation-stat ${selectedMetric === metric ? 'selected' : ''}`}
                onClick={() => setSelectedMetric(metric)}
              >
                <div className="stat-header">
                  {getMetricIcon(metric)}
                  <span className="stat-metric">{metric.charAt(0).toUpperCase() + metric.slice(1)}</span>
                </div>
                <div className="stat-content">
                  <div className="correlation-value">
                    <DirectionIcon
                      className="direction-icon"
                      style={{ color: direction.color }}
                      size={16}
                    />
                    <span className="correlation-number">
                      {(data.correlation || 0).toFixed(3)}
                    </span>
                  </div>
                  <div className="correlation-description">
                    <span
                      className="strength"
                      style={{ color: strength.color }}
                    >
                      {strength.strength}
                    </span>
                    <span className="direction">{direction.direction}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts */}
      <div className="correlation-charts">
        <div className="chart-section">
          <h4>Environmental Correlations</h4>
          <AnalyticsChart
            type="bar"
            data={prepareCorrelationChartData()}
            title="Correlation with Plant Growth"
            height={300}
            loading={!correlations}
          />
        </div>

        <div className="chart-section">
          <h4>Optimal Range Deviations</h4>
          <AnalyticsChart
            type="bar"
            data={prepareDeviationsChartData()}
            title="Deviation from Optimal Conditions"
            height={300}
            loading={!deviations}
          />
        </div>
      </div>

      {/* Detailed Analysis for Selected Metric */}
      {selectedMetric && correlations[selectedMetric] && (
        <div className="detailed-analysis">
          <h4>{selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Analysis</h4>

          <div className="analysis-grid">
            <div className="analysis-card">
              <div className="card-header">
                <Target className="card-icon" />
                <h5>Optimal Range</h5>
              </div>
              <div className="card-content">
                {optimalConditions[selectedMetric] && (
                  <div className="optimal-range">
                    <div className="range-item">
                      <span className="range-label">Minimum:</span>
                      <span className="range-value">
                        {formatAnalyticsValue(optimalConditions[selectedMetric].min, selectedMetric)}
                      </span>
                    </div>
                    <div className="range-item">
                      <span className="range-label">Optimal:</span>
                      <span className="range-value optimal">
                        {formatAnalyticsValue(optimalConditions[selectedMetric].optimal, selectedMetric)}
                      </span>
                    </div>
                    <div className="range-item">
                      <span className="range-label">Maximum:</span>
                      <span className="range-value">
                        {formatAnalyticsValue(optimalConditions[selectedMetric].max, selectedMetric)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="analysis-card">
              <div className="card-header">
                <Activity className="card-icon" />
                <h5>Current Performance</h5>
              </div>
              <div className="card-content">
                {deviations[selectedMetric] && (
                  <div className="current-performance">
                    <div className="performance-item">
                      <span className="performance-label">Average Value:</span>
                      <span className="performance-value">
                        {formatAnalyticsValue(deviations[selectedMetric].avgValue, selectedMetric)}
                      </span>
                    </div>
                    <div className="performance-item">
                      <span className="performance-label">Deviation:</span>
                      <span
                        className="performance-value"
                        style={{
                          color: Math.abs(deviations[selectedMetric].avgDeviation) > 5
                            ? 'var(--warning-color)'
                            : 'var(--success-color)'
                        }}
                      >
                        {deviations[selectedMetric].avgDeviation > 0 ? '+' : ''}
                        {formatAnalyticsValue(deviations[selectedMetric].avgDeviation, selectedMetric)}
                      </span>
                    </div>
                    <div className="performance-item">
                      <span className="performance-label">Stability:</span>
                      <span className="performance-value">
                        {deviations[selectedMetric].stability || 'Unknown'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="analysis-card">
              <div className="card-header">
                <TrendingUp className="card-icon" />
                <h5>Impact Assessment</h5>
              </div>
              <div className="card-content">
                {correlations[selectedMetric] && (
                  <div className="impact-assessment">
                    <div className="impact-item">
                      <span className="impact-label">Growth Impact:</span>
                      <span
                        className="impact-value"
                        style={{
                          color: getCorrelationStrength(correlations[selectedMetric].correlation).color
                        }}
                      >
                        {getCorrelationStrength(correlations[selectedMetric].correlation).strength}
                      </span>
                    </div>
                    <div className="impact-item">
                      <span className="impact-label">Correlation:</span>
                      <span className="impact-value">
                        {(correlations[selectedMetric].correlation || 0).toFixed(3)}
                      </span>
                    </div>
                    <div className="impact-item">
                      <span className="impact-label">Significance:</span>
                      <span className="impact-value">
                        {correlations[selectedMetric].significance || 'Unknown'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="environmental-recommendations">
          <h4>Environmental Optimization Recommendations</h4>
          <div className="recommendations-grid">
            {recommendations.map((rec, index) => (
              <div key={index} className="recommendation-card">
                <div className="recommendation-header">
                  <div className="recommendation-priority">
                    {rec.priority === 'high' && '🔴'}
                    {rec.priority === 'medium' && '🟡'}
                    {rec.priority === 'low' && '🟢'}
                  </div>
                  <h5>{rec.title}</h5>
                </div>
                <div className="recommendation-content">
                  <p>{rec.description}</p>
                  {rec.expectedImpact && (
                    <div className="expected-impact">
                      <span className="impact-label">Expected Impact:</span>
                      <span
                        className="impact-value"
                        style={{ color: getAnalyticsColor(rec.expectedImpact, 'efficiency') }}
                      >
                        +{rec.expectedImpact}% improvement
                      </span>
                    </div>
                  )}
                  {rec.actionSteps && (
                    <div className="action-steps">
                      <span className="steps-label">Action Steps:</span>
                      <ul>
                        {rec.actionSteps.map((step, stepIndex) => (
                          <li key={stepIndex}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="correlation-footer">
        <small>
          Environmental correlation analysis based on {dataQuality?.totalReadings || 0} readings
          over {timeRange} days. Correlations indicate statistical relationships but do not imply causation.
          Use recommendations as guidance alongside your cultivation expertise.
        </small>
      </div>
    </div>
  );
};

export default EnvironmentalCorrelation;
