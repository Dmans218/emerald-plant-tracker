import {
    AlertTriangle,
    Award,
    BarChart3,
    Dna,
    Info,
    Target,
    TrendingUp,
    Zap
} from 'lucide-react';
import React, { useState } from 'react';
import { CANNABIS_TERMINOLOGY, formatAnalyticsValue, getAnalyticsColor } from '../../utils/analyticsApi';
import AnalyticsChart from '../AnalyticsChart';

/**
 * StrainPerformanceAnalysis Component
 * Displays strain-specific analytics with genetic potential vs actual performance
 */
const StrainPerformanceAnalysis = ({ strainAnalysisData, loading = false }) => {
  const [activeView, setActiveView] = useState('overview'); // 'overview', 'genetics', 'optimization'

  if (loading) {
    return (
      <div className="strain-performance-analysis">
        <div className="strain-header">
          <div className="loading-placeholder loading-title"></div>
          <div className="loading-placeholder loading-subtitle"></div>
        </div>
        <div className="strain-content">
          <div className="loading-placeholder loading-chart"></div>
        </div>
      </div>
    );
  }

  if (!strainAnalysisData) {
    return (
      <div className="strain-performance-analysis">
        <div className="strain-header">
          <Dna className="strain-icon" />
          <h3>Strain Performance Analysis</h3>
        </div>
        <div className="no-data">
          <AlertTriangle className="no-data-icon" />
          <p>No strain analysis data available</p>
          <small>Analysis will appear once strain data is processed</small>
        </div>
      </div>
    );
  }

  const { strainInfo, geneticPotential, actualPerformance, comparison, optimization } = strainAnalysisData;

  // Get strain type color
  const getStrainTypeColor = (type) => {
    switch (type) {
      case 'indica':
        return '#6366f1'; // Indigo
      case 'sativa':
        return '#10b981'; // Emerald
      case 'hybrid':
        return '#f59e0b'; // Amber
      case 'auto':
        return '#8b5cf6'; // Purple
      default:
        return '#6b7280'; // Gray
    }
  };

  // Get performance rating
  const getPerformanceRating = (percentage) => {
    if (percentage >= 90) return { rating: 'Excellent', color: '#22c55e', icon: '🏆' };
    if (percentage >= 75) return { rating: 'Good', color: '#10b981', icon: '✅' };
    if (percentage >= 60) return { rating: 'Average', color: '#f59e0b', icon: '⚡' };
    if (percentage >= 40) return { rating: 'Below Average', color: '#f97316', icon: '⚠️' };
    return { rating: 'Poor', color: '#ef4444', icon: '❌' };
  };

  // Prepare genetic potential vs actual performance chart
  const prepareComparisonChartData = () => {
    if (!geneticPotential || !actualPerformance) return null;

    const metrics = ['Yield', 'Growth Rate', 'Timeline Efficiency'];
    const geneticData = [
      geneticPotential.expectedYield.average,
      geneticPotential.growthPattern.averageRate,
      100 // Baseline for timeline efficiency
    ];
    const actualData = [
      actualPerformance.currentYield,
      actualPerformance.growthRate,
      comparison.timelineComparison * 100
    ];

    return {
      labels: metrics,
      datasets: [
        {
          label: 'Genetic Potential',
          data: geneticData,
          backgroundColor: 'rgba(99, 102, 241, 0.7)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 2
        },
        {
          label: 'Actual Performance',
          data: actualData,
          backgroundColor: 'rgba(16, 185, 129, 0.7)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 2
        }
      ]
    };
  };

  // Prepare performance breakdown chart
  const preparePerformanceBreakdownData = () => {
    if (!comparison) return null;

    const labels = ['Yield Performance', 'Growth Rate', 'Timeline Efficiency'];
    const data = [
      comparison.yieldPercentage || 0,
      (comparison.growthRateComparison || 0) * 100,
      (comparison.timelineComparison || 0) * 100
    ];

    return {
      labels,
      datasets: [
        {
          label: 'Performance vs Genetic Potential (%)',
          data,
          backgroundColor: data.map(value => {
            if (value >= 90) return 'rgba(34, 197, 94, 0.8)';
            if (value >= 75) return 'rgba(16, 185, 129, 0.8)';
            if (value >= 60) return 'rgba(245, 158, 11, 0.8)';
            if (value >= 40) return 'rgba(249, 115, 22, 0.8)';
            return 'rgba(239, 68, 68, 0.8)';
          }),
          borderColor: data.map(value => {
            if (value >= 90) return 'rgba(34, 197, 94, 1)';
            if (value >= 75) return 'rgba(16, 185, 129, 1)';
            if (value >= 60) return 'rgba(245, 158, 11, 1)';
            if (value >= 40) return 'rgba(249, 115, 22, 1)';
            return 'rgba(239, 68, 68, 1)';
          }),
          borderWidth: 2
        }
      ]
    };
  };

  const yieldRating = getPerformanceRating(comparison.yieldPercentage || 0);
  const overallPerformance = ((comparison.yieldPercentage || 0) +
                              (comparison.growthRateComparison || 0) * 100 +
                              (comparison.timelineComparison || 0) * 100) / 3;
  const overallRating = getPerformanceRating(overallPerformance);

  return (
    <div className="strain-performance-analysis">
      <div className="strain-header">
        <div className="header-content">
          <div className="strain-icon-container">
            <Dna
              className="strain-icon"
              style={{ color: getStrainTypeColor(strainInfo.type) }}
            />
          </div>
          <div className="header-text">
            <h3>Strain Performance Analysis</h3>
            <div className="strain-info">
              <span className="strain-name">{strainInfo.name}</span>
              <span
                className="strain-type"
                style={{
                  color: getStrainTypeColor(strainInfo.type),
                  backgroundColor: `${getStrainTypeColor(strainInfo.type)}20`
                }}
              >
                {CANNABIS_TERMINOLOGY.strain_types[strainInfo.type] || strainInfo.type}
              </span>
              <span className="strain-classification">{strainInfo.classification}</span>
            </div>
          </div>
        </div>

        <div className="view-controls">
          <div className="view-toggle">
            <button
              className={`toggle-btn ${activeView === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveView('overview')}
            >
              <BarChart3 size={16} />
              Overview
            </button>
            <button
              className={`toggle-btn ${activeView === 'genetics' ? 'active' : ''}`}
              onClick={() => setActiveView('genetics')}
            >
              <Dna size={16} />
              Genetics
            </button>
            <button
              className={`toggle-btn ${activeView === 'optimization' ? 'active' : ''}`}
              onClick={() => setActiveView('optimization')}
            >
              <Zap size={16} />
              Optimization
            </button>
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="performance-overview">
        <div className="performance-stats">
          <div className="performance-stat">
            <div className="stat-header">
              <Target className="stat-icon" />
              <span className="stat-label">Overall Performance</span>
            </div>
            <div className="stat-content">
              <span
                className="stat-value"
                style={{ color: overallRating.color }}
              >
                {overallRating.icon} {overallRating.rating}
              </span>
              <span className="stat-percentage">
                {overallPerformance.toFixed(1)}% of genetic potential
              </span>
            </div>
          </div>

          <div className="performance-stat">
            <div className="stat-header">
              <Award className="stat-icon" />
              <span className="stat-label">Yield Performance</span>
            </div>
            <div className="stat-content">
              <span
                className="stat-value"
                style={{ color: yieldRating.color }}
              >
                {yieldRating.icon} {yieldRating.rating}
              </span>
              <span className="stat-percentage">
                {(comparison.yieldPercentage || 0).toFixed(1)}% of expected
              </span>
            </div>
          </div>

          <div className="performance-stat">
            <div className="stat-header">
              <TrendingUp className="stat-icon" />
              <span className="stat-label">Growth Efficiency</span>
            </div>
            <div className="stat-content">
              <span className="stat-value">
                {formatAnalyticsValue(actualPerformance.environmentalEfficiency, 'efficiency')}
              </span>
              <span className="stat-percentage">
                Environmental optimization
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Visualization */}
      <div className="strain-chart">
        {activeView === 'overview' && (
          <AnalyticsChart
            type="bar"
            data={preparePerformanceBreakdownData()}
            title="Performance vs Genetic Potential"
            height={300}
            loading={!comparison}
          />
        )}

        {activeView === 'genetics' && (
          <AnalyticsChart
            type="bar"
            data={prepareComparisonChartData()}
            title="Genetic Potential vs Actual Performance"
            height={300}
            loading={!geneticPotential}
          />
        )}

        {activeView === 'optimization' && optimization && (
          <div className="optimization-content">
            <h4>Optimization Recommendations</h4>
            <div className="optimization-grid">
              {optimization.recommendations && optimization.recommendations.map((rec, index) => (
                <div key={index} className="optimization-card">
                  <div className="optimization-header">
                    <div className="optimization-icon">
                      {rec.type === 'environmental' && '🌡️'}
                      {rec.type === 'nutrient' && '💧'}
                      {rec.type === 'training' && '✂️'}
                      {rec.type === 'lighting' && '💡'}
                      {rec.type === 'general' && '📋'}
                    </div>
                    <h5>{rec.title}</h5>
                  </div>
                  <div className="optimization-content">
                    <p>{rec.description}</p>
                    <div className="optimization-impact">
                      <span className="impact-label">Expected Impact:</span>
                      <span
                        className="impact-value"
                        style={{ color: getAnalyticsColor(rec.impact, 'efficiency') }}
                      >
                        +{rec.impact}% improvement
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detailed Metrics */}
      <div className="detailed-metrics">
        <div className="metrics-section">
          <h4>Genetic Characteristics</h4>
          <div className="characteristics-grid">
            {geneticPotential && (
              <>
                <div className="characteristic-item">
                  <span className="characteristic-label">Expected Yield Range:</span>
                  <span className="characteristic-value">
                    {geneticPotential.expectedYield.min}g - {geneticPotential.expectedYield.max}g
                  </span>
                </div>
                <div className="characteristic-item">
                  <span className="characteristic-label">Growth Pattern:</span>
                  <span className="characteristic-value">
                    {geneticPotential.growthPattern.height} height, {geneticPotential.growthPattern.stretchFactor}x stretch
                  </span>
                </div>
                <div className="characteristic-item">
                  <span className="characteristic-label">Lifecycle:</span>
                  <span className="characteristic-value">
                    {geneticPotential.lifecycle.totalDays} days total
                    ({geneticPotential.lifecycle.vegetative}v + {geneticPotential.lifecycle.flowering}f)
                  </span>
                </div>
                <div className="characteristic-item">
                  <span className="characteristic-label">Key Traits:</span>
                  <span className="characteristic-value">
                    {geneticPotential.characteristics && geneticPotential.characteristics.join(', ')}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="metrics-section">
          <h4>Current Performance</h4>
          <div className="performance-grid">
            <div className="performance-metric">
              <span className="metric-label">Current Yield Prediction:</span>
              <span className="metric-value">
                {formatAnalyticsValue(actualPerformance.currentYield, 'yield')}
              </span>
            </div>
            <div className="performance-metric">
              <span className="metric-label">Growth Rate:</span>
              <span className="metric-value">
                {formatAnalyticsValue(actualPerformance.growthRate, 'growth_rate')}
              </span>
            </div>
            <div className="performance-metric">
              <span className="metric-label">Days in Cycle:</span>
              <span className="metric-value">
                {actualPerformance.daysInCycle} days
              </span>
            </div>
            <div className="performance-metric">
              <span className="metric-label">Environmental Efficiency:</span>
              <span className="metric-value">
                {formatAnalyticsValue(actualPerformance.environmentalEfficiency, 'efficiency')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Strain-Specific Insights */}
      {optimization && optimization.insights && (
        <div className="strain-insights">
          <h4>Strain-Specific Insights</h4>
          <div className="insights-grid">
            {optimization.insights.map((insight, index) => (
              <div key={index} className="insight-card">
                <div className="insight-header">
                  <Info className="insight-icon" />
                  <h5>{insight.title}</h5>
                </div>
                <div className="insight-content">
                  <p>{insight.description}</p>
                  {insight.recommendation && (
                    <div className="insight-recommendation">
                      <strong>Recommendation:</strong> {insight.recommendation}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="strain-footer">
        <small>
          Strain analysis based on genetic characteristics, breeder specifications,
          and historical performance data. Individual results may vary based on growing conditions.
        </small>
      </div>
    </div>
  );
};

export default StrainPerformanceAnalysis;
