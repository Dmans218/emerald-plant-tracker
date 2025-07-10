import { Activity, BarChart3, Eye, Target, TrendingUp, Zap } from 'lucide-react';
import { useState } from 'react';
import AdvancedAnalyticsChart from './AdvancedAnalyticsChart';

const AnalyticsControlPanel = ({
  analyticsData,
  environmentData,
  trendPeriod,
  onTrendPeriodChange,
}) => {
  const [activeView, setActiveView] = useState('overview');
  const [selectedMetrics, setSelectedMetrics] = useState(['growth', 'health', 'environment']);
  const [correlationMode, setCorrelationMode] = useState('environmental');

  const views = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'correlation', label: 'Correlations', icon: TrendingUp },
    { id: 'performance', label: 'Performance', icon: Target },
    { id: 'techniques', label: 'Techniques', icon: Zap },
    { id: 'realtime', label: 'Real-time', icon: Activity },
  ];

  const metricOptions = [
    { id: 'growth', label: 'Growth Rate', color: '#10b981' },
    { id: 'health', label: 'Plant Health', color: '#3b82f6' },
    { id: 'environment', label: 'Environment', color: '#f59e0b' },
    { id: 'nutrients', label: 'Nutrients', color: '#ef4444' },
    { id: 'yield', label: 'Yield Prediction', color: '#8b5cf6' },
  ];

  const correlationModes = [
    { id: 'environmental', label: 'Environmental Factors' },
    { id: 'nutritional', label: 'Nutritional Balance' },
    { id: 'temporal', label: 'Time-based Trends' },
    { id: 'technique', label: 'Growing Techniques' },
  ];

  const handleMetricToggle = metricId => {
    setSelectedMetrics(prev =>
      prev.includes(metricId) ? prev.filter(id => id !== metricId) : [...prev, metricId]
    );
  };

  const getCorrelationData = () => {
    switch (correlationMode) {
      case 'environmental':
        return {
          type: 'radar',
          data: {
            labels: ['Temperature', 'Humidity', 'VPD', 'Light', 'Airflow', 'CO2'],
            datasets: [
              {
                label: 'Current',
                data: [78, 62, 87, 92, 73, 68],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                pointBackgroundColor: '#10b981',
              },
              {
                label: 'Optimal',
                data: [75, 60, 85, 90, 75, 70],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                pointBackgroundColor: '#3b82f6',
              },
            ],
          },
          title: 'Environmental Correlation Matrix',
        };

      case 'nutritional':
        return {
          type: 'polarArea',
          data: {
            labels: ['N', 'P', 'K', 'Ca', 'Mg', 'S', 'Fe', 'Mn'],
            datasets: [
              {
                data: [85, 92, 78, 88, 76, 82, 90, 84],
                backgroundColor: [
                  'rgba(16, 185, 129, 0.8)',
                  'rgba(59, 130, 246, 0.8)',
                  'rgba(245, 158, 11, 0.8)',
                  'rgba(239, 68, 68, 0.8)',
                  'rgba(168, 85, 247, 0.8)',
                  'rgba(34, 197, 94, 0.8)',
                  'rgba(14, 165, 233, 0.8)',
                  'rgba(251, 146, 60, 0.8)',
                ],
              },
            ],
          },
          title: 'Nutrient Balance Analysis',
        };

      case 'temporal':
        return {
          type: 'line',
          data: {
            labels: Array.from({ length: trendPeriod }, (_, i) => `Day ${i + 1}`),
            datasets: selectedMetrics.map(metric => {
              const config = metricOptions.find(opt => opt.id === metric);
              return {
                label: config.label,
                data: Array.from(
                  { length: trendPeriod },
                  () => Math.floor(Math.random() * 40) + 60
                ),
                borderColor: config.color,
                backgroundColor: `${config.color}20`,
                tension: 0.4,
              };
            }),
          },
          title: `${trendPeriod}-Day Trend Correlation`,
        };

      default:
        return {
          type: 'bar',
          data: {
            labels: ['LST', 'SCROG', 'Topping', 'Defoliation', 'Mainlining'],
            datasets: [
              {
                label: 'Effectiveness Score',
                data: [92, 88, 85, 78, 82],
                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                borderColor: '#10b981',
              },
            ],
          },
          title: 'Technique Effectiveness Analysis',
        };
    }
  };

  const renderOverviewCharts = () => (
    <div
      className="analytics-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '1.5rem',
      }}
    >
      {/* Growth Performance Radar */}
      <AdvancedAnalyticsChart
        type="radar"
        data={{
          labels: ['Growth Rate', 'Health Score', 'Yield Potential', 'Efficiency', 'Resilience'],
          datasets: [
            {
              label: 'Current Performance',
              data: [85, 92, 78, 88, 84],
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
            },
          ],
        }}
        title="Overall Growth Performance"
        height={300}
      />

      {/* Environmental Status */}
      <AdvancedAnalyticsChart
        type="doughnut"
        data={{
          labels: ['Optimal', 'Good', 'Needs Attention'],
          datasets: [
            {
              data: [65, 25, 10],
              backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
              borderWidth: 0,
            },
          ],
        }}
        title="Environmental Status"
        height={300}
      />

      {/* Stage Distribution */}
      <AdvancedAnalyticsChart
        type="bar"
        data={{
          labels: ['Seedling', 'Vegetative', 'Flowering', 'Harvest'],
          datasets: [
            {
              label: 'Plant Count',
              data: [0, 2, 0, 0], // Real data: 2 plants total based on user's statement
              backgroundColor: [
                'rgba(34, 197, 94, 0.8)',
                'rgba(59, 130, 246, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(239, 68, 68, 0.8)',
              ],
            },
          ],
        }}
        title="Growth Stage Distribution"
        height={300}
      />
    </div>
  );

  const renderCorrelationView = () => {
    const chartConfig = getCorrelationData();
    return (
      <div style={{ display: 'grid', gap: '1.5rem' }}>
        <div
          className="correlation-controls"
          style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            flexWrap: 'wrap',
            marginBottom: '1rem',
          }}
        >
          <div className="chart-control-group">
            <label className="chart-control-label">Correlation Type:</label>
            <select
              value={correlationMode}
              onChange={e => setCorrelationMode(e.target.value)}
              className="chart-control-select"
            >
              {correlationModes.map(mode => (
                <option key={mode.id} value={mode.id}>
                  {mode.label}
                </option>
              ))}
            </select>
          </div>

          {correlationMode === 'temporal' && (
            <div className="chart-control-group">
              <label className="chart-control-label">Metrics:</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {metricOptions.map(metric => (
                  <button
                    key={metric.id}
                    onClick={() => handleMetricToggle(metric.id)}
                    style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '6px',
                      border: `1px solid ${selectedMetrics.includes(metric.id) ? metric.color : 'var(--border)'}`,
                      background: selectedMetrics.includes(metric.id)
                        ? `${metric.color}20`
                        : 'transparent',
                      color: selectedMetrics.includes(metric.id)
                        ? metric.color
                        : 'var(--text-secondary)',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {metric.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
          <AdvancedAnalyticsChart
            type={chartConfig.type}
            data={chartConfig.data}
            title={chartConfig.title}
            height={400}
            options={chartConfig.options}
          />
        </div>
      </div>
    );
  };

  return (
    <div
      className="analytics-control-panel"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
      }}
    >
      {/* Control Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.2)',
              borderRadius: '8px',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BarChart3 className="w-5 h-5" style={{ color: '#10b981' }} />
          </div>
          <h3
            style={{
              color: 'var(--text-primary)',
              fontSize: '1.25rem',
              fontWeight: 'bold',
              margin: 0,
            }}
          >
            Advanced Analytics
          </h3>
        </div>

        <div
          className="trend-period-selector"
          style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
              fontWeight: '500',
            }}
          >
            Period:
          </span>
          {[7, 14, 30, 90].map(days => (
            <button
              key={days}
              onClick={() => onTrendPeriodChange(days)}
              style={{
                padding: '0.375rem 0.75rem',
                borderRadius: '6px',
                border: `1px solid ${trendPeriod === days ? '#10b981' : 'var(--border)'}`,
                background: trendPeriod === days ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                color: trendPeriod === days ? '#10b981' : 'var(--text-secondary)',
                fontSize: '0.75rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {days}d
            </button>
          ))}
        </div>
      </div>

      {/* View Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '1rem',
          overflowX: 'auto',
        }}
      >
        {views.map(view => {
          const Icon = view.icon;
          return (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: activeView === view.id ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                color: activeView === view.id ? '#10b981' : 'var(--text-secondary)',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon className="w-4 h-4" />
              {view.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="analytics-content">
        {activeView === 'overview' && renderOverviewCharts()}
        {activeView === 'correlation' && renderCorrelationView()}
        {activeView === 'performance' && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            Performance analytics coming soon...
          </div>
        )}
        {activeView === 'techniques' && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            Technique analysis coming soon...
          </div>
        )}
        {activeView === 'realtime' && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            Real-time monitoring coming soon...
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsControlPanel;
