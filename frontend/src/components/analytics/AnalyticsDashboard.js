import { Activity, AlertCircle, RefreshCw, TrendingUp } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import {
    getAnalyticsHealth,
    getLatestAnalytics,
    processAnalytics,
    transformAnalyticsForCharts
} from '../../utils/analyticsApi';
import AnalyticsMetrics from './AnalyticsMetrics';
import RecommendationsPanel from './RecommendationsPanel';
import YieldPredictionCard from './YieldPredictionCard';

/**
 * AnalyticsDashboard Component
 * Main container for plant analytics dashboard
 */
const AnalyticsDashboard = ({ plantId, plantData }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async (showToast = false) => {
    try {
      setError(null);

      if (showToast) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Check service health first
      const health = await getAnalyticsHealth();
      setHealthStatus(health);

      if (!health.success) {
        throw new Error('Analytics service is not available');
      }

      // Fetch latest analytics
      const rawAnalytics = await getLatestAnalytics(plantId);

      if (rawAnalytics) {
        const transformedAnalytics = transformAnalyticsForCharts(rawAnalytics);
        setAnalytics(transformedAnalytics);
        setLastUpdated(new Date());

        if (showToast) {
          toast.success('Analytics data refreshed successfully');
        }
      } else {
        setAnalytics(null);
        if (showToast) {
          toast('No analytics data available yet', { icon: 'ℹ️' });
        }
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message);

      if (showToast) {
        toast.error(`Failed to refresh analytics: ${err.message}`);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [plantId]);

  // Process analytics manually
  const handleProcessAnalytics = async () => {
    try {
      setRefreshing(true);
      toast.loading('Processing analytics...', { id: 'processing' });

      await processAnalytics(plantId, { forceRecalculation: true });

      // Wait a moment for processing to complete, then fetch updated data
      setTimeout(() => {
        fetchAnalytics(false);
        toast.success('Analytics processed successfully', { id: 'processing' });
      }, 2000);

    } catch (err) {
      console.error('Error processing analytics:', err);
      toast.error(`Failed to process analytics: ${err.message}`, { id: 'processing' });
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (plantId) {
      fetchAnalytics(false);
    }
  }, [plantId, fetchAnalytics]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (!plantId) return;

    const interval = setInterval(() => {
      fetchAnalytics(false);
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [plantId, fetchAnalytics]);

  if (loading && !analytics) {
    return (
      <div className="analytics-dashboard">
        <div className="dashboard-header">
          <div className="loading-placeholder loading-title"></div>
          <div className="loading-placeholder loading-button"></div>
        </div>
        <div className="dashboard-content">
          <div className="dashboard-grid">
            <div className="dashboard-section">
              <AnalyticsMetrics loading={true} />
            </div>
            <div className="dashboard-section">
              <YieldPredictionCard loading={true} />
            </div>
            <div className="dashboard-section span-full">
              <RecommendationsPanel loading={true} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !analytics) {
    return (
      <div className="analytics-dashboard">
        <div className="dashboard-error">
          <AlertCircle className="error-icon" />
          <h3>Analytics Unavailable</h3>
          <p>{error}</p>
          <button
            onClick={() => fetchAnalytics(true)}
            className="btn btn-primary"
            disabled={refreshing}
          >
            {refreshing ? 'Retrying...' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-text">
            <h2>
              <TrendingUp className="header-icon" />
              Analytics Dashboard
            </h2>
            {plantData?.strain && (
              <p className="plant-info">
                {plantData.strain} • {plantData.growth_stage || 'Unknown Stage'}
                {plantData.days_in_current_stage && (
                  ` • Day ${Math.round(plantData.days_in_current_stage)}`
                )}
              </p>
            )}
          </div>

          {lastUpdated && (
            <div className="last-updated">
              <small>
                Last updated: {lastUpdated.toLocaleString()}
              </small>
            </div>
          )}
        </div>

        <div className="dashboard-actions">
          <button
            onClick={() => fetchAnalytics(true)}
            className="btn btn-secondary"
            disabled={refreshing}
            title="Refresh analytics data"
          >
            <RefreshCw
              className={`btn-icon ${refreshing ? 'spinning' : ''}`}
              size={16}
            />
            Refresh
          </button>

          <button
            onClick={handleProcessAnalytics}
            className="btn btn-primary"
            disabled={refreshing}
            title="Process analytics with latest data"
          >
            <Activity className="btn-icon" size={16} />
            Process
          </button>
        </div>
      </div>

      {/* Service Health Indicator */}
      {healthStatus && !healthStatus.success && (
        <div className="health-warning">
          <AlertCircle size={16} />
          <span>Analytics service is experiencing issues. Data may be outdated.</span>
        </div>
      )}

      <div className="dashboard-content">
        <div className="dashboard-grid">
          {/* Key Metrics Section */}
          <div className="dashboard-section">
            <AnalyticsMetrics
              analytics={analytics}
              loading={refreshing && !analytics}
            />
          </div>

          {/* Yield Prediction Section */}
          <div className="dashboard-section">
            <YieldPredictionCard
              analytics={analytics}
              plantData={plantData}
              loading={refreshing && !analytics}
            />
          </div>

          {/* Recommendations Section - Full Width */}
          <div className="dashboard-section span-full">
            <RecommendationsPanel
              analytics={analytics}
              loading={refreshing && !analytics}
            />
          </div>

          {/* Placeholder for future chart components */}
          {analytics && (
            <div className="dashboard-section span-full">
              <div className="coming-soon-section">
                <TrendingUp className="coming-soon-icon" />
                <h4>Trend Charts Coming Soon</h4>
                <p>
                  Interactive charts showing yield predictions, growth rates,
                  and environmental efficiency trends over time.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dashboard Footer */}
      <div className="dashboard-footer">
        <div className="footer-content">
          <div className="footer-stats">
            {analytics && (
              <>
                <span>
                  Yield Prediction: {analytics.yieldPrediction?.value || 0}g
                </span>
                <span>•</span>
                <span>
                  Growth Rate: {analytics.growthRate?.value?.toFixed(1) || 0} cm/day
                </span>
                <span>•</span>
                <span>
                  Efficiency: {((analytics.environmentalEfficiency?.overall || 0) * 100).toFixed(1)}%
                </span>
              </>
            )}
          </div>
          <div className="footer-info">
            <small>
              Analytics powered by AI analysis of cultivation data and cannabis domain expertise
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
