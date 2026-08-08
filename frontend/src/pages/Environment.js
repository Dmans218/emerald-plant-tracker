import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Plus, Thermometer, Droplets, TestTube, Sun, Trash2, TrendingUp,
  Camera, Wind, Beaker, Edit, ArrowLeft, Home, ChevronDown, ChevronUp, ChevronRight
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { format, subDays, startOfDay } from 'date-fns';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { environmentApi, plantsApi, tentsApi } from '../utils/api';
import ImageUpload from '../components/ImageUpload';
import PageHeader from '../components/PageHeader';

function exportToCSV(logs) {
  if (!logs || logs.length === 0) return;
  const headers = [
    'Date', 'Time', 'Tent', 'Current Tent Stage', 'Temperature (°F)', 'Humidity (%)',
    'pH', 'Light (h)', 'VPD (kPa)', 'CO2 (ppm)', 'PPFD', 'Notes'
  ];
  const rows = logs.map((log) => [
    format(new Date(log.logged_at), 'MMM dd'),
    format(new Date(log.logged_at), 'HH:mm'),
    log.grow_tent || '',
    log.stage || '',
    log.temperature ?? '',
    log.humidity ?? '',
    log.ph_level ?? '',
    log.light_hours ?? '',
    log.vpd ?? '',
    log.co2_ppm ?? '',
    log.ppfd ?? '',
    (log.notes || '').replace(/"/g, '""')
  ]);
  const csvContent = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'environment_readings.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const fieldStyle = {
  width: '100%',
  padding: '0.5rem',
  border: '1px solid var(--border)',
  borderRadius: '6px',
  background: 'var(--surface)',
  color: 'var(--text-primary)',
  fontSize: '0.875rem'
};

const labelStyle = {
  display: 'block',
  fontSize: '0.875rem',
  fontWeight: '600',
  color: 'var(--text-primary)',
  marginBottom: '0.25rem'
};

const chipStyle = (bg, border, color) => ({
  padding: '0.15rem 0.4rem',
  background: bg,
  border: `1px solid ${border}`,
  borderRadius: '5px',
  color,
  fontSize: '0.7rem',
  fontWeight: 600
});

const CHARTS = [
  { id: 'temperature', label: 'Temperature', dataKey: 'temperature', color: '#f87171', domain: [60, 90], unit: '°F', Icon: Thermometer },
  { id: 'humidity', label: 'Humidity', dataKey: 'humidity', color: '#60a5fa', domain: [0, 100], unit: '%', Icon: Droplets },
  { id: 'vpd', label: 'VPD', dataKey: 'vpd', color: '#22d3ee', domain: [0, 3], unit: ' kPa', Icon: Wind },
  { id: 'ph', label: 'pH Level', dataKey: 'ph_level', color: '#bef264', domain: [4, 9], unit: '', Icon: TestTube },
  { id: 'co2', label: 'CO₂', dataKey: 'co2_ppm', color: '#fbbf24', domain: [300, 1500], unit: 'ppm', Icon: Wind },
  { id: 'ppfd', label: 'PPFD', dataKey: 'ppfd', color: '#a78bfa', domain: [0, 2000], unit: '', Icon: Sun }
];

const MetricChips = ({ log }) => {
  const chips = [];
  if (log.temperature != null && log.temperature !== '') {
    chips.push(<span key="t" style={chipStyle('rgba(239, 68, 68, 0.12)', 'rgba(239, 68, 68, 0.25)', '#f87171')}>{log.temperature}°F</span>);
  }
  if (log.humidity != null && log.humidity !== '') {
    chips.push(<span key="h" style={chipStyle('rgba(59, 130, 246, 0.12)', 'rgba(59, 130, 246, 0.25)', '#60a5fa')}>{log.humidity}%</span>);
  }
  if (log.vpd != null && log.vpd !== '') {
    chips.push(<span key="v" style={chipStyle('rgba(6, 182, 212, 0.12)', 'rgba(6, 182, 212, 0.25)', '#22d3ee')}>{log.vpd} kPa</span>);
  }
  if (log.ph_level != null && log.ph_level !== '') {
    chips.push(<span key="p" style={chipStyle('rgba(132, 204, 22, 0.12)', 'rgba(132, 204, 22, 0.25)', '#bef264')}>pH {log.ph_level}</span>);
  }
  if (log.co2_ppm != null && log.co2_ppm !== '') {
    chips.push(<span key="c" style={chipStyle('rgba(251, 191, 36, 0.12)', 'rgba(251, 191, 36, 0.25)', '#fbbf24')}>{log.co2_ppm} ppm</span>);
  }
  if (log.ppfd != null && log.ppfd !== '') {
    chips.push(<span key="pp" style={chipStyle('rgba(168, 85, 247, 0.12)', 'rgba(168, 85, 247, 0.25)', '#a78bfa')}>{log.ppfd} PPFD</span>);
  }
  if (log.light_hours != null && log.light_hours !== '') {
    chips.push(<span key="l" style={chipStyle('rgba(245, 158, 11, 0.12)', 'rgba(245, 158, 11, 0.25)', '#fbbf24')}>{log.light_hours}h light</span>);
  }
  if (chips.length === 0) return <span style={{ color: '#64748b', fontSize: '0.75rem' }}>—</span>;
  return <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>{chips}</div>;
};

const Environment = () => {
  const [environmentLogs, setEnvironmentLogs] = useState([]);
  const [latestReading, setLatestReading] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showWeekly, setShowWeekly] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [growTents, setGrowTents] = useState([]);
  const [latestPerTent, setLatestPerTent] = useState({});
  const [editingLog, setEditingLog] = useState(null);
  const [selectedChart, setSelectedChart] = useState(null);
  const [readingRange, setReadingRange] = useState('30'); // 7 | 30 | 90 | all
  const [expandedDays, setExpandedDays] = useState({});
  const [visibleDayCount, setVisibleDayCount] = useState(5);

  const location = useLocation();
  const navigate = useNavigate();
  const { register, handleSubmit, reset, setValue, formState: { isSubmitting, errors } } = useForm();

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const selectedTent = params.get('tent') || '';
  const addFromUrl = params.get('add') === '1';

  const updateUrl = useCallback((next) => {
    const p = new URLSearchParams();
    if (next.tent) p.set('tent', next.tent);
    if (next.add) p.set('add', '1');
    const qs = p.toString();
    navigate(qs ? `/environment?${qs}` : '/environment', { replace: next.replace !== false });
  }, [navigate]);

  const fetchTentList = useCallback(async () => {
    try {
      const [plantTents, envTents, latestRows] = await Promise.all([
        plantsApi.getGrowTents().catch(() => []),
        environmentApi.getGrowTents().catch(() => []),
        environmentApi.getLatestPerTent().catch(() => [])
      ]);

      const map = new Map();
      (Array.isArray(plantTents) ? plantTents : []).forEach((t) => {
        if (!t.grow_tent) return;
        map.set(t.grow_tent, {
          grow_tent: t.grow_tent,
          plant_count: t.plant_count || 0,
          reading_count: 0,
          last_reading: null
        });
      });
      (Array.isArray(envTents) ? envTents : []).forEach((t) => {
        if (!t.grow_tent) return;
        const existing = map.get(t.grow_tent) || { grow_tent: t.grow_tent, plant_count: 0 };
        map.set(t.grow_tent, {
          ...existing,
          reading_count: t.reading_count || 0,
          last_reading: t.last_reading || existing.last_reading
        });
      });

      const tents = Array.from(map.values()).sort((a, b) => a.grow_tent.localeCompare(b.grow_tent));
      setGrowTents(tents);

      const latestMap = {};
      (Array.isArray(latestRows) ? latestRows : []).forEach((row) => {
        if (row.grow_tent) latestMap[row.grow_tent] = row;
      });
      setLatestPerTent(latestMap);
    } catch {
      toast.error('Failed to load tents');
    }
  }, []);

  const fetchTentData = useCallback(async () => {
    if (!selectedTent) {
      setEnvironmentLogs([]);
      setLatestReading(null);
      setWeeklyData([]);
      return;
    }
    try {
      const [logs, latest, weekly] = await Promise.all([
        environmentApi.getAll({ grow_tent: selectedTent, limit: 500 }),
        environmentApi.getLatest({ grow_tent: selectedTent }),
        environmentApi.getWeekly({ grow_tent: selectedTent, weeks: 8 })
      ]);
      setEnvironmentLogs(Array.isArray(logs) ? logs : []);
      setLatestReading(latest && latest.id ? latest : null);
      setWeeklyData(Array.isArray(weekly) ? weekly : []);
    } catch {
      toast.error('Failed to load environment data');
      setEnvironmentLogs([]);
      setLatestReading(null);
      setWeeklyData([]);
    }
  }, [selectedTent]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await fetchTentList();
      if (cancelled) return;
      if (selectedTent) {
        await fetchTentData();
      } else {
        setEnvironmentLogs([]);
        setLatestReading(null);
        setWeeklyData([]);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [fetchTentList, fetchTentData, selectedTent]);

  useEffect(() => {
    if (selectedTent && addFromUrl && !editingLog) {
      setShowForm(true);
      reset({
        grow_tent: selectedTent,
        logged_at: format(new Date(), "yyyy-MM-dd'T'HH:mm")
      });
    }
  }, [selectedTent, addFromUrl, editingLog, reset]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && selectedChart) setSelectedChart(null);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedChart]);

  const getCurrentDateTime = () => format(new Date(), "yyyy-MM-dd'T'HH:mm");

  const getImageDateTime = (parsedData) => {
    if (parsedData.timestamp) {
      try {
        return format(new Date(parsedData.timestamp), "yyyy-MM-dd'T'HH:mm");
      } catch {
        return getCurrentDateTime();
      }
    }
    return getCurrentDateTime();
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingLog(null);
    reset();
    updateUrl({ tent: selectedTent, add: false, replace: true });
  };

  const openAddForm = () => {
    setEditingLog(null);
    reset({
      grow_tent: selectedTent,
      logged_at: getCurrentDateTime()
    });
    setShowForm(true);
    updateUrl({ tent: selectedTent, add: true, replace: false });
  };

  const handleEdit = (log) => {
    setEditingLog(log);
    reset({
      grow_tent: log.grow_tent || selectedTent,
      temperature: log.temperature ?? '',
      humidity: log.humidity ?? '',
      ph_level: log.ph_level ?? '',
      light_hours: log.light_hours ?? '',
      vpd: log.vpd ?? '',
      co2_ppm: log.co2_ppm ?? '',
      ppfd: log.ppfd ?? '',
      logged_at: format(new Date(log.logged_at), "yyyy-MM-dd'T'HH:mm"),
      notes: log.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (logId) => {
    if (!window.confirm('Are you sure you want to delete this environment log?')) return;
    try {
      await environmentApi.delete(logId);
      toast.success('Environment log deleted successfully');
      await fetchTentData();
      await fetchTentList();
    } catch (error) {
      toast.error(`Failed to delete environment log: ${error.message}`);
    }
  };

  const handleClearTentClimate = async (tentName, { plantCount = 0, readingCount = 0 } = {}) => {
    const name = tentName || selectedTent;
    if (!name) return;

    const plants = plantCount || 0;
    const readings = readingCount || 0;

    const first = window.confirm(
      plants > 0
        ? `Clear all climate readings for "${name}"?\n\n` +
          `This deletes ${readings || 'all'} environment log(s). ` +
          `${plants} active plant(s) will stay assigned to this tent.\n\n` +
          `This cannot be undone.`
        : `Clear climate data for tent "${name}"?\n\n` +
          `This deletes ${readings || 'all'} reading(s). ` +
          (plants === 0
            ? 'With no plants left, the tent will disappear from this list.'
            : '') +
          `\n\nThis cannot be undone.`
    );
    if (!first) return;

    if (plants > 0) {
      const second = window.confirm(
        `FINAL CONFIRMATION\n\n` +
          `Clear climate history for "${name}" while keeping ${plants} plant(s)?`
      );
      if (!second) return;
    }

    try {
      const result = await tentsApi.clearEnvironment(name, true, plants > 0);
      const deleted = result?.deletedRows ?? 0;
      toast.success(
        deleted > 0
          ? `Cleared ${deleted} climate reading${deleted === 1 ? '' : 's'} for ${name}`
          : `No climate readings to clear for ${name}`
      );
      // If no plants remain, leave the tent view so the empty tent goes away
      if ((plantCount || 0) === 0 && name === selectedTent) {
        navigate('/environment');
      } else {
        await fetchTentList();
        if (name === selectedTent) await fetchTentData();
      }
    } catch (error) {
      // Retry with force if server still requires it
      if (String(error.message || '').toLowerCase().includes('force')) {
        try {
          const result = await tentsApi.clearEnvironment(name, true, true);
          toast.success(`Cleared climate data for ${name} (${result?.deletedRows || 0} readings)`);
          await fetchTentList();
          if (name === selectedTent) await fetchTentData();
          return;
        } catch (retryErr) {
          toast.error(retryErr.message || 'Failed to clear tent climate data');
          return;
        }
      }
      toast.error(error.message || 'Failed to clear tent climate data');
    }
  };

  const onSubmit = async (data) => {
    try {
      const environmentData = {
        ...data,
        grow_tent: selectedTent || data.grow_tent,
        temperature: data.temperature ? parseFloat(data.temperature) : null,
        humidity: data.humidity ? parseFloat(data.humidity) : null,
        ph_level: data.ph_level ? parseFloat(data.ph_level) : null,
        light_hours: data.light_hours ? parseFloat(data.light_hours) : null,
        vpd: data.vpd ? parseFloat(data.vpd) : null,
        co2_ppm: data.co2_ppm ? parseFloat(data.co2_ppm) : null,
        ppfd: data.ppfd ? parseFloat(data.ppfd) : null,
        logged_at: data.logged_at || new Date().toISOString()
      };

      if (editingLog) {
        await environmentApi.update(editingLog.id, environmentData);
        toast.success('Environment data updated successfully');
      } else {
        await environmentApi.create(environmentData);
        toast.success('Environment data added successfully');
      }

      await fetchTentData();
      await fetchTentList();
      closeForm();
    } catch (error) {
      toast.error(error.message || 'Failed to save reading');
    }
  };

  const handleImageData = (parsedData) => {
    const formData = {
      logged_at: getImageDateTime(parsedData),
      grow_tent: selectedTent
    };
    if (parsedData.temperature != null) {
      formData.temperature = ((parsedData.temperature * 9) / 5 + 32).toFixed(1);
    }
    if (parsedData.humidity != null) formData.humidity = parsedData.humidity.toString();
    if (parsedData.ph != null) formData.ph_level = parsedData.ph.toString();
    if (parsedData.vpd != null) formData.vpd = parsedData.vpd.toString();
    if (parsedData.co2 != null) formData.co2_ppm = parsedData.co2.toString();
    if (parsedData.ppfd != null) formData.ppfd = parsedData.ppfd.toString();

    reset(formData);
    setValue('grow_tent', selectedTent);
    setShowForm(true);
    setShowImageUpload(false);
    const timeSource = parsedData.timestamp ? 'photo timestamp' : 'current time';
    toast.success(`Data from image loaded using ${timeSource}. Review and submit.`);
  };

  const selectTent = (tentName) => {
    navigate(`/environment?tent=${encodeURIComponent(tentName)}`);
  };

  const changeTent = () => {
    navigate('/environment');
  };

  const sortedLogsForGraphs = useMemo(
    () => [...environmentLogs].sort((a, b) => new Date(a.logged_at) - new Date(b.logged_at)),
    [environmentLogs]
  );

  const filteredReadingLogs = useMemo(() => {
    if (readingRange === 'all') return environmentLogs;
    const days = parseInt(readingRange, 10);
    const cutoff = startOfDay(subDays(new Date(), days - 1));
    return environmentLogs.filter((log) => new Date(log.logged_at) >= cutoff);
  }, [environmentLogs, readingRange]);

  const groupedLogs = useMemo(() => {
    const groups = [];
    const map = new Map();
    filteredReadingLogs.forEach((log) => {
      const dayKey = format(new Date(log.logged_at), 'yyyy-MM-dd');
      const dayLabel = format(new Date(log.logged_at), 'EEE, MMM dd');
      if (!map.has(dayKey)) {
        const group = { key: dayKey, label: dayLabel, logs: [] };
        map.set(dayKey, group);
        groups.push(group);
      }
      map.get(dayKey).logs.push(log);
    });
    return groups;
  }, [filteredReadingLogs]);

  const visibleGroups = useMemo(
    () => groupedLogs.slice(0, visibleDayCount),
    [groupedLogs, visibleDayCount]
  );

  const newestDayKey = groupedLogs[0]?.key || '';

  // Keep the newest day expanded when the tent/range/data window changes
  useEffect(() => {
    setVisibleDayCount(5);
    if (newestDayKey) {
      setExpandedDays({ [newestDayKey]: true });
    } else {
      setExpandedDays({});
    }
  }, [selectedTent, readingRange, newestDayKey]);

  const toggleDay = (dayKey) => {
    setExpandedDays((prev) => ({ ...prev, [dayKey]: !prev[dayKey] }));
  };

  const daySummary = (logs) => {
    const temps = logs.map((l) => l.temperature).filter((v) => v != null && v !== '');
    const hums = logs.map((l) => l.humidity).filter((v) => v != null && v !== '');
    const parts = [];
    if (temps.length) {
      const avg = temps.reduce((a, b) => a + Number(b), 0) / temps.length;
      parts.push(`${avg.toFixed(1)}°F`);
    }
    if (hums.length) {
      const avg = hums.reduce((a, b) => a + Number(b), 0) / hums.length;
      parts.push(`${avg.toFixed(0)}% RH`);
    }
    return parts.join(' · ');
  };

  const chartConfig = CHARTS.find((c) => c.id === selectedChart);
  const ChartIcon = chartConfig?.Icon;

  const heroMetrics = latestReading ? [
    { label: 'Temp', value: latestReading.temperature != null ? `${latestReading.temperature}°F` : '—', color: '#f87171', Icon: Thermometer },
    { label: 'Humidity', value: latestReading.humidity != null ? `${latestReading.humidity}%` : '—', color: '#60a5fa', Icon: Droplets },
    { label: 'VPD', value: latestReading.vpd != null ? `${latestReading.vpd} kPa` : '—', color: '#22d3ee', Icon: Wind },
    { label: 'CO₂', value: latestReading.co2_ppm != null ? `${latestReading.co2_ppm}` : '—', color: '#fbbf24', Icon: Wind },
    { label: 'PPFD', value: latestReading.ppfd != null ? `${latestReading.ppfd}` : '—', color: '#a78bfa', Icon: Sun },
    { label: 'pH', value: latestReading.ph_level != null ? `${latestReading.ph_level}` : '—', color: '#bef264', Icon: Beaker },
    { label: 'Light', value: latestReading.light_hours != null ? `${latestReading.light_hours}h` : '—', color: '#fbbf24', Icon: Sun }
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="loading" />
      </div>
    );
  }

  // ——— Tent picker ———
  if (!selectedTent) {
    return (
      <div className="dashboard-page">
        <PageHeader
          icon={Thermometer}
          title="Environment"
          subtitle="Choose a tent to view climate readings and trends"
        />

        <div className="page-panel">
          {growTents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <Home className="w-12 h-12" style={{ color: '#4ade80', margin: '0 auto 1rem' }} />
              <h3 style={{ color: '#f8fafc', marginBottom: '0.5rem' }}>No tents yet</h3>
              <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
                Assign plants to a grow tent, then come back to log climate readings.
              </p>
              <Link to="/" className="btn btn-primary inline-flex items-center gap-2">
                Go to Plants
              </Link>
            </div>
          ) : (
            <>
              <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                Select a tent to monitor climate. Use Clear to remove leftover climate history
                (e.g. after a grow finishes or test tents).
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1rem'
              }}
              >
                {growTents.map((tent) => {
                  const latest = latestPerTent[tent.grow_tent];
                  const plantCount = tent.plant_count || 0;
                  const readingCount = tent.reading_count || 0;
                  const canClear = readingCount > 0 || plantCount === 0;
                  return (
                    <div
                      key={tent.grow_tent}
                      className="env-tent-card"
                      style={{
                        textAlign: 'left',
                        padding: '1.1rem',
                        background: 'rgba(15, 23, 42, 0.55)',
                        border: '1px solid rgba(100, 116, 139, 0.35)',
                        borderRadius: '14px',
                        color: 'inherit',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem'
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => selectTent(tent.grow_tent)}
                        style={{
                          textAlign: 'left',
                          padding: 0,
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'inherit',
                          width: '100%'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.65rem' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: 'rgba(239, 68, 68, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                          >
                            <Thermometer className="w-5 h-5" style={{ color: '#f87171' }} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: '1rem' }}>{tent.grow_tent}</div>
                            <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                              {[
                                plantCount ? `${plantCount} plant${plantCount === 1 ? '' : 's'}` : 'No plants',
                                readingCount ? `${readingCount} reading${readingCount === 1 ? '' : 's'}` : 'No readings'
                              ].join(' · ')}
                            </div>
                          </div>
                        </div>
                        {latest ? (
                          <div style={{ color: '#cbd5e1', fontSize: '0.8rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {latest.temperature != null && <span style={{ color: '#f87171' }}>{latest.temperature}°F</span>}
                            {latest.humidity != null && <span style={{ color: '#60a5fa' }}>{latest.humidity}%</span>}
                            {latest.logged_at && (
                              <span style={{ color: '#64748b' }}>
                                {format(new Date(latest.logged_at), 'MMM dd, HH:mm')}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div style={{ color: '#64748b', fontSize: '0.8rem' }}>No climate data yet</div>
                        )}
                      </button>
                      {canClear && readingCount > 0 && (
                        <button
                          type="button"
                          className="btn btn-outline env-tent-clear-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClearTentClimate(tent.grow_tent, {
                              plantCount,
                              readingCount
                            });
                          }}
                          style={{
                            alignSelf: 'flex-start',
                            fontSize: '0.75rem',
                            padding: '0.35rem 0.65rem',
                            color: '#f87171',
                            borderColor: 'rgba(239, 68, 68, 0.4)'
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" style={{ width: '0.9rem', height: '0.9rem' }} />
                          Clear climate data
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ——— Tent journal ———
  return (
    <div className="dashboard-page">
      <PageHeader
        icon={Thermometer}
        title={`Environment — ${selectedTent}`}
        subtitle={
          latestReading?.stage && latestReading.stage !== 'N/A'
            ? `Current tent stage: ${latestReading.stage}`
            : 'Climate readings and trends for this tent'
        }
        actions={(
          <>
            <button type="button" onClick={changeTent} className="btn btn-outline flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Change tent
            </button>
            {environmentLogs.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  const meta = growTents.find((t) => t.grow_tent === selectedTent) || {};
                  handleClearTentClimate(selectedTent, {
                    plantCount: meta.plant_count || 0,
                    readingCount: meta.reading_count || environmentLogs.length
                  });
                }}
                className="btn btn-outline flex items-center gap-2"
                style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)' }}
              >
                <Trash2 className="w-4 h-4" />
                Clear climate data
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowImageUpload(true)}
              className="btn btn-outline flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              From Screenshot
            </button>
            <button type="button" onClick={openAddForm} className="btn btn-primary flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Reading
            </button>
          </>
        )}
      />

      {/* Latest conditions hero */}
      <div className="page-panel">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}
        >
          <div>
            <h2 className="page-panel-title" style={{ margin: 0 }}>Latest Conditions</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', margin: '0.35rem 0 0' }}>
              At-a-glance snapshot for this tent
            </p>
          </div>
          {latestReading?.logged_at && (
            <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
              Updated {format(new Date(latestReading.logged_at), 'MMM dd, yyyy · HH:mm')}
            </span>
          )}
        </div>
        {!latestReading ? (
          <p style={{ color: '#94a3b8', margin: 0, textAlign: 'center', padding: '1rem 0' }}>
            No readings yet for this tent. Add a reading to start tracking climate.
          </p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(118px, 1fr))',
            gap: '0.75rem',
            justifyContent: 'center',
            maxWidth: '1100px',
            margin: '0 auto'
          }}
          >
            {heroMetrics.map((m) => {
              const Icon = m.Icon;
              return (
                <div
                  key={m.label}
                  style={{
                    padding: '1rem 0.75rem',
                    background: 'rgba(15, 23, 42, 0.55)',
                    border: `1px solid ${m.color}33`,
                    borderRadius: '12px',
                    textAlign: 'center',
                    minWidth: 0
                  }}
                >
                  <Icon className="w-4 h-4" style={{ color: m.color, margin: '0 auto 0.45rem' }} />
                  <div style={{
                    color: m.color,
                    fontWeight: 700,
                    fontSize: '1.125rem',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.2
                  }}
                  >
                    {m.value}
                  </div>
                  <div style={{
                    color: '#94a3b8',
                    fontSize: '0.7rem',
                    marginTop: '0.35rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    fontWeight: 600
                  }}
                  >
                    {m.label}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit form modal */}
      {showForm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}
        >
          <div style={{
            background: 'var(--surface)',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            padding: '1.5rem',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>
                {editingLog ? 'Edit Environment Reading' : 'Add Environment Reading'}
              </h2>
              <button type="button" onClick={closeForm} className="btn btn-secondary" style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}>
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                <div style={{ gridColumn: 'span 3' }}>
                  <label style={labelStyle}>Grow Tent</label>
                  <input type="hidden" {...register('grow_tent', { required: true })} />
                  <div style={{ ...fieldStyle, color: '#4ade80', fontWeight: 600 }}>
                    {selectedTent}
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Temp (°F)</label>
                  <input type="number" step="0.1" style={fieldStyle} {...register('temperature')} placeholder="75.5" />
                </div>
                <div>
                  <label style={labelStyle}>Humidity (%)</label>
                  <input type="number" step="0.1" style={fieldStyle} {...register('humidity')} placeholder="65.0" />
                </div>
                <div>
                  <label style={labelStyle}>VPD (kPa)</label>
                  <input type="number" step="0.01" style={fieldStyle} {...register('vpd')} placeholder="1.2" />
                </div>
                <div>
                  <label style={labelStyle}>CO₂ (ppm)</label>
                  <input type="number" style={fieldStyle} {...register('co2_ppm')} placeholder="1200" />
                </div>
                <div>
                  <label style={labelStyle}>PPFD</label>
                  <input type="number" style={fieldStyle} {...register('ppfd')} placeholder="800" />
                </div>
                <div>
                  <label style={labelStyle}>pH Level</label>
                  <input type="number" step="0.1" style={fieldStyle} {...register('ph_level')} placeholder="6.5" />
                </div>
                <div>
                  <label style={labelStyle}>Light Hours</label>
                  <input type="number" step="0.1" style={fieldStyle} {...register('light_hours')} placeholder="18.0" />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={labelStyle}>Date & Time</label>
                  <input type="datetime-local" style={fieldStyle} {...register('logged_at')} defaultValue={getCurrentDateTime()} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Notes</label>
                <textarea
                  style={{ ...fieldStyle, resize: 'vertical', minHeight: '60px' }}
                  {...register('notes')}
                  placeholder="Any observations about environmental conditions..."
                  rows={2}
                />
              </div>

              {errors.grow_tent && (
                <span style={{ color: 'var(--error)', fontSize: '0.75rem' }}>{errors.grow_tent.message}</span>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                  {isSubmitting && <div className="loading" />}
                  {editingLog ? 'Update Reading' : 'Add Reading'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Trends — glance charts after latest conditions */}
      {sortedLogsForGraphs.length > 0 && (
        <div className="page-panel">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <TrendingUp className="w-5 h-5" style={{ color: '#4ade80' }} />
                <h2 className="page-panel-title" style={{ margin: 0 }}>Trends</h2>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', margin: 0 }}>
                Click a chart for a larger view
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowWeekly(!showWeekly)}
              className="btn btn-outline flex items-center gap-2"
              style={{ fontSize: '0.8rem', padding: '0.5rem 0.85rem' }}
            >
              {showWeekly ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              Weekly Averages
            </button>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.25rem'
          }}
          >
            {CHARTS.map((chart) => {
              const Icon = chart.Icon;
              return (
                <div
                  key={chart.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedChart(chart.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter') setSelectedChart(chart.id); }}
                  style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    borderRadius: '12px',
                    border: '1px solid rgba(100, 116, 139, 0.25)',
                    padding: '1.1rem 1rem 0.85rem',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s ease, transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${chart.color}66`;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.25)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
                    <Icon className="w-4 h-4" style={{ color: chart.color }} />
                    <h3 style={{ color: '#f8fafc', fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>
                      {chart.label}
                    </h3>
                  </div>
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={sortedLogsForGraphs} margin={{ top: 5, right: 8, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.1)" />
                      <XAxis
                        dataKey="logged_at"
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                        axisLine={{ stroke: 'rgba(100, 116, 139, 0.2)' }}
                        tickFormatter={(value) => format(new Date(value), 'MM/dd')}
                        height={36}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        domain={chart.domain}
                        axisLine={{ stroke: 'rgba(100, 116, 139, 0.2)' }}
                        width={36}
                      />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(15, 23, 42, 0.95)',
                          border: '1px solid rgba(100, 116, 139, 0.3)',
                          borderRadius: '6px',
                          color: '#f8fafc',
                          fontSize: '0.75rem'
                        }}
                        labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy HH:mm')}
                      />
                      <Line
                        type="monotone"
                        dataKey={chart.dataKey}
                        stroke={chart.color}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 3, fill: chart.color }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              );
            })}
          </div>

          {/* Weekly averages (secondary) */}
          {showWeekly && (
          <div style={{ marginTop: '1.25rem', borderTop: '1px solid rgba(100, 116, 139, 0.2)', paddingTop: '1.25rem' }}>
            {weeklyData.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem 0' }}>
                No weekly data available
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {weeklyData.map((week) => (
                  <div
                    key={week.week}
                    style={{
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                      padding: '1rem 1.25rem',
                      background: 'rgba(15, 23, 42, 0.35)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <h3 style={{ color: 'var(--text-primary)', fontWeight: 600, margin: 0, fontSize: '0.95rem' }}>
                        Week of {format(new Date(week.week_start), 'MMM dd, yyyy')}
                      </h3>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        {week.reading_count} readings
                      </span>
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
                      gap: '0.75rem',
                      fontSize: '0.8rem',
                      textAlign: 'center'
                    }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: '#ef4444' }}>
                          {week.avg_temperature != null ? `${Number(week.avg_temperature).toFixed(1)}°F` : 'N/A'}
                        </div>
                        <div style={{ color: 'var(--text-secondary)' }}>Temp</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#3b82f6' }}>
                          {week.avg_humidity != null ? `${Number(week.avg_humidity).toFixed(1)}%` : 'N/A'}
                        </div>
                        <div style={{ color: 'var(--text-secondary)' }}>Humidity</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#22d3ee' }}>
                          {week.avg_vpd != null ? Number(week.avg_vpd).toFixed(2) : 'N/A'}
                        </div>
                        <div style={{ color: 'var(--text-secondary)' }}>VPD</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--primary-color)' }}>
                          {week.avg_ph_level != null ? Number(week.avg_ph_level).toFixed(1) : 'N/A'}
                        </div>
                        <div style={{ color: 'var(--text-secondary)' }}>pH</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#fbbf24' }}>
                          {week.avg_co2 != null ? Math.round(week.avg_co2) : 'N/A'}
                        </div>
                        <div style={{ color: 'var(--text-secondary)' }}>CO₂</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#a78bfa' }}>
                          {week.avg_ppfd != null ? Math.round(week.avg_ppfd) : 'N/A'}
                        </div>
                        <div style={{ color: 'var(--text-secondary)' }}>PPFD</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#fbbf24' }}>
                          {week.avg_light_hours != null ? `${Number(week.avg_light_hours).toFixed(1)}h` : 'N/A'}
                        </div>
                        <div style={{ color: 'var(--text-secondary)' }}>Light</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          )}
        </div>
      )}

      {/* Readings — compact collapsible day browser */}
      <div className="page-panel" style={{ overflow: 'hidden', padding: 0 }}>
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid rgba(100, 116, 139, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}
        >
          <div>
            <h2 className="page-panel-title" style={{ marginBottom: '0.25rem' }}>Readings</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', margin: 0 }}>
              {filteredReadingLogs.length} in view
              {filteredReadingLogs.length !== environmentLogs.length
                ? ` · ${environmentLogs.length} loaded total`
                : ''}
              {' — click a day to expand'}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { id: '7', label: '7d' },
              { id: '30', label: '30d' },
              { id: '90', label: '90d' },
              { id: 'all', label: 'All' }
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setReadingRange(opt.id)}
                className={`btn ${readingRange === opt.id ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.7rem', minWidth: '2.75rem' }}
              >
                {opt.label}
              </button>
            ))}
            {filteredReadingLogs.length > 0 && (
              <button
                type="button"
                className="btn btn-outline"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.7rem' }}
                onClick={() => exportToCSV(filteredReadingLogs)}
              >
                Export
              </button>
            )}
          </div>
        </div>

        {environmentLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <Thermometer className="w-10 h-10" style={{ color: '#f87171', margin: '0 auto 1rem' }} />
            <h3 style={{ color: '#f8fafc', marginBottom: '0.5rem' }}>No readings yet</h3>
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
              Start tracking climate for {selectedTent}.
            </p>
            <button type="button" onClick={openAddForm} className="btn btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add First Reading
            </button>
          </div>
        ) : filteredReadingLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
            <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>
              No readings in the last {readingRange === 'all' ? 'period' : `${readingRange} days`}.
            </p>
            <button type="button" className="btn btn-outline" onClick={() => setReadingRange('all')}>
              Show all loaded readings
            </button>
          </div>
        ) : (
          <>
            {visibleGroups.map((group) => {
              const isOpen = !!expandedDays[group.key];
              const summary = daySummary(group.logs);
              return (
                <div key={group.key} style={{ borderBottom: '1px solid rgba(100, 116, 139, 0.2)' }}>
                  <button
                    type="button"
                    onClick={() => toggleDay(group.key)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.7rem 1.25rem',
                      background: isOpen ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.65)',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'inherit',
                      textAlign: 'left'
                    }}
                  >
                    {isOpen
                      ? <ChevronDown className="w-4 h-4" style={{ color: '#4ade80', flexShrink: 0 }} />
                      : <ChevronRight className="w-4 h-4" style={{ color: '#64748b', flexShrink: 0 }} />}
                    <span style={{
                      color: '#e2e8f0',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      letterSpacing: '0.02em',
                      minWidth: '7.5rem'
                    }}
                    >
                      {group.label}
                    </span>
                    <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
                      {group.logs.length} {group.logs.length === 1 ? 'reading' : 'readings'}
                    </span>
                    {!isOpen && summary && (
                      <span style={{
                        color: '#94a3b8',
                        fontSize: '0.75rem',
                        marginLeft: 'auto',
                        fontWeight: 500
                      }}
                      >
                        {summary}
                      </span>
                    )}
                  </button>

                  {isOpen && group.logs.map((log, index) => (
                    <div
                      key={log.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '52px minmax(0, 1fr) auto',
                        gap: '0.75rem',
                        padding: '0.55rem 1.25rem 0.55rem 2.75rem',
                        borderTop: '1px solid rgba(100, 116, 139, 0.12)',
                        background: index % 2 === 0 ? 'rgba(15, 23, 42, 0.2)' : 'transparent',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>
                        {format(new Date(log.logged_at), 'HH:mm')}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <MetricChips log={log} />
                        {log.notes && (
                          <p style={{
                            color: '#94a3b8',
                            fontSize: '0.75rem',
                            margin: '0.3rem 0 0',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                          title={log.notes}
                          >
                            {log.notes}
                          </p>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          type="button"
                          onClick={() => handleEdit(log)}
                          aria-label="Edit reading"
                          style={{
                            display: 'inline-flex',
                            padding: '0.35rem',
                            background: 'rgba(59, 130, 246, 0.1)',
                            color: '#3b82f6',
                            borderRadius: '6px',
                            border: '1px solid rgba(59, 130, 246, 0.2)',
                            cursor: 'pointer'
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(log.id)}
                          aria-label="Delete reading"
                          style={{
                            display: 'inline-flex',
                            padding: '0.35rem',
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444',
                            borderRadius: '6px',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}

            {groupedLogs.length > visibleDayCount && (
              <div style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setVisibleDayCount((n) => n + 7)}
                >
                  Show older days ({groupedLogs.length - visibleDayCount} more)
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Single chart detail modal */}
      {selectedChart && chartConfig && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedChart(null);
          }}
          role="presentation"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem',
            cursor: 'pointer'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label={`${chartConfig.label} chart`}
            style={{
              background: 'rgba(15, 23, 42, 0.98)',
              border: '1px solid rgba(100, 116, 139, 0.3)',
              borderRadius: '16px',
              padding: '1.5rem',
              width: '100%',
              maxWidth: '900px',
              cursor: 'default'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {ChartIcon && <ChartIcon className="w-6 h-6" style={{ color: chartConfig.color }} />}
                <h2 style={{ color: '#f8fafc', margin: 0, fontSize: '1.25rem' }}>
                  {chartConfig.label}
                </h2>
              </div>
              <button type="button" className="btn btn-outline" onClick={() => setSelectedChart(null)}>
                Close
              </button>
            </div>
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={sortedLogsForGraphs} margin={{ top: 10, right: 20, left: 10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.15)" />
                <XAxis
                  dataKey="logged_at"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickFormatter={(value) => format(new Date(value), 'MMM dd HH:mm')}
                  angle={-35}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  domain={chartConfig.domain}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(100, 116, 139, 0.3)',
                    borderRadius: '6px',
                    color: '#f8fafc'
                  }}
                  labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy HH:mm')}
                  formatter={(value) => [`${value}${chartConfig.unit}`, chartConfig.label]}
                />
                <Line
                  type="monotone"
                  dataKey={chartConfig.dataKey}
                  stroke={chartConfig.color}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: chartConfig.color }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {showImageUpload && (
        <ImageUpload
          onClose={() => setShowImageUpload(false)}
          onDataParsed={handleImageData}
        />
      )}
    </div>
  );
};

export default Environment;
