import {
    AlertTriangle,
    Calendar,
    CheckCircle,
    ChevronDown,
    ChevronRight,
    Droplets,
    Info,
    Lightbulb,
    Scissors,
    Thermometer
} from 'lucide-react';
import React, { useState } from 'react';
import { CANNABIS_TERMINOLOGY } from '../../utils/analyticsApi';

/**
 * RecommendationsPanel Component
 * Displays AI-generated cultivation recommendations with priority-based display
 */
const RecommendationsPanel = ({ analytics, loading = false }) => {
  const [expandedRecommendations, setExpandedRecommendations] = useState(new Set());

  if (loading) {
    return (
      <div className="recommendations-panel">
        <div className="panel-header">
          <div className="loading-placeholder loading-title"></div>
        </div>
        <div className="recommendations-list">
          {[1, 2, 3].map(i => (
            <div key={i} className="recommendation-item loading">
              <div className="loading-placeholder loading-text"></div>
              <div className="loading-placeholder loading-text-small"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const recommendations = analytics?.recommendations || [];

  if (recommendations.length === 0) {
    return (
      <div className="recommendations-panel">
        <div className="panel-header">
          <Lightbulb className="panel-icon" />
          <h3>Cultivation Recommendations</h3>
        </div>
        <div className="no-recommendations">
          <CheckCircle className="no-data-icon" style={{ color: 'var(--success-color)' }} />
          <p>All systems optimal</p>
          <small>No immediate recommendations - your cultivation is on track!</small>
        </div>
      </div>
    );
  }

  // Sort recommendations by priority
  const sortedRecommendations = [...recommendations].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return (priorityOrder[b.priority] || 2) - (priorityOrder[a.priority] || 2);
  });

  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'environmental':
        return Thermometer;
      case 'nutrient':
        return Droplets;
      case 'training':
        return Scissors;
      case 'harvest':
        return Calendar;
      default:
        return Info;
    }
  };

  const getPriorityConfig = (priority) => {
    switch (priority) {
      case 'high':
        return {
          color: 'var(--error-color, #ef4444)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderColor: 'rgba(239, 68, 68, 0.3)',
          icon: AlertTriangle,
          label: 'High Priority'
        };
      case 'medium':
        return {
          color: 'var(--warning-color, #f59e0b)',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          borderColor: 'rgba(245, 158, 11, 0.3)',
          icon: Info,
          label: 'Medium Priority'
        };
      case 'low':
        return {
          color: 'var(--success-color, #22c55e)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderColor: 'rgba(34, 197, 94, 0.3)',
          icon: CheckCircle,
          label: 'Low Priority'
        };
      default:
        return {
          color: 'var(--primary-color, #4ade80)',
          backgroundColor: 'rgba(74, 222, 128, 0.1)',
          borderColor: 'rgba(74, 222, 128, 0.3)',
          icon: Info,
          label: 'Standard'
        };
    }
  };

  const toggleRecommendation = (recommendationId) => {
    const newExpanded = new Set(expandedRecommendations);
    if (newExpanded.has(recommendationId)) {
      newExpanded.delete(recommendationId);
    } else {
      newExpanded.add(recommendationId);
    }
    setExpandedRecommendations(newExpanded);
  };

  // Group recommendations by priority for better organization
  const groupedRecommendations = sortedRecommendations.reduce((groups, rec) => {
    const priority = rec.priority || 'medium';
    if (!groups[priority]) groups[priority] = [];
    groups[priority].push(rec);
    return groups;
  }, {});

  return (
    <div className="recommendations-panel">
      <div className="panel-header">
        <Lightbulb className="panel-icon" style={{ color: 'var(--primary-color)' }} />
        <div className="header-content">
          <h3>AI Cultivation Recommendations</h3>
          <span className="recommendation-count">
            {recommendations.length} recommendation{recommendations.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="recommendations-content">
        {Object.entries(groupedRecommendations).map(([priority, recs]) => {
          const priorityConfig = getPriorityConfig(priority);

          return (
            <div key={priority} className="priority-group">
              <div className="priority-header">
                <priorityConfig.icon size={16} style={{ color: priorityConfig.color }} />
                <span style={{ color: priorityConfig.color }}>
                  {priorityConfig.label} ({recs.length})
                </span>
              </div>

              <div className="recommendations-list">
                {recs.map((recommendation) => {
                  const IconComponent = getRecommendationIcon(recommendation.type);
                  const isExpanded = expandedRecommendations.has(recommendation.id);
                  const typeLabel = CANNABIS_TERMINOLOGY.recommendation_types[recommendation.type] ||
                                   recommendation.type.charAt(0).toUpperCase() + recommendation.type.slice(1);

                  return (
                    <div
                      key={recommendation.id}
                      className="recommendation-item"
                      style={{
                        backgroundColor: priorityConfig.backgroundColor,
                        borderColor: priorityConfig.borderColor
                      }}
                    >
                      <div
                        className="recommendation-header"
                        onClick={() => toggleRecommendation(recommendation.id)}
                      >
                        <div className="recommendation-info">
                          <div className="recommendation-icon-type">
                            <IconComponent
                              size={18}
                              style={{ color: priorityConfig.color }}
                            />
                            <span className="recommendation-type">{typeLabel}</span>
                          </div>

                          <div className="recommendation-message">
                            {recommendation.message}
                          </div>
                        </div>

                        <div className="recommendation-meta">
                          {recommendation.confidence && (
                            <span className="confidence-indicator">
                              {Math.round(recommendation.confidence * 100)}% confidence
                            </span>
                          )}
                          <button
                            className="expand-button"
                            aria-label={isExpanded ? 'Collapse' : 'Expand'}
                          >
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="recommendation-details">
                          <div className="detail-grid">
                            <div className="detail-item">
                              <span className="detail-label">Category:</span>
                              <span className="detail-value">{typeLabel}</span>
                            </div>

                            <div className="detail-item">
                              <span className="detail-label">Priority:</span>
                              <span
                                className="detail-value"
                                style={{ color: priorityConfig.color }}
                              >
                                {priorityConfig.label}
                              </span>
                            </div>

                            {recommendation.confidence && (
                              <div className="detail-item">
                                <span className="detail-label">AI Confidence:</span>
                                <span className="detail-value">
                                  {Math.round(recommendation.confidence * 100)}%
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="recommendation-context">
                            <h5>Implementation Context:</h5>
                            <p>
                              This recommendation is based on current cultivation data,
                              environmental conditions, and cannabis-specific growth patterns.
                              Consider your specific growing setup and experience level when implementing.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="panel-footer">
        <small>
          Recommendations are generated using AI analysis of your cultivation data.
          Always use your best judgment and consider your specific growing conditions.
        </small>
      </div>
    </div>
  );
};

export default RecommendationsPanel;
