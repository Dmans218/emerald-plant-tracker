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
    Title,
    Tooltip,
} from "chart.js";
import React from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AnalyticsChart = ({
  type = "line",
  data,
  title,
  height = 300,
  color = "#10b981",
  loading = false,
  error = null,
}) => {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          color: "#e2e8f0",
          font: {
            size: 12,
            weight: "500",
          },
          padding: 20,
          usePointStyle: true,
        },
      },
      title: {
        display: !!title,
        text: title,
        color: "#f8fafc",
        font: {
          size: 16,
          weight: "600",
        },
        padding: {
          top: 10,
          bottom: 30,
        },
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        titleColor: "#f1f5f9",
        bodyColor: "#e2e8f0",
        borderColor: "rgba(100, 116, 139, 0.3)",
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        displayColors: true,
        callbacks: {
          title: function (context) {
            return context[0].label || "";
          },
          label: function (context) {
            const label = context.dataset.label || "";
            const value = context.parsed.y || context.parsed;
            return `${label}: ${value}`;
          },
        },
      },
    },
    scales:
      type !== "doughnut"
        ? {
            x: {
              grid: {
                color: "rgba(100, 116, 139, 0.1)",
                drawBorder: false,
              },
              ticks: {
                color: "#94a3b8",
                font: {
                  size: 11,
                },
                maxTicksLimit: 8,
              },
            },
            y: {
              grid: {
                color: "rgba(100, 116, 139, 0.1)",
                drawBorder: false,
              },
              ticks: {
                color: "#94a3b8",
                font: {
                  size: 11,
                },
              },
              beginAtZero: true,
            },
          }
        : {},
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6,
        backgroundColor: color,
        borderColor: "#ffffff",
        borderWidth: 2,
      },
      line: {
        tension: 0.4,
        borderWidth: 3,
        fill: true,
      },
      bar: {
        borderRadius: 8,
        borderSkipped: false,
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
    animation: {
      duration: 1000,
      easing: "easeInOutQuart",
    },
  };

  // Cannabis-themed color palette
  const cannabisColors = {
    primary: "#10b981", // Emerald green
    secondary: "#059669", // Dark emerald
    accent: "#34d399", // Light emerald
    warning: "#f59e0b", // Amber
    danger: "#ef4444", // Red
    info: "#3b82f6", // Blue
    purple: "#8b5cf6", // Purple
    orange: "#f97316", // Orange
  };

  const enhanceChartData = (chartData) => {
    if (!chartData || !chartData.datasets) return chartData;

    return {
      ...chartData,
      datasets: chartData.datasets.map((dataset, index) => {
        const colors = Object.values(cannabisColors);
        const datasetColor =
          dataset.backgroundColor || colors[index % colors.length];

        return {
          ...dataset,
          backgroundColor:
            type === "line"
              ? `${datasetColor}20`
              : type === "doughnut"
              ? colors.slice(0, dataset.data?.length || 1)
              : datasetColor,
          borderColor:
            type === "doughnut"
              ? colors.slice(0, dataset.data?.length || 1)
              : datasetColor,
          borderWidth: type === "line" ? 3 : type === "bar" ? 0 : 2,
          fill: type === "line",
          tension: type === "line" ? 0.4 : undefined,
          pointBackgroundColor: type === "line" ? datasetColor : undefined,
          pointBorderColor: type === "line" ? "#ffffff" : undefined,
          pointBorderWidth: type === "line" ? 2 : undefined,
          pointRadius: type === "line" ? 4 : undefined,
          pointHoverRadius: type === "line" ? 6 : undefined,
        };
      }),
    };
  };

  if (loading) {
    return (
      <div
        style={{
          background: "var(--surface)",
          borderRadius: "16px",
          border: "1px solid var(--border)",
          padding: "2rem",
          height: `${height}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            className="loading"
            style={{ width: "40px", height: "40px", marginBottom: "1rem" }}
          />
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.875rem",
              margin: 0,
            }}
          >
            Loading analytics data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          background: "var(--surface)",
          borderRadius: "16px",
          border: "1px solid var(--border)",
          padding: "2rem",
          height: `${height}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              background: "rgba(239, 68, 68, 0.2)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
            }}
          >
            <span style={{ color: "#ef4444", fontSize: "1.5rem" }}>⚠</span>
          </div>
          <p
            style={{
              color: "var(--text-primary)",
              fontSize: "1rem",
              fontWeight: "600",
              margin: "0 0 0.5rem",
            }}
          >
            Unable to load chart data
          </p>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.875rem",
              margin: 0,
            }}
          >
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!data || !data.datasets || data.datasets.length === 0) {
    return (
      <div
        style={{
          background: "var(--surface)",
          borderRadius: "16px",
          border: "1px solid var(--border)",
          padding: "2rem",
          height: `${height}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              background: "rgba(100, 116, 139, 0.2)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
            }}
          >
            <span style={{ color: "#94a3b8", fontSize: "1.5rem" }}>📊</span>
          </div>
          <p
            style={{
              color: "var(--text-primary)",
              fontSize: "1rem",
              fontWeight: "600",
              margin: "0 0 0.5rem",
            }}
          >
            No data available
          </p>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.875rem",
              margin: 0,
            }}
          >
            Analytics data will appear here once available
          </p>
        </div>
      </div>
    );
  }

  const enhancedData = enhanceChartData(data);

  const ChartComponent =
    type === "line" ? Line : type === "bar" ? Bar : Doughnut;

  return (
    <div className="card" data-testid="analytics-chart-card">
      <div style={{ height: `${height}px` }}>
        <ChartComponent data={enhancedData} options={chartOptions} />
      </div>
    </div>
  );
};

export default AnalyticsChart;
