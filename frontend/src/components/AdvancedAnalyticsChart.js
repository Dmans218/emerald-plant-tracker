import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  RadialLinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Bar, Doughnut, Line, PolarArea, Radar } from 'react-chartjs-2';

// Register Chart.js components and plugins
ChartJS.register(
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  annotationPlugin
);

const AdvancedAnalyticsChart = ({
  type = 'line',
  data,
  title,
  height = 300,
  loading = false,
  error = null,
  chartConfig = {},
  annotations = [],
  multiAxis = false,
  showOptimalRanges = false,
  cultivationStage = null,
}) => {
  // Cannabis-specific optimal ranges
  const optimalRanges = {
    seedling: {
      temperature: { min: 70, max: 80, label: 'Optimal Temperature Range' },
      humidity: { min: 65, max: 75, label: 'Optimal Humidity Range' },
      vpd: { min: 0.4, max: 0.8, label: 'Optimal VPD Range' },
    },
    vegetative: {
      temperature: { min: 70, max: 85, label: 'Optimal Temperature Range' },
      humidity: { min: 55, max: 70, label: 'Optimal Humidity Range' },
      vpd: { min: 0.8, max: 1.2, label: 'Optimal VPD Range' },
    },
    flowering: {
      temperature: { min: 65, max: 80, label: 'Optimal Temperature Range' },
      humidity: { min: 40, max: 55, label: 'Optimal Humidity Range' },
      vpd: { min: 1.0, max: 1.5, label: 'Optimal VPD Range' },
    },
  };

  // Cannabis-themed color palette
  const cannabisColors = {
    primary: '#10b981', // Emerald green
    secondary: '#059669', // Dark emerald
    accent: '#34d399', // Light emerald
    warning: '#f59e0b', // Amber
    danger: '#ef4444', // Red
    info: '#3b82f6', // Blue
    purple: '#8b5cf6', // Purple
    orange: '#f97316', // Orange
    cyan: '#06b6d4', // Cyan
    rose: '#f43f5e', // Rose
  };

  // Advanced chart options with cannabis-specific styling
  const getAdvancedChartOptions = () => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: '#e2e8f0',
            font: { size: 12, weight: '500' },
            padding: 20,
            usePointStyle: true,
            filter: legendItem => !legendItem.text.includes('Optimal Range'),
          },
        },
        title: {
          display: !!title,
          text: title,
          color: '#f8fafc',
          font: { size: 16, weight: '600' },
          padding: { top: 10, bottom: 30 },
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          titleColor: '#f1f5f9',
          bodyColor: '#e2e8f0',
          borderColor: 'rgba(100, 116, 139, 0.3)',
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12,
          displayColors: true,
          callbacks: {
            title: function (context) {
              return context[0].label || '';
            },
            label: function (context) {
              const label = context.dataset.label || '';
              let value = context.parsed.y || context.parsed;

              // Format values based on chart type
              if (label.includes('Temperature')) {
                value = `${value}°F`;
              } else if (label.includes('Humidity')) {
                value = `${value}%`;
              } else if (label.includes('VPD')) {
                value = `${value} kPa`;
              } else if (label.includes('Yield')) {
                value = `${value}g`;
              } else if (label.includes('Growth')) {
                value = `${value} cm/day`;
              }

              return `${label}: ${value}`;
            },
            afterBody: function (context) {
              if (cultivationStage && showOptimalRanges) {
                const ranges = optimalRanges[cultivationStage];
                const point = context[0];
                const value = point.parsed.y;
                const label = point.dataset.label.toLowerCase();

                if (label.includes('temperature') && ranges.temperature) {
                  const { min, max } = ranges.temperature;
                  const status =
                    value >= min && value <= max
                      ? '✅ Optimal'
                      : value < min
                        ? '🔵 Too Low'
                        : '🔴 Too High';
                  return [`Optimal Range: ${min}-${max}°F`, status];
                }
                if (label.includes('humidity') && ranges.humidity) {
                  const { min, max } = ranges.humidity;
                  const status =
                    value >= min && value <= max
                      ? '✅ Optimal'
                      : value < min
                        ? '🔵 Too Low'
                        : '🔴 Too High';
                  return [`Optimal Range: ${min}-${max}%`, status];
                }
                if (label.includes('vpd') && ranges.vpd) {
                  const { min, max } = ranges.vpd;
                  const status =
                    value >= min && value <= max
                      ? '✅ Optimal'
                      : value < min
                        ? '🔵 Too Low'
                        : '🔴 Too High';
                  return [`Optimal Range: ${min}-${max} kPa`, status];
                }
              }
              return [];
            },
          },
        },
        annotation: {
          annotations: annotations.reduce((acc, annotation) => {
            acc[annotation.id] = annotation;
            return acc;
          }, {}),
        },
      },
      scales:
        type === 'radar' || type === 'polarArea' || type === 'doughnut'
          ? {}
          : {
              x: {
                grid: { color: 'rgba(100, 116, 139, 0.1)', drawBorder: false },
                ticks: {
                  color: '#94a3b8',
                  font: { size: 11 },
                  maxTicksLimit: 8,
                  callback: function (value, index) {
                    const label = this.getLabelForValue(value);
                    // Truncate long labels
                    return label.length > 10 ? label.substring(0, 8) + '...' : label;
                  },
                },
              },
              y: {
                type: 'linear',
                display: true,
                position: 'left',
                grid: { color: 'rgba(100, 116, 139, 0.1)', drawBorder: false },
                ticks: { color: '#94a3b8', font: { size: 11 } },
                beginAtZero: true,
              },
            },
      elements: {
        point: {
          radius: 4,
          hoverRadius: 6,
          backgroundColor: cannabisColors.primary,
          borderColor: '#ffffff',
          borderWidth: 2,
        },
        line: {
          tension: 0.4,
          borderWidth: 3,
          fill: false,
        },
        bar: {
          borderRadius: 8,
          borderSkipped: false,
        },
      },
      animation: {
        duration: 1000,
        easing: 'easeInOutQuart',
      },
    };

    // Multi-axis configuration
    if (multiAxis && type === 'line') {
      baseOptions.scales.y1 = {
        type: 'linear',
        display: true,
        position: 'right',
        grid: { drawOnChartArea: false },
        ticks: { color: '#94a3b8', font: { size: 11 } },
      };
    }

    // Radar chart specific options
    if (type === 'radar') {
      baseOptions.scales = {
        r: {
          angleLines: { color: 'rgba(100, 116, 139, 0.3)' },
          grid: { color: 'rgba(100, 116, 139, 0.3)' },
          pointLabels: {
            color: '#e2e8f0',
            font: { size: 11 },
            callback: function (value) {
              // Truncate long labels for radar chart
              return value.length > 12 ? value.substring(0, 10) + '...' : value;
            },
          },
          ticks: {
            color: '#94a3b8',
            font: { size: 10 },
            backdropColor: 'rgba(15, 23, 42, 0.8)',
            backdropPadding: 2,
          },
          beginAtZero: true,
        },
      };
    }

    // Merge with custom config
    return {
      ...baseOptions,
      ...chartConfig,
      plugins: {
        ...baseOptions.plugins,
        ...chartConfig.plugins,
      },
    };
  };

  // Add optimal range annotations if enabled
  const addOptimalRangeAnnotations = chartData => {
    if (!showOptimalRanges || !cultivationStage || !optimalRanges[cultivationStage]) {
      return chartData;
    }

    const ranges = optimalRanges[cultivationStage];
    const newAnnotations = [];

    // Add range annotations for relevant metrics
    chartData.datasets.forEach((dataset, index) => {
      const label = dataset.label.toLowerCase();

      if (label.includes('temperature') && ranges.temperature) {
        newAnnotations.push({
          id: `temp-range-${index}`,
          type: 'box',
          yMin: ranges.temperature.min,
          yMax: ranges.temperature.max,
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderColor: 'rgba(16, 185, 129, 0.3)',
          borderWidth: 1,
          label: {
            content: 'Optimal Temperature',
            enabled: true,
            position: 'start',
            color: '#10b981',
            font: { size: 10 },
          },
        });
      }

      if (label.includes('humidity') && ranges.humidity) {
        newAnnotations.push({
          id: `humidity-range-${index}`,
          type: 'box',
          yMin: ranges.humidity.min,
          yMax: ranges.humidity.max,
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderColor: 'rgba(59, 130, 246, 0.3)',
          borderWidth: 1,
          label: {
            content: 'Optimal Humidity',
            enabled: true,
            position: 'start',
            color: '#3b82f6',
            font: { size: 10 },
          },
        });
      }
    });

    annotations.push(...newAnnotations);
    return chartData;
  };

  // Enhanced data processing
  const enhanceChartData = chartData => {
    if (!chartData || !chartData.datasets) return chartData;

    const enhancedData = {
      ...chartData,
      datasets: chartData.datasets.map((dataset, index) => {
        const colors = Object.values(cannabisColors);
        const datasetColor =
          dataset.borderColor || dataset.backgroundColor || colors[index % colors.length];

        const enhancedDataset = {
          ...dataset,
          borderColor:
            type === 'doughnut' || type === 'polarArea'
              ? colors.slice(0, dataset.data?.length || 1)
              : datasetColor,
          backgroundColor:
            type === 'line'
              ? `${datasetColor}20`
              : type === 'doughnut' || type === 'polarArea'
                ? colors.slice(0, dataset.data?.length || 1).map(color => `${color}80`)
                : type === 'radar'
                  ? `${datasetColor}20`
                  : datasetColor,
          borderWidth: type === 'line' ? 3 : type === 'radar' ? 2 : type === 'bar' ? 0 : 2,
          fill: type === 'line' || type === 'radar',
          tension: type === 'line' || type === 'radar' ? 0.4 : undefined,
          pointBackgroundColor: type === 'line' ? datasetColor : undefined,
          pointBorderColor: type === 'line' ? '#ffffff' : undefined,
          pointBorderWidth: type === 'line' ? 2 : undefined,
          pointRadius: type === 'line' ? 4 : undefined,
          pointHoverRadius: type === 'line' ? 6 : undefined,
        };

        // Multi-axis assignment
        if (multiAxis && type === 'line' && index > 0) {
          enhancedDataset.yAxisID = 'y1';
        }

        return enhancedDataset;
      }),
    };

    return addOptimalRangeAnnotations(enhancedData);
  };

  // Loading state
  if (loading) {
    return (
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          padding: '2rem',
          height: `${height}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div className="advanced-loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
              margin: '1rem 0 0 0',
            }}
          >
            Processing analytics data...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          padding: '2rem',
          height: `${height}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              background: 'rgba(239, 68, 68, 0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <span style={{ color: '#ef4444', fontSize: '1.5rem' }}>⚠</span>
          </div>
          <p
            style={{
              color: 'var(--text-primary)',
              fontSize: '1rem',
              fontWeight: '600',
              margin: '0 0 0.5rem',
            }}
          >
            Unable to load advanced chart
          </p>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
              margin: 0,
            }}
          >
            {error}
          </p>
        </div>
      </div>
    );
  }

  // No data state
  if (!data || !data.datasets || data.datasets.length === 0) {
    return (
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          padding: '2rem',
          height: `${height}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              background: 'rgba(100, 116, 139, 0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <span style={{ color: '#94a3b8', fontSize: '1.5rem' }}>📊</span>
          </div>
          <p
            style={{
              color: 'var(--text-primary)',
              fontSize: '1rem',
              fontWeight: '600',
              margin: '0 0 0.5rem',
            }}
          >
            No data available
          </p>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
              margin: 0,
            }}
          >
            Advanced analytics will appear here once data is collected
          </p>
        </div>
      </div>
    );
  }

  const enhancedData = enhanceChartData(data);
  const chartOptions = getAdvancedChartOptions();

  // Select appropriate chart component
  const ChartComponent =
    {
      line: Line,
      bar: Bar,
      doughnut: Doughnut,
      radar: Radar,
      polarArea: PolarArea,
    }[type] || Line;

  return (
    <div className="advanced-analytics-chart" data-testid="advanced-analytics-chart">
      <div style={{ height: `${height}px` }}>
        <ChartComponent data={enhancedData} options={chartOptions} />
      </div>

      {/* Chart Legend for Optimal Ranges */}
      {showOptimalRanges && cultivationStage && (
        <div
          style={{
            marginTop: '1rem',
            padding: '0.75rem',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '8px',
            border: '1px solid var(--border)',
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              flexWrap: 'wrap',
            }}
          >
            <span>🌿 Optimal ranges for {cultivationStage} stage:</span>
            <span style={{ color: '#10b981' }}>● Temperature</span>
            <span style={{ color: '#3b82f6' }}>● Humidity</span>
            <span style={{ color: '#f59e0b' }}>● VPD</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedAnalyticsChart;
