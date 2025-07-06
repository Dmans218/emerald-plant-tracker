import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Award,
  BarChart3,
  Calendar,
  Target,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import React, { useState } from 'react';
import { formatAnalyticsValue } from '../../utils/analyticsApi';
import AnalyticsChart from '../AnalyticsChart';

/**
 * HistoricalComparison Component
 * Displays comparison with previous grows and improvement trends
 */
const HistoricalComparison = ({ historicalData, plantData, loading = false }) => {
  const [comparisonView, setComparisonView] = useState('yield'); // 'yield', 'timeline', 'efficiency'
  const [selectedPlant, setSelectedPlant] = useState(null);

  if (loading) {
    return (
      <div className="historical-comparison">
        <div className="comparison-header">
          <div className="loading-placeholder loading-title"></div>
          <div className="loading-placeholder loading-controls"></div>
        </div>
        <div className="comparison-content">
          <div className="loading-placeholder loading-chart"></div>
        </div>
      </div>
    );
  }

  if (!historicalData) {
    return (
      <div className="historical-comparison">
        <div className="comparison-header">
          <BarChart3 className="comparison-icon" />
          <h3>Historical Comparison</h3>
        </div>
        <div className="no-data">
          <AlertTriangle className="no-data-icon" />
          <p>No historical comparison data available</p>
          <small>Comparison will appear once historical grows are available</small>
        </div>
      </div>
    );
  }

  const { currentPlant, historicalComparisons, trends, insights, comparisonCriteria } =
    historicalData;

  // Get improvement trend icon and color
  const getTrendIndicator = (current, previous) => {
    if (!current || !previous) return { icon: Activity, color: '#6b7280', direction: 'stable' };

    const change = ((current - previous) / previous) * 100;
    if (change > 5) return { icon: TrendingUp, color: '#22c55e', direction: 'improving', change };
    if (change < -5)
      return { icon: TrendingDown, color: '#ef4444', direction: 'declining', change };
    return { icon: Activity, color: '#f59e0b', direction: 'stable', change };
  };

  // Get performance rating
  const getPerformanceRating = (value, type) => {
    switch (type) {
      case 'yield':
        if (value >= 150) return { rating: 'Excellent', color: '#22c55e', icon: '🏆' };
        if (value >= 120) return { rating: 'Good', color: '#10b981', icon: '✅' };
        if (value >= 80) return { rating: 'Average', color: '#f59e0b', icon: '⚡' };
        return { rating: 'Below Average', color: '#ef4444', icon: '⚠️' };

      case 'efficiency':
        if (value >= 0.8) return { rating: 'Excellent', color: '#22c55e', icon: '🏆' };
        if (value >= 0.6) return { rating: 'Good', color: '#10b981', icon: '✅' };
        if (value >= 0.4) return { rating: 'Average', color: '#f59e0b', icon: '⚡' };
        return { rating: 'Below Average', color: '#ef4444', icon: '⚠️' };

      default:
        return { rating: 'Unknown', color: '#6b7280', icon: '❓' };
    }
  };

  // Prepare yield comparison chart
  const prepareYieldComparisonData = () => {
    if (!historicalComparisons || historicalComparisons.length === 0) return null;

    const allPlants = [currentPlant, ...historicalComparisons.map(comp => comp.plant)];
    const labels = allPlants.map(plant => plant.name || `Plant ${plant.id}`);
    const yieldData = allPlants.map(plant => plant.final_yield || 0);

    return {
      labels,
      datasets: [
        {
          label: 'Final Yield (grams)',
          data: yieldData,
          backgroundColor: yieldData.map((yieldValue, index) => {
            if (index === 0) return 'rgba(74, 222, 128, 0.8)'; // Current plant - green
            const rating = getPerformanceRating(yieldValue, 'yield');
            return `${rating.color}40`; // Add transparency
          }),
          borderColor: yieldData.map((yieldValue, index) => {
            if (index === 0) return 'rgba(74, 222, 128, 1)';
            const rating = getPerformanceRating(yieldValue, 'yield');
            return rating.color;
          }),
          borderWidth: 2,
        },
      ],
    };
  };

  // Prepare timeline comparison chart
  const prepareTimelineComparisonData = () => {
    if (!historicalComparisons || historicalComparisons.length === 0) return null;

    const allPlants = [currentPlant, ...historicalComparisons.map(comp => comp.plant)];
    const labels = allPlants.map(plant => plant.name || `Plant ${plant.id}`);
    const timelineData = allPlants.map(plant => plant.total_cycle_days || 0);

    return {
      labels,
      datasets: [
        {
          label: 'Total Cycle Days',
          data: timelineData,
          backgroundColor: timelineData.map((days, index) => {
            if (index === 0) return 'rgba(59, 130, 246, 0.8)'; // Current plant - blue
            if (days <= 90) return 'rgba(34, 197, 94, 0.6)'; // Fast - green
            if (days <= 120) return 'rgba(245, 158, 11, 0.6)'; // Average - amber
            return 'rgba(239, 68, 68, 0.6)'; // Slow - red
          }),
          borderColor: timelineData.map((days, index) => {
            if (index === 0) return 'rgba(59, 130, 246, 1)';
            if (days <= 90) return 'rgba(34, 197, 94, 1)';
            if (days <= 120) return 'rgba(245, 158, 11, 1)';
            return 'rgba(239, 68, 68, 1)';
          }),
          borderWidth: 2,
        },
      ],
    };
  };

  // Calculate average performance from historical data
  const calculateAveragePerformance = () => {
    if (!historicalComparisons || historicalComparisons.length === 0) return null;

    const yields = historicalComparisons
      .map(comp => comp.plant.final_yield || 0)
      .filter(y => y > 0);
    const cycles = historicalComparisons
      .map(comp => comp.plant.total_cycle_days || 0)
      .filter(c => c > 0);

    return {
      avgYield: yields.length > 0 ? yields.reduce((a, b) => a + b, 0) / yields.length : 0,
      avgCycleDays: cycles.length > 0 ? cycles.reduce((a, b) => a + b, 0) / cycles.length : 0,
      totalGrows: historicalComparisons.length,
    };
  };

  const avgPerformance = calculateAveragePerformance();

  return (
    <div className="historical-comparison">
      <div className="comparison-header">
        <div className="header-content">
          <BarChart3 className="comparison-icon" style={{ color: 'var(--primary-color)' }} />
          <div className="header-text">
            <h3>Historical Comparison</h3>
            <span className="comparison-subtitle">
              Performance comparison with {historicalComparisons?.length || 0} previous grows
            </span>
          </div>
        </div>

        <div className="comparison-controls">
          <div className="view-toggle">
            <button
              className={`toggle-btn ${comparisonView === 'yield' ? 'active' : ''}`}
              onClick={() => setComparisonView('yield')}
            >
              <Target size={16} />
              Yield
            </button>
            <button
              className={`toggle-btn ${comparisonView === 'timeline' ? 'active' : ''}`}
              onClick={() => setComparisonView('timeline')}
            >
              <Calendar size={16} />
              Timeline
            </button>
            <button
              className={`toggle-btn ${comparisonView === 'efficiency' ? 'active' : ''}`}
              onClick={() => setComparisonView('efficiency')}
            >
              <Activity size={16} />
              Efficiency
            </button>
          </div>
        </div>
      </div>

      {/* Comparison Criteria */}
      {comparisonCriteria && (
        <div className="comparison-criteria">
          <div className="criteria-info">
            <span className="criteria-label">Comparison Filters:</span>
            <div className="criteria-tags">
              {comparisonCriteria.compareStrain && (
                <span className="criteria-tag">Same Strain</span>
              )}
              {comparisonCriteria.compareMedium && (
                <span className="criteria-tag">Same Medium</span>
              )}
              <span className="criteria-tag">{comparisonCriteria.totalFound} Historical Grows</span>
            </div>
          </div>
        </div>
      )}

      {/* Performance Overview */}
      {avgPerformance && (
        <div className="performance-overview">
          <div className="performance-stats">
            <div className="performance-stat">
              <div className="stat-header">
                <Target className="stat-icon" />
                <span className="stat-label">Current vs Average Yield</span>
              </div>
              <div className="stat-content">
                <div className="stat-comparison">
                  <span className="current-value">
                    {formatAnalyticsValue(currentPlant.final_yield || 0, 'yield')}
                  </span>
                  <ArrowRight className="comparison-arrow" size={16} />
                  <span className="average-value">
                    {formatAnalyticsValue(avgPerformance.avgYield, 'yield')} avg
                  </span>
                </div>
                {avgPerformance.avgYield > 0 && (
                  <div className="improvement-indicator">
                    {(() => {
                      const trend = getTrendIndicator(
                        currentPlant.final_yield || 0,
                        avgPerformance.avgYield
                      );
                      const TrendIcon = trend.icon;
                      return (
                        <div className="trend-info" style={{ color: trend.color }}>
                          <TrendIcon size={14} />
                          <span>
                            {trend.direction === 'improving' &&
                              `+${trend.change?.toFixed(1)}% improvement`}
                            {trend.direction === 'declining' &&
                              `${trend.change?.toFixed(1)}% decline`}
                            {trend.direction === 'stable' && 'Similar performance'}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>

            <div className="performance-stat">
              <div className="stat-header">
                <Calendar className="stat-icon" />
                <span className="stat-label">Cycle Time Comparison</span>
              </div>
              <div className="stat-content">
                <div className="stat-comparison">
                  <span className="current-value">
                    {Math.round(currentPlant.total_cycle_days || 0)} days
                  </span>
                  <ArrowRight className="comparison-arrow" size={16} />
                  <span className="average-value">
                    {Math.round(avgPerformance.avgCycleDays)} days avg
                  </span>
                </div>
                {avgPerformance.avgCycleDays > 0 && (
                  <div className="improvement-indicator">
                    {(() => {
                      const currentDays = currentPlant.total_cycle_days || 0;
                      const change =
                        ((avgPerformance.avgCycleDays - currentDays) /
                          avgPerformance.avgCycleDays) *
                        100;
                      const isImprovement = change > 0; // Shorter cycle is better
                      return (
                        <div
                          className="trend-info"
                          style={{ color: isImprovement ? '#22c55e' : '#ef4444' }}
                        >
                          {isImprovement ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                          <span>
                            {Math.abs(change).toFixed(1)} days {isImprovement ? 'faster' : 'slower'}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>

            <div className="performance-stat">
              <div className="stat-header">
                <Award className="stat-icon" />
                <span className="stat-label">Historical Ranking</span>
              </div>
              <div className="stat-content">
                {(() => {
                  const allYields = [
                    currentPlant.final_yield || 0,
                    ...historicalComparisons.map(comp => comp.plant.final_yield || 0),
                  ];
                  const sortedYields = [...allYields].sort((a, b) => b - a);
                  const currentRank = sortedYields.indexOf(currentPlant.final_yield || 0) + 1;
                  const total = allYields.length;

                  return (
                    <div className="ranking-info">
                      <span className="rank-position">
                        #{currentRank} of {total}
                      </span>
                      <span className="rank-description">
                        {currentRank === 1 && '🏆 Best Performance'}
                        {currentRank <= total * 0.3 && currentRank > 1 && '🥇 Top Tier'}
                        {currentRank <= total * 0.6 &&
                          currentRank > total * 0.3 &&
                          '🥈 Above Average'}
                        {currentRank > total * 0.6 && '🥉 Room for Improvement'}
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Chart */}
      <div className="comparison-chart">
        {comparisonView === 'yield' && (
          <AnalyticsChart
            type="bar"
            data={prepareYieldComparisonData()}
            title="Yield Comparison with Historical Grows"
            height={300}
            loading={!historicalComparisons}
          />
        )}

        {comparisonView === 'timeline' && (
          <AnalyticsChart
            type="bar"
            data={prepareTimelineComparisonData()}
            title="Cycle Time Comparison"
            height={300}
            loading={!historicalComparisons}
          />
        )}

        {comparisonView === 'efficiency' && (
          <div className="efficiency-comparison">
            <h4>Efficiency Metrics Comparison</h4>
            <div className="efficiency-grid">
              {historicalComparisons &&
                historicalComparisons.map((comparison, index) => {
                  const plant = comparison.plant;
                  const analytics = comparison.analytics;

                  return (
                    <div
                      key={plant.id}
                      className={`efficiency-card ${selectedPlant === plant.id ? 'selected' : ''}`}
                      onClick={() => setSelectedPlant(selectedPlant === plant.id ? null : plant.id)}
                    >
                      <div className="card-header">
                        <span className="plant-name">{plant.name || `Plant ${plant.id}`}</span>
                        <span className="harvest-date">
                          {new Date(plant.harvest_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="card-metrics">
                        <div className="metric-item">
                          <span className="metric-label">Yield:</span>
                          <span className="metric-value">
                            {formatAnalyticsValue(plant.final_yield, 'yield')}
                          </span>
                        </div>
                        <div className="metric-item">
                          <span className="metric-label">Cycle:</span>
                          <span className="metric-value">
                            {Math.round(plant.total_cycle_days)} days
                          </span>
                        </div>
                        {analytics && (
                          <div className="metric-item">
                            <span className="metric-label">Efficiency:</span>
                            <span className="metric-value">
                              {formatAnalyticsValue(
                                analytics.environmental_efficiency?.overall_score,
                                'efficiency'
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* Trends Analysis */}
      {trends && (
        <div className="trends-analysis">
          <h4>Improvement Trends</h4>
          <div className="trends-grid">
            {trends.yieldTrend && (
              <div className="trend-card">
                <div className="trend-header">
                  <Target className="trend-icon" />
                  <h5>Yield Trend</h5>
                </div>
                <div className="trend-content">
                  <div className="trend-value">
                    {trends.yieldTrend.direction === 'improving' && (
                      <TrendingUp className="trend-direction" style={{ color: '#22c55e' }} />
                    )}
                    {trends.yieldTrend.direction === 'declining' && (
                      <TrendingDown className="trend-direction" style={{ color: '#ef4444' }} />
                    )}
                    {trends.yieldTrend.direction === 'stable' && (
                      <Activity className="trend-direction" style={{ color: '#f59e0b' }} />
                    )}
                    <span className="trend-percentage">
                      {trends.yieldTrend.changePercentage > 0 ? '+' : ''}
                      {trends.yieldTrend.changePercentage?.toFixed(1)}%
                    </span>
                  </div>
                  <div className="trend-description">{trends.yieldTrend.description}</div>
                </div>
              </div>
            )}

            {trends.efficiencyTrend && (
              <div className="trend-card">
                <div className="trend-header">
                  <Activity className="trend-icon" />
                  <h5>Efficiency Trend</h5>
                </div>
                <div className="trend-content">
                  <div className="trend-value">
                    {trends.efficiencyTrend.direction === 'improving' && (
                      <TrendingUp className="trend-direction" style={{ color: '#22c55e' }} />
                    )}
                    {trends.efficiencyTrend.direction === 'declining' && (
                      <TrendingDown className="trend-direction" style={{ color: '#ef4444' }} />
                    )}
                    {trends.efficiencyTrend.direction === 'stable' && (
                      <Activity className="trend-direction" style={{ color: '#f59e0b' }} />
                    )}
                    <span className="trend-percentage">
                      {trends.efficiencyTrend.changePercentage > 0 ? '+' : ''}
                      {trends.efficiencyTrend.changePercentage?.toFixed(1)}%
                    </span>
                  </div>
                  <div className="trend-description">{trends.efficiencyTrend.description}</div>
                </div>
              </div>
            )}

            {trends.timelineTrend && (
              <div className="trend-card">
                <div className="trend-header">
                  <Calendar className="trend-icon" />
                  <h5>Timeline Trend</h5>
                </div>
                <div className="trend-content">
                  <div className="trend-value">
                    {trends.timelineTrend.direction === 'improving' && (
                      <TrendingUp className="trend-direction" style={{ color: '#22c55e' }} />
                    )}
                    {trends.timelineTrend.direction === 'declining' && (
                      <TrendingDown className="trend-direction" style={{ color: '#ef4444' }} />
                    )}
                    {trends.timelineTrend.direction === 'stable' && (
                      <Activity className="trend-direction" style={{ color: '#f59e0b' }} />
                    )}
                    <span className="trend-percentage">
                      {trends.timelineTrend.changePercentage > 0 ? '+' : ''}
                      {trends.timelineTrend.changePercentage?.toFixed(1)}%
                    </span>
                  </div>
                  <div className="trend-description">{trends.timelineTrend.description}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Historical Insights */}
      {insights && insights.length > 0 && (
        <div className="historical-insights">
          <h4>Key Insights</h4>
          <div className="insights-grid">
            {insights.map((insight, index) => (
              <div key={index} className="insight-card">
                <div className="insight-header">
                  <div className="insight-icon">
                    {insight.type === 'improvement' && '📈'}
                    {insight.type === 'achievement' && '🏆'}
                    {insight.type === 'pattern' && '🔍'}
                    {insight.type === 'recommendation' && '💡'}
                  </div>
                  <h5>{insight.title}</h5>
                </div>
                <div className="insight-content">
                  <p>{insight.description}</p>
                  {insight.actionable && (
                    <div className="insight-action">
                      <strong>Action:</strong> {insight.actionable}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="comparison-footer">
        <small>
          Historical comparison based on {historicalComparisons?.length || 0} previous grows with
          similar characteristics. Trends and insights help identify patterns and opportunities for
          improvement in future cultivation cycles.
        </small>
      </div>
    </div>
  );
};

export default HistoricalComparison;
