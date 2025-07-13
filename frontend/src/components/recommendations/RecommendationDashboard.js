import React, { useState, useEffect, useCallback } from 'react';
import { 
  getRecommendations, 
  getRecommendationHistory, 
  submitRecommendationFeedback,
  processRecommendations,
  formatRecommendation,
  validateFeedback,
  getCannabisTerminology
} from '../../utils/recommendationApi';
import RecommendationCard from './RecommendationCard';
import ConfidenceIndicator from './ConfidenceIndicator';
import FeedbackInterface from './FeedbackInterface';
import RecommendationHistory from './RecommendationHistory';
import { RefreshCw, Brain, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import './RecommendationDashboard.css';

/**
 * AI Recommendations Dashboard
 * Main component for displaying and managing AI-powered cultivation recommendations
 */
const RecommendationDashboard = ({ plantId, onClose }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('current');
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [stats, setStats] = useState({
    totalRecommendations: 0,
    implementationRate: 0,
    positiveRate: 0
  });

  const cannabisTerminology = getCannabisTerminology();

  // Load recommendations on component mount
  useEffect(() => {
    if (plantId) {
      loadRecommendations();
      loadHistory();
    }
  }, [plantId]);

  // Auto-refresh recommendations every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === 'current') {
        loadRecommendations({ silent: true });
      }
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [activeTab]);

  /**
   * Load current recommendations for the plant
   */
  const loadRecommendations = useCallback(async (options = {}) => {
    try {
      if (!options.silent) {
        setLoading(true);
        setError(null);
      }

      const data = await getRecommendations(plantId, {
        forceRefresh: options.forceRefresh,
        confidenceThreshold: 0.7
      });

      const formattedRecommendations = data.recommendations.map(formatRecommendation);
      setRecommendations(formattedRecommendations);

      if (!options.silent) {
        toast.success(`Loaded ${formattedRecommendations.length} recommendations`);
      }

    } catch (error) {
      console.error('Error loading recommendations:', error);
      setError(error.message);
      
      if (!options.silent) {
        toast.error('Failed to load recommendations');
      }
    } finally {
      if (!options.silent) {
        setLoading(false);
      }
    }
  }, [plantId]);

  /**
   * Load recommendation history
   */
  const loadHistory = useCallback(async () => {
    try {
      const data = await getRecommendationHistory(plantId, { limit: 50 });
      setHistory(data.history);
      setStats({
        totalRecommendations: data.totalRecommendations,
        implementationRate: data.implementationRate,
        positiveRate: data.averageEffectiveness
      });
    } catch (error) {
      console.error('Error loading history:', error);
      // Don't show toast for history loading errors
    }
  }, [plantId]);

  /**
   * Manually process recommendations
   */
  const handleProcessRecommendations = async () => {
    try {
      setProcessing(true);
      toast.loading('Processing recommendations...');

      await processRecommendations(plantId, { forceRefresh: true });
      await loadRecommendations({ forceRefresh: true });

      toast.success('Recommendations processed successfully');
    } catch (error) {
      console.error('Error processing recommendations:', error);
      toast.error('Failed to process recommendations');
    } finally {
      setProcessing(false);
    }
  };

  /**
   * Handle recommendation selection for detailed view
   */
  const handleRecommendationSelect = (recommendation) => {
    setSelectedRecommendation(recommendation);
    setShowFeedback(false);
  };

  /**
   * Handle feedback submission
   */
  const handleFeedbackSubmit = async (feedback) => {
    try {
      const validation = validateFeedback(feedback);
      if (!validation.isValid) {
        toast.error(validation.errors[0]);
        return;
      }

      await submitRecommendationFeedback(selectedRecommendation.id, feedback);
      
      // Refresh data
      await loadRecommendations({ forceRefresh: true });
      await loadHistory();
      
      setShowFeedback(false);
      setSelectedRecommendation(null);
      
      toast.success('Feedback submitted successfully');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    }
  };

  /**
   * Get priority-based recommendations
   */
  const getPriorityRecommendations = () => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return recommendations.sort((a, b) => 
      priorityOrder[b.priority] - priorityOrder[a.priority]
    );
  };

  /**
   * Get recommendations by category
   */
  const getRecommendationsByCategory = () => {
    const categories = {};
    recommendations.forEach(rec => {
      if (!categories[rec.category]) {
        categories[rec.category] = [];
      }
      categories[rec.category].push(rec);
    });
    return categories;
  };

  /**
   * Render loading state
   */
  const renderLoading = () => (
    <div className="recommendation-loading">
      <div className="loading-spinner">
        <RefreshCw className="animate-spin" size={24} />
      </div>
      <p>Analyzing your cultivation data...</p>
      <p className="loading-subtitle">AI is processing environmental patterns and growth trends</p>
    </div>
  );

  /**
   * Render error state
   */
  const renderError = () => (
    <div className="recommendation-error">
      <AlertTriangle size={48} color="#ef4444" />
      <h3>Unable to Load Recommendations</h3>
      <p>{error}</p>
      <button 
        onClick={() => loadRecommendations()}
        className="retry-button"
      >
        <RefreshCw size={16} />
        Try Again
      </button>
    </div>
  );

  /**
   * Render empty state
   */
  const renderEmpty = () => (
    <div className="recommendation-empty">
      <Brain size={48} color="#6b7280" />
      <h3>No Recommendations Available</h3>
      <p>Your plants are performing optimally! The AI will generate recommendations when optimization opportunities are detected.</p>
      <button 
        onClick={handleProcessRecommendations}
        className="process-button"
        disabled={processing}
      >
        {processing ? (
          <RefreshCw className="animate-spin" size={16} />
        ) : (
          <Brain size={16} />
        )}
        {processing ? 'Processing...' : 'Generate Recommendations'}
      </button>
    </div>
  );

  /**
   * Render current recommendations
   */
  const renderCurrentRecommendations = () => {
    const priorityRecommendations = getPriorityRecommendations();
    const categorizedRecommendations = getRecommendationsByCategory();

    return (
      <div className="recommendations-content">
        {/* Summary Stats */}
        <div className="recommendations-summary">
          <div className="summary-card">
            <div className="summary-icon">
              <Brain size={20} />
            </div>
            <div className="summary-content">
              <h4>Total Recommendations</h4>
              <p>{recommendations.length}</p>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon">
              <TrendingUp size={20} />
            </div>
            <div className="summary-content">
              <h4>Implementation Rate</h4>
              <p>{(stats.implementationRate * 100).toFixed(1)}%</p>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon">
              <CheckCircle size={20} />
            </div>
            <div className="summary-content">
              <h4>Success Rate</h4>
              <p>{(stats.positiveRate * 100).toFixed(1)}%</p>
            </div>
          </div>
        </div>

        {/* Priority Recommendations */}
        {priorityRecommendations.length > 0 && (
          <div className="recommendations-section">
            <h3>Priority Recommendations</h3>
            <div className="recommendations-grid">
              {priorityRecommendations.slice(0, 3).map((recommendation) => (
                <RecommendationCard
                  key={recommendation.id}
                  recommendation={recommendation}
                  onSelect={handleRecommendationSelect}
                  onFeedback={() => setShowFeedback(true)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Categorized Recommendations */}
        {Object.keys(categorizedRecommendations).length > 0 && (
          <div className="recommendations-section">
            <h3>All Recommendations</h3>
            {Object.entries(categorizedRecommendations).map(([category, recs]) => (
              <div key={category} className="category-section">
                <h4 className="category-title">
                  {cannabisTerminology.environmentalParams[category] || 
                   cannabisTerminology.nutrientTypes[category] || 
                   category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </h4>
                <div className="recommendations-grid">
                  {recs.map((recommendation) => (
                    <RecommendationCard
                      key={recommendation.id}
                      recommendation={recommendation}
                      onSelect={handleRecommendationSelect}
                      onFeedback={() => setShowFeedback(true)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="recommendation-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-title">
            <Brain size={24} />
            <h2>AI Cultivation Recommendations</h2>
          </div>
          
          <div className="header-actions">
            <button
              onClick={handleProcessRecommendations}
              className="process-button"
              disabled={processing}
              title="Generate fresh recommendations"
            >
              {processing ? (
                <RefreshCw className="animate-spin" size={16} />
              ) : (
                <RefreshCw size={16} />
              )}
              {processing ? 'Processing...' : 'Refresh'}
            </button>
            
            {onClose && (
              <button
                onClick={onClose}
                className="close-button"
                title="Close recommendations"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'current' ? 'active' : ''}`}
          onClick={() => setActiveTab('current')}
        >
          <Brain size={16} />
          Current ({recommendations.length})
        </button>
        
        <button
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <Clock size={16} />
          History ({history.length})
        </button>
      </div>

      {/* Content */}
      <div className="dashboard-content">
        {loading ? (
          renderLoading()
        ) : error ? (
          renderError()
        ) : activeTab === 'current' ? (
          recommendations.length === 0 ? (
            renderEmpty()
          ) : (
            renderCurrentRecommendations()
          )
        ) : (
          <RecommendationHistory
            history={history}
            stats={stats}
            onRefresh={loadHistory}
          />
        )}
      </div>

      {/* Feedback Modal */}
      {showFeedback && selectedRecommendation && (
        <div className="feedback-overlay">
          <div className="feedback-modal">
            <FeedbackInterface
              recommendation={selectedRecommendation}
              onSubmit={handleFeedbackSubmit}
              onCancel={() => setShowFeedback(false)}
            />
          </div>
        </div>
      )}

      {/* Recommendation Details Modal */}
      {selectedRecommendation && !showFeedback && (
        <div className="recommendation-overlay">
          <div className="recommendation-modal">
            <div className="modal-header">
              <h3>{selectedRecommendation.formattedTitle}</h3>
              <button
                onClick={() => setSelectedRecommendation(null)}
                className="close-button"
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <div className="recommendation-details">
                <p className="description">{selectedRecommendation.formattedDescription}</p>
                
                <div className="confidence-section">
                  <h4>AI Confidence</h4>
                  <ConfidenceIndicator confidence={selectedRecommendation.confidence} />
                </div>
                
                <div className="actions-section">
                  <h4>Recommended Actions</h4>
                  {selectedRecommendation.formattedActions.map((action, index) => (
                    <div key={index} className="action-item">
                      <div className="action-icon" style={{ color: action.actionColor }}>
                        {action.actionIcon}
                      </div>
                      <div className="action-content">
                        <p className="action-text">{action.formattedAction}</p>
                        <p className="action-benefit">{action.expectedBenefit}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="reasoning-section">
                  <h4>AI Reasoning</h4>
                  <p>{selectedRecommendation.reasoning}</p>
                </div>
              </div>
              
              <div className="modal-actions">
                <button
                  onClick={() => setShowFeedback(true)}
                  className="feedback-button"
                >
                  Provide Feedback
                </button>
                
                <button
                  onClick={() => setSelectedRecommendation(null)}
                  className="close-button"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationDashboard; 