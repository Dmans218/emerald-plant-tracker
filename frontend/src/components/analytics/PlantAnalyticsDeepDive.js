import {
    Activity,
    AlertCircle,
    BarChart3,
    Clock,
    Dna,
    RefreshCw,
    Thermometer
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import {
    getAnalyticsHealth,
    getDeepDiveAnalytics,
    getEnvironmentalCorrelation,
    getGrowthTimeline,
    getHistoricalComparison,
    getStrainAnalysis
} from '../../utils/analyticsApi';
import EnvironmentalCorrelation from './EnvironmentalCorrelation';
import GrowthStageTimeline from './GrowthStageTimeline';
import HistoricalComparison from './HistoricalComparison';
import StrainPerformanceAnalysis from './StrainPerformanceAnalysis';

/**
 * PlantAnalyticsDeepDive Component
 * Main container for comprehensive plant analytics with advanced visualizations
 */
const PlantAnalyticsDeepDive = ({ plantId, plantData }) => {
  const [activeTab, setActiveTab] = useState('timeline');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Analytics data states
  const [deepDiveData, setDeepDiveData] = useState(null);
  const [strainAnalysis, setStrainAnalysis] = useState(null);
  const [growthTimeline, setGrowthTimeline] = useState(null);
  const [environmentalCorrelation, setEnvironmentalCorrelation] = useState(null);
  const [historicalComparison, setHistoricalComparison] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);

  // Load all analytics data
  const loadAnalyticsData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      console.log(`🔬 Loading deep-dive analytics for plant ${plantId}...`);

      // Check analytics service health first
      const health = await getAnalyticsHealth();
      setHealthStatus(health);

      if (!health.success) {
        throw new Error('Analytics service is not available');
      }

      // Load all analytics data in parallel for better performance
      const [
        deepDive,
        strain,
        timeline,
        environmental,
        historical
      ] = await Promise.all([
        getDeepDiveAnalytics(plantId).catch(err => {
          console.warn('Deep dive analytics failed:', err);
          return null;
        }),
        getStrainAnalysis(plantId).catch(err => {
          console.warn('Strain analysis failed:', err);
          return null;
        }),
        getGrowthTimeline(plantId).catch(err => {
          console.warn('Growth timeline failed:', err);
          return null;
        }),
        getEnvironmentalCorrelation(plantId, { days: 30 }).catch(err => {
          console.warn('Environmental correlation failed:', err);
          return null;
        }),
        getHistoricalComparison(plantId, {
          compareStrain: true,
          compareMedium: true,
          limit: 5
        }).catch(err => {
          console.warn('Historical comparison failed:', err);
          return null;
        })
      ]);

      // Update state with loaded data
      setDeepDiveData(deepDive);
      setStrainAnalysis(strain);
      setGrowthTimeline(timeline);
      setEnvironmentalCorrelation(environmental);
      setHistoricalComparison(historical);
      setLastUpdated(new Date());

      console.log(`✅ Deep-dive analytics loaded for plant ${plantId}`);

      if (isRefresh) {
        toast.success('Analytics data refreshed successfully');
      }

    } catch (error) {
      console.error('Error loading deep-dive analytics:', error);
      setError(error.message);

      if (isRefresh) {
        toast.error('Failed to refresh analytics data');
      } else {
        toast.error('Failed to load analytics data');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [plantId]);

  // Load data on mount and when plantId changes
  useEffect(() => {
    if (plantId) {
      loadAnalyticsData();
    }
  }, [plantId, loadAnalyticsData]);

  // Refresh handler
  const handleRefresh = useCallback(() => {
    loadAnalyticsData(true);
  }, [loadAnalyticsData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && !refreshing) {
        loadAnalyticsData(true);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [loading, refreshing, loadAnalyticsData]);

  // Tab configuration
  const tabs = [
    {
      id: 'timeline',
      label: 'Growth Timeline',
      icon: Clock,
      component: GrowthStageTimeline,
      data: growthTimeline,
      description: 'Growth stage progression and milestone tracking'
    },
    {
      id: 'strain',
      label: 'Strain Analysis',
      icon: Dna,
      component: StrainPerformanceAnalysis,
      data: strainAnalysis,
      description: 'Genetic potential vs actual performance'
    },
    {
      id: 'environmental',
      label: 'Environmental Impact',
      icon: Thermometer,
      component: EnvironmentalCorrelation,
      data: environmentalCorrelation,
      description: 'Environmental conditions correlation analysis'
    },
    {
      id: 'historical',
      label: 'Historical Comparison',
      icon: BarChart3,
      component: HistoricalComparison,
      data: historicalComparison,
      description: 'Comparison with previous grows'
    }
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  if (loading && !refreshing) {
    return (
      <div className="plant-analytics-deep-dive">
        <div className="deep-dive-header">
          <div className="loading-placeholder loading-title"></div>
          <div className="loading-placeholder loading-button"></div>
        </div>
        <div className="deep-dive-content">
          <div className="loading-placeholder loading-tabs"></div>
          <div className="loading-placeholder loading-chart-large"></div>
        </div>
      </div>
    );
  }

  if (error && !deepDiveData && !strainAnalysis && !growthTimeline) {
    return (
      <div className="plant-analytics-deep-dive">
        <div className="deep-dive-header">
          <div className="header-content">
            <Activity className="deep-dive-icon error" />
            <div className="header-text">
              <h2>Plant Analytics Deep Dive</h2>
              <span className="header-subtitle">Advanced cultivation insights</span>
            </div>
          </div>
        </div>
        <div className="error-state">
          <AlertCircle className="error-icon" />
          <h3>Unable to Load Analytics</h3>
          <p>{error}</p>
          <button
            className="btn btn-primary"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Retry
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="plant-analytics-deep-dive">
      <div className="deep-dive-header">
        <div className="header-content">
          <Activity className="deep-dive-icon" style={{ color: 'var(--primary-color)' }} />
          <div className="header-text">
            <h2>Plant Analytics Deep Dive</h2>
            <span className="header-subtitle">
              Advanced cultivation insights for {plantData?.name || `Plant ${plantId}`}
            </span>
          </div>
        </div>

        <div className="header-actions">
          <div className="health-indicator">
            {healthStatus?.success ? (
              <div className="health-status healthy">
                <div className="health-dot"></div>
                <span>Analytics Online</span>
              </div>
            ) : (
              <div className="health-status unhealthy">
                <div className="health-dot"></div>
                <span>Service Issues</span>
              </div>
            )}
          </div>

          {lastUpdated && (
            <div className="last-updated">
              <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
            </div>
          )}

          <button
            className="btn btn-secondary"
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh analytics data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Data Quality Overview */}
      {deepDiveData?.dataQuality && (
        <div className="data-quality-overview">
          <div className="quality-stats">
            <div className="quality-stat">
              <span className="quality-label">Data Coverage:</span>
              <span className="quality-value">
                {(deepDiveData.dataQuality.coverage * 100).toFixed(1)}%
              </span>
            </div>
            <div className="quality-stat">
              <span className="quality-label">Environmental Readings:</span>
              <span className="quality-value">
                {deepDiveData.dataQuality.environmentalReadings || 0}
              </span>
            </div>
            <div className="quality-stat">
              <span className="quality-label">Growth Logs:</span>
              <span className="quality-value">
                {deepDiveData.dataQuality.growthLogs || 0}
              </span>
            </div>
            <div className="quality-stat">
              <span className="quality-label">Analysis Confidence:</span>
              <span
                className="quality-value"
                style={{
                  color: deepDiveData.dataQuality.confidence >= 0.8
                    ? 'var(--success-color)'
                    : deepDiveData.dataQuality.confidence >= 0.6
                    ? 'var(--warning-color)'
                    : 'var(--error-color)'
                }}
              >
                {((deepDiveData.dataQuality.confidence || 0) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="deep-dive-tabs">
        <div className="tabs-container">
          {tabs.map(tab => {
            const IconComponent = tab.icon;
            const hasData = tab.data !== null;

            return (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''} ${!hasData ? 'no-data' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                disabled={!hasData}
              >
                <IconComponent className="tab-icon" />
                <div className="tab-content">
                  <span className="tab-label">{tab.label}</span>
                  <span className="tab-description">{tab.description}</span>
                </div>
                {!hasData && (
                  <div className="no-data-indicator" title="No data available">
                    <AlertCircle size={16} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tab Content */}
      <div className="deep-dive-content">
        {activeTabData && (
          <div className="tab-panel">
            {activeTabData.data ? (
              <activeTabData.component
                {...{
                  [`${activeTab}Data`]: activeTabData.data,
                  plantData: plantData,
                  loading: false
                }}
              />
            ) : (
              <div className="no-data-panel">
                <AlertCircle className="no-data-icon" />
                <h3>No {activeTabData.label} Data</h3>
                <p>
                  {activeTabData.description} data is not available yet.
                  This may be because:
                </p>
                <ul>
                  <li>Insufficient historical data for analysis</li>
                  <li>Analytics processing is still in progress</li>
                  <li>Plant data needs more time to generate insights</li>
                </ul>
                <button
                  className="btn btn-primary"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  {refreshing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Check Again
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Analytics Summary Footer */}
      <div className="deep-dive-footer">
        <div className="analytics-summary">
          <h4>Analytics Summary</h4>
          <div className="summary-grid">
            {deepDiveData?.plantProfile && (
              <div className="summary-item">
                <span className="summary-label">Growth Stage:</span>
                <span className="summary-value">
                  {deepDiveData.plantProfile.growthStage}
                  (Day {deepDiveData.plantProfile.daysInStage})
                </span>
              </div>
            )}

            {deepDiveData?.performanceMetrics && (
              <div className="summary-item">
                <span className="summary-label">Yield Performance:</span>
                <span className="summary-value">
                  {(deepDiveData.performanceMetrics.actualVsExpected?.yield || 0).toFixed(1)}%
                  of genetic potential
                </span>
              </div>
            )}

            {strainAnalysis?.strainInfo && (
              <div className="summary-item">
                <span className="summary-label">Strain Type:</span>
                <span className="summary-value">
                  {strainAnalysis.strainInfo.type}
                  ({strainAnalysis.strainInfo.classification})
                </span>
              </div>
            )}

            {environmentalCorrelation?.dataQuality && (
              <div className="summary-item">
                <span className="summary-label">Environmental Data:</span>
                <span className="summary-value">
                  {environmentalCorrelation.dataQuality.totalReadings} readings
                  ({(environmentalCorrelation.dataQuality.coverage * 100).toFixed(1)}% coverage)
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="footer-disclaimer">
          <small>
            Advanced analytics are based on historical data, strain characteristics,
            and environmental conditions. Results may vary based on cultivation practices
            and external factors. Use as guidance alongside your cultivation expertise.
          </small>
        </div>
      </div>
    </div>
  );
};

export default PlantAnalyticsDeepDive;
