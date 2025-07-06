import {
    AlertCircle,
    Calendar,
    CheckCircle,
    Clock,
    Flower,
    Leaf,
    Target,
    TrendingUp
} from 'lucide-react';
import React, { useState } from 'react';
import { CANNABIS_TERMINOLOGY, formatAnalyticsValue } from '../../utils/analyticsApi';
import AnalyticsChart from '../AnalyticsChart';

/**
 * GrowthStageTimeline Component
 * Displays growth stage progression with milestone tracking and predictions
 */
const GrowthStageTimeline = ({ growthTimelineData, plantData, loading = false }) => {
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [timelineView, setTimelineView] = useState('milestones'); // 'milestones' or 'predictions'

  if (loading) {
    return (
      <div className="growth-stage-timeline">
        <div className="timeline-header">
          <div className="loading-placeholder loading-title"></div>
          <div className="loading-placeholder loading-button"></div>
        </div>
        <div className="timeline-content">
          <div className="loading-placeholder loading-chart"></div>
        </div>
      </div>
    );
  }

  if (!growthTimelineData) {
    return (
      <div className="growth-stage-timeline">
        <div className="timeline-header">
          <Clock className="timeline-icon" />
          <h3>Growth Stage Timeline</h3>
        </div>
        <div className="no-data">
          <AlertCircle className="no-data-icon" />
          <p>No growth timeline data available</p>
          <small>Timeline will appear once growth data is processed</small>
        </div>
      </div>
    );
  }

  const { milestones, predictions, progression, currentStage } = growthTimelineData;

  // Get stage icon
  const getStageIcon = (stage) => {
    switch (stage) {
      case 'germination':
        return '🌱';
      case 'seedling':
        return '🌿';
      case 'vegetative':
        return '🍃';
      case 'pre-flower':
        return '🌸';
      case 'flowering':
        return '🌺';
      case 'harvest':
        return '🌾';
      case 'cured':
        return '📦';
      default:
        return '🌱';
    }
  };

  // Get milestone status color
  const getMilestoneStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'var(--success-color, #22c55e)';
      case 'current':
        return 'var(--primary-color, #4ade80)';
      case 'pending':
        return 'var(--text-muted, #94a3b8)';
      case 'delayed':
        return 'var(--warning-color, #f59e0b)';
      case 'overdue':
        return 'var(--error-color, #ef4444)';
      default:
        return 'var(--text-muted, #94a3b8)';
    }
  };

  // Calculate milestone progress percentage
  const calculateMilestoneProgress = () => {
    if (!milestones || milestones.length === 0) return 0;

    const completedMilestones = milestones.filter(m => m.status === 'completed').length;
    return (completedMilestones / milestones.length) * 100;
  };

  // Prepare chart data for growth progression
  const prepareGrowthChartData = () => {
    if (!milestones) return null;

    const labels = milestones.map(milestone =>
      CANNABIS_TERMINOLOGY.growth_stages[milestone.stage] || milestone.stage
    );

    const expectedData = milestones.map(milestone => milestone.expectedDays);
    const actualData = milestones.map(milestone => milestone.actualDays || 0);

    return {
      labels,
      datasets: [
        {
          label: 'Expected Timeline',
          data: expectedData,
          borderColor: 'rgba(74, 222, 128, 0.8)',
          backgroundColor: 'rgba(74, 222, 128, 0.1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(74, 222, 128, 1)',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
        },
        {
          label: 'Actual Progress',
          data: actualData,
          borderColor: 'rgba(59, 130, 246, 0.8)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(59, 130, 246, 1)',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
        }
      ]
    };
  };

  // Prepare prediction chart data
  const preparePredictionChartData = () => {
    if (!predictions) return null;

    const labels = ['Current', 'Next Milestone', 'Flowering Start', 'Harvest Ready'];
    const data = [
      plantData?.total_days_growing || 0,
      predictions.nextMilestone?.expectedDays || 0,
      predictions.floweringStart?.expectedDays || 0,
      predictions.harvestReady?.expectedDays || 0
    ];

    return {
      labels,
      datasets: [
        {
          label: 'Days from Start',
          data,
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',   // Current - green
            'rgba(59, 130, 246, 0.8)',  // Next milestone - blue
            'rgba(245, 158, 11, 0.8)',  // Flowering - amber
            'rgba(239, 68, 68, 0.8)'    // Harvest - red
          ],
          borderColor: [
            'rgba(34, 197, 94, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(239, 68, 68, 1)'
          ],
          borderWidth: 2
        }
      ]
    };
  };

  const chartData = timelineView === 'milestones'
    ? prepareGrowthChartData()
    : preparePredictionChartData();

  return (
    <div className="growth-stage-timeline">
      <div className="timeline-header">
        <div className="header-content">
          <Clock className="timeline-icon" style={{ color: 'var(--primary-color)' }} />
          <div className="header-text">
            <h3>Growth Stage Timeline</h3>
            <span className="timeline-subtitle">
              {currentStage?.stage && (
                <>
                  {getStageIcon(currentStage.stage)} {CANNABIS_TERMINOLOGY.growth_stages[currentStage.stage]}
                  • Day {currentStage.daysInStage} of stage
                </>
              )}
            </span>
          </div>
        </div>

        <div className="timeline-controls">
          <div className="view-toggle">
            <button
              className={`toggle-btn ${timelineView === 'milestones' ? 'active' : ''}`}
              onClick={() => setTimelineView('milestones')}
            >
              <Target size={16} />
              Milestones
            </button>
            <button
              className={`toggle-btn ${timelineView === 'predictions' ? 'active' : ''}`}
              onClick={() => setTimelineView('predictions')}
            >
              <TrendingUp size={16} />
              Predictions
            </button>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="timeline-progress">
        <div className="progress-stats">
          <div className="progress-item">
            <span className="progress-label">Overall Progress</span>
            <span className="progress-value">
              {calculateMilestoneProgress().toFixed(1)}%
            </span>
          </div>
          <div className="progress-item">
            <span className="progress-label">Current Stage Health</span>
            <span
              className="progress-value"
              style={{ color: getMilestoneStatusColor(currentStage?.stageHealth) }}
            >
              {currentStage?.stageHealth || 'Unknown'}
            </span>
          </div>
          <div className="progress-item">
            <span className="progress-label">Days Growing</span>
            <span className="progress-value">
              {Math.round(plantData?.total_days_growing || 0)}
            </span>
          </div>
        </div>

        <div className="progress-bar-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${calculateMilestoneProgress()}%`,
                background: 'linear-gradient(90deg, var(--primary-color), var(--success-color))'
              }}
            />
          </div>
        </div>
      </div>

      {/* Chart Visualization */}
      <div className="timeline-chart">
        <AnalyticsChart
          type={timelineView === 'milestones' ? 'line' : 'bar'}
          data={chartData}
          title={timelineView === 'milestones' ? 'Milestone Progress' : 'Growth Predictions'}
          height={300}
          loading={!chartData}
        />
      </div>

      {/* Milestone Details */}
      <div className="milestone-details">
        <h4>Growth Milestones</h4>
        <div className="milestone-grid">
          {milestones && milestones.map((milestone, index) => (
            <div
              key={milestone.stage}
              className={`milestone-card ${milestone.status} ${selectedMilestone === index ? 'selected' : ''}`}
              onClick={() => setSelectedMilestone(selectedMilestone === index ? null : index)}
            >
              <div className="milestone-header">
                <div className="milestone-icon-status">
                  <span className="milestone-stage-icon">
                    {getStageIcon(milestone.stage)}
                  </span>
                  <div className="milestone-status-indicator">
                    {milestone.status === 'completed' && <CheckCircle size={16} />}
                    {milestone.status === 'current' && <Clock size={16} />}
                    {milestone.status === 'pending' && <Calendar size={16} />}
                    {milestone.status === 'delayed' && <AlertCircle size={16} />}
                  </div>
                </div>

                <div className="milestone-info">
                  <h5>{CANNABIS_TERMINOLOGY.growth_stages[milestone.stage] || milestone.stage}</h5>
                  <div className="milestone-timing">
                    <span className="expected">Expected: {milestone.expectedDays} days</span>
                    {milestone.actualDays && (
                      <span className="actual">Actual: {milestone.actualDays} days</span>
                    )}
                  </div>
                </div>
              </div>

              {selectedMilestone === index && (
                <div className="milestone-expanded">
                  <div className="milestone-description">
                    <p>{milestone.description}</p>
                  </div>

                  {milestone.status === 'current' && progression && (
                    <div className="current-stage-details">
                      <h6>Current Stage Details</h6>
                      <div className="stage-metrics">
                        <div className="metric-item">
                          <span className="metric-label">Days in Stage:</span>
                          <span className="metric-value">{currentStage?.daysInStage || 0}</span>
                        </div>
                        <div className="metric-item">
                          <span className="metric-label">Stage Health:</span>
                          <span
                            className="metric-value"
                            style={{ color: getMilestoneStatusColor(currentStage?.stageHealth) }}
                          >
                            {currentStage?.stageHealth || 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Predictions Panel */}
      {predictions && (
        <div className="predictions-panel">
          <h4>Growth Predictions</h4>
          <div className="predictions-grid">
            {predictions.nextMilestone && (
              <div className="prediction-card">
                <div className="prediction-header">
                  <Target className="prediction-icon" />
                  <h5>Next Milestone</h5>
                </div>
                <div className="prediction-content">
                  <div className="prediction-stage">
                    {getStageIcon(predictions.nextMilestone.stage)} {predictions.nextMilestone.stage}
                  </div>
                  <div className="prediction-timing">
                    Expected in {predictions.nextMilestone.daysUntil} days
                  </div>
                  <div className="prediction-date">
                    {new Date(predictions.nextMilestone.expectedDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}

            {predictions.expectedHarvest && (
              <div className="prediction-card">
                <div className="prediction-header">
                  <Flower className="prediction-icon" />
                  <h5>Expected Harvest</h5>
                </div>
                <div className="prediction-content">
                  <div className="prediction-stage">
                    🌾 Harvest Ready
                  </div>
                  <div className="prediction-timing">
                    {predictions.expectedHarvest.daysUntil} days remaining
                  </div>
                  <div className="prediction-date">
                    {new Date(predictions.expectedHarvest.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}

            {predictions.finalYield && (
              <div className="prediction-card">
                <div className="prediction-header">
                  <Leaf className="prediction-icon" />
                  <h5>Predicted Yield</h5>
                </div>
                <div className="prediction-content">
                  <div className="prediction-value">
                    {formatAnalyticsValue(predictions.finalYield.estimate, 'yield')}
                  </div>
                  <div className="prediction-confidence">
                    {formatAnalyticsValue(predictions.finalYield.confidence, 'confidence')} confidence
                  </div>
                  <div className="prediction-range">
                    Range: {predictions.finalYield.range?.min}g - {predictions.finalYield.range?.max}g
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="timeline-footer">
        <small>
          Growth timeline based on strain characteristics, environmental conditions,
          and historical cultivation data. Predictions may vary based on care and conditions.
        </small>
      </div>
    </div>
  );
};

export default GrowthStageTimeline;
