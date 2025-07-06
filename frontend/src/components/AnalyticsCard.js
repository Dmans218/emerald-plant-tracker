import { AlertTriangle, CheckCircle, Info, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import React from 'react';

const AnalyticsCard = ({
  title,
  value,
  unit,
  trend,
  trendValue,
  status,
  icon: Icon,
  color = '#10b981',
  subtitle,
  loading = false,
  aggregated = false,
}) => {
  const getStatusIcon = status => {
    switch (status) {
      case 'excellent':
        return <CheckCircle className="w-4 h-4" style={{ color: '#10b981' }} />;
      case 'good':
        return <CheckCircle className="w-4 h-4" style={{ color: '#3b82f6' }} />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" style={{ color: '#f59e0b' }} />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4" style={{ color: '#ef4444' }} />;
      default:
        return <Info className="w-4 h-4" style={{ color: '#6b7280' }} />;
    }
  };

  const getTrendIcon = trend => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4" style={{ color: '#10b981' }} />;
      case 'down':
        return <TrendingDown className="w-4 h-4" style={{ color: '#ef4444' }} />;
      default:
        return <Minus className="w-4 h-4" style={{ color: '#6b7280' }} />;
    }
  };

  // Helper to safely display numbers
  function safeNumber(value, unit = '') {
    if (value === null || value === undefined || isNaN(value)) return '—';
    return `${value}${unit}`;
  }

  // Helper to safely display dates
  function safeDate(date) {
    if (!date) return '—';
    const d = new Date(date);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
  }

  if (loading) {
    return (
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          padding: '1.5rem',
          minHeight: '140px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div className="loading" style={{ width: '32px', height: '32px' }} />
      </div>
    );
  }

  return (
    <div className="card" data-testid="analytics-card">
      {/* Background gradient */}
      {/* <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "100px",
          height: "100px",
          background: `linear-gradient(135deg, ${color}20, transparent)`,
          borderRadius: "50%",
          transform: "translate(30px, -30px)",
        }}
      /> */}

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '1rem',
        }}
      >
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }}
        >
          <div
            style={{
              background: `${color}20`,
              borderRadius: '12px',
              padding: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <Icon className="w-5 h-5" style={{ color }} />
            {/* Aggregated Accent Dot */}
            {aggregated && (
              <span
                title="Tent-aggregated analytics"
                aria-label="Tent-aggregated analytics"
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: '#2563eb', // blue-600, colorblind-safe
                  border: '2px solid #fff',
                  boxShadow: '0 0 0 2px #2563eb44',
                  display: 'inline-block',
                }}
              />
            )}
          </div>
          <div>
            <h3
              style={{
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                fontWeight: '600',
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {title}
            </h3>
            {subtitle && (
              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  margin: 0,
                  marginTop: '0.25rem',
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {status && getStatusIcon(status)}
      </div>

      {/* Value */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span
            style={{
              color: 'var(--text-primary)',
              fontSize: '2rem',
              fontWeight: '700',
              lineHeight: '1',
            }}
          >
            {safeNumber(value, unit)}
          </span>
        </div>
      </div>

      {/* Trend */}
      {trend && trendValue && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {getTrendIcon(trend)}
          <span
            style={{
              color: trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#6b7280',
              fontSize: '0.875rem',
              fontWeight: '600',
            }}
          >
            {safeNumber(trendValue)}
          </span>
          <span
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
            }}
          >
            vs last week
          </span>
        </div>
      )}
    </div>
  );
};

export default AnalyticsCard;
