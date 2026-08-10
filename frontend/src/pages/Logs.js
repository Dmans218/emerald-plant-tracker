import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Plus, Save, X, Droplets, Thermometer, Eye,
  Scissors, Leaf, Bug, FlaskConical, Ruler, Camera,
  Activity, Home, Edit, Trash2, Search, ArrowLeft, Sprout, MoreVertical,
} from 'lucide-react';
import { format, isValid } from 'date-fns';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { createPortal } from 'react-dom';

import { plantsApi, logsApi } from '../utils/api';
import PageHeader from '../components/PageHeader';

const LOG_TYPES = [
  { id: 'watering', label: 'Watering', short: 'Water', icon: Droplets, color: '#60a5fa', fields: ['water_amount', 'ph_level', 'ec_tds', 'notes'] },
  { id: 'feeding', label: 'Nutrient Feeding', short: 'Feed', icon: FlaskConical, color: '#4ade80', fields: ['nutrient_info', 'ph_level', 'ec_tds', 'water_amount', 'notes'] },
  { id: 'environmental', label: 'Environmental Check', short: 'Env', icon: Thermometer, color: '#fbbf24', fields: ['temperature', 'humidity', 'light_intensity', 'co2_level', 'notes'] },
  { id: 'observation', label: 'Plant Observation', short: 'Observe', icon: Eye, color: '#94a3b8', fields: ['height_cm', 'notes'] },
  { id: 'training', label: 'Training/Pruning', short: 'Train', icon: Scissors, color: '#f87171', fields: ['notes'] },
  { id: 'transplant', label: 'Transplant', short: 'Move', icon: Home, color: '#2dd4bf', fields: ['notes'] },
  { id: 'pest_disease', label: 'Pest/Disease', short: 'Pest', icon: Bug, color: '#f87171', fields: ['notes'] },
  { id: 'deficiency', label: 'Nutrient Issue', short: 'Defic.', icon: Leaf, color: '#fb923c', fields: ['notes'] },
  { id: 'measurement', label: 'Growth Measurement', short: 'Measure', icon: Ruler, color: '#34d399', fields: ['height_cm', 'notes'] },
  { id: 'photo', label: 'Photo Documentation', short: 'Photo', icon: Camera, color: '#a78bfa', fields: ['notes'] },
];

const getLogTypeConfig = (type) => {
  const found = LOG_TYPES.find((t) => t.id === type);
  if (found) {
    const Icon = found.icon;
    return { ...found, iconEl: <Icon size={14} strokeWidth={2} /> };
  }
  return {
    id: type,
    label: type || 'Log',
    short: type || 'Log',
    iconEl: <Activity size={14} strokeWidth={2} />,
    color: '#94a3b8',
    fields: ['notes'],
  };
};

const formatLogMetrics = (log) => {
  const parts = [];
  if (log.height_cm != null && log.height_cm !== '') parts.push(`${log.height_cm} cm`);
  if (log.water_amount != null && log.water_amount !== '') parts.push(`${log.water_amount} L`);
  if (log.ph_level != null && log.ph_level !== '') parts.push(`pH ${log.ph_level}`);
  if (log.ec_tds != null && log.ec_tds !== '') parts.push(`${log.ec_tds} ppm`);
  if (log.temperature != null && log.temperature !== '') parts.push(`${log.temperature}°`);
  if (log.humidity != null && log.humidity !== '') parts.push(`${log.humidity}%`);
  if (log.light_intensity != null && log.light_intensity !== '') parts.push(`${log.light_intensity} PPFD`);
  if (log.co2_level != null && log.co2_level !== '') parts.push(`CO₂ ${log.co2_level}`);
  return parts;
};

const safeLogTime = (value) => {
  const d = value ? new Date(value) : null;
  if (!d || !isValid(d)) return '—';
  return format(d, 'HH:mm');
};

const METRIC_FIELD_META = {
  water_amount: { label: 'Water', unit: 'L', type: 'number', step: '0.1' },
  ph_level: { label: 'pH', unit: '', type: 'number', step: '0.1', min: '0', max: '14' },
  ec_tds: { label: 'EC / TDS', unit: 'ppm', type: 'number', step: '1' },
  temperature: { label: 'Temp', unit: '°C', type: 'number', step: '0.1' },
  humidity: { label: 'Humidity', unit: '%', type: 'number', step: '1', min: '0', max: '100' },
  light_intensity: { label: 'Light', unit: 'PPFD', type: 'number', step: '1' },
  co2_level: { label: 'CO₂', unit: 'ppm', type: 'number', step: '1' },
  height_cm: { label: 'Height', unit: 'cm', type: 'number', step: '0.1' },
  nutrient_info: { label: 'Nutrients / mix', unit: '', type: 'text', wide: true },
};

const RECENT_PLANTS_KEY = 'logsRecentPlantIds';
const readRecentPlantIds = () => {
  try {
    const raw = localStorage.getItem(RECENT_PLANTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    const seen = new Set();
    const ids = [];
    parsed.forEach((id) => {
      const s = String(id);
      if (!s || seen.has(s)) return;
      seen.add(s);
      ids.push(s);
    });
    return ids;
  } catch {
    return [];
  }
};

const LogRowMenu = ({ onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = React.useRef(null);
  const menuRef = React.useRef(null);

  React.useLayoutEffect(() => {
    if (!open || !triggerRef.current) return undefined;
    const place = () => {
      const rect = triggerRef.current.getBoundingClientRect();
      const w = 132;
      const h = 96;
      let left = rect.right - w;
      let top = rect.bottom + 4;
      if (left < 8) left = 8;
      if (top + h > window.innerHeight - 8) top = Math.max(8, rect.top - h - 4);
      setCoords({ top, left });
    };
    place();
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [open]);

  React.useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (triggerRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="journal-row-menu-btn"
        aria-label="Log actions"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        <MoreVertical size={15} />
      </button>
      {open && createPortal(
        (
          <div ref={menuRef} className="plants-row-menu-dropdown" style={{ top: coords.top, left: coords.left }} role="menu">
            <button type="button" role="menuitem" onClick={() => { setOpen(false); onEdit(); }}>
              <Edit className="w-4 h-4" /> Edit
            </button>
            <button type="button" role="menuitem" className="is-danger" onClick={() => { setOpen(false); onDelete(); }}>
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        ),
        document.body
      )}
    </>
  );
};

const Logs = () => {
  const [plants, setPlants] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [pickerSearch, setPickerSearch] = useState('');
  const [recentPlantIds, setRecentPlantIds] = useState(readRecentPlantIds);
  const [visibleDayCount, setVisibleDayCount] = useState(7);

  const location = useLocation();
  const navigate = useNavigate();
  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm();

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const plantId = params.get('plantId') || '';
  const typeFromUrl = params.get('type') || '';
  const addFromUrl = params.get('add') === '1';
  const editId = params.get('editId');

  const [selectedType, setSelectedType] = useState(typeFromUrl);

  const selectedPlant = useMemo(
    () => plants.find((p) => String(p.id) === String(plantId)) || null,
    [plants, plantId]
  );

  const activePlants = useMemo(
    () => plants.filter((p) => !p.archived),
    [plants]
  );

  const updateUrl = useCallback((next) => {
    const p = new URLSearchParams();
    if (next.plantId) p.set('plantId', next.plantId);
    if (next.type) p.set('type', next.type);
    if (next.add) p.set('add', '1');
    if (next.editId) p.set('editId', String(next.editId));
    const qs = p.toString();
    navigate(qs ? `/logs?${qs}` : '/logs', { replace: next.replace !== false });
  }, [navigate]);

  const populateForm = useCallback((log) => {
    Object.keys(log).forEach((key) => {
      if (key === 'logged_at') {
        setValue(key, format(new Date(log[key]), "yyyy-MM-dd'T'HH:mm"));
      } else {
        setValue(key, log[key] ?? '');
      }
    });
  }, [setValue]);

  const fetchPlants = useCallback(async () => {
    try {
      const plantsData = await plantsApi.getAll();
      setPlants(Array.isArray(plantsData) ? plantsData : []);
    } catch {
      toast.error('Failed to load plants');
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    if (!plantId) {
      setLogs([]);
      return;
    }
    try {
      const query = { plant_id: plantId, limit: 500 };
      if (selectedType) query.type = selectedType;
      const logsData = await logsApi.getAll(query);
      setLogs(Array.isArray(logsData) ? logsData : []);
    } catch {
      toast.error('Failed to load logs');
      setLogs([]);
    }
  }, [plantId, selectedType]);

  useEffect(() => {
    setVisibleDayCount(7);
  }, [plantId, selectedType, searchTerm, dateFilter]);

  useEffect(() => {
    setSelectedType(typeFromUrl);
  }, [typeFromUrl]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await fetchPlants();
      if (cancelled) return;
      if (plantId) {
        await fetchLogs();
      } else {
        setLogs([]);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [fetchPlants, fetchLogs, plantId]);

  useEffect(() => {
    if (plantId && addFromUrl && !editId) {
      setShowAddForm(true);
      setEditingLog(null);
      reset({
        plant_id: plantId,
        logged_at: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        type: '',
      });
    }
  }, [plantId, addFromUrl, editId, reset]);

  useEffect(() => {
    if (editId && logs.length > 0) {
      const logToEdit = logs.find((log) => log.id === parseInt(editId, 10));
      if (logToEdit) {
        setEditingLog(logToEdit);
        setShowAddForm(true);
        populateForm(logToEdit);
      }
    }
  }, [logs, editId, populateForm]);

  useEffect(() => {
    if (showAddForm && plantId && !editingLog) {
      setValue('plant_id', plantId);
    }
  }, [showAddForm, plantId, editingLog, setValue]);

  const journalPath = (overrides = {}) => {
    updateUrl({
      plantId: overrides.plantId !== undefined ? overrides.plantId : plantId,
      type: overrides.type !== undefined ? overrides.type : selectedType,
      add: overrides.add,
      editId: overrides.editId,
      replace: overrides.replace,
    });
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingLog(null);
    reset();
    journalPath({ add: false, editId: undefined, replace: true });
  };

  const openAddForm = () => {
    setEditingLog(null);
    reset({
      plant_id: plantId,
      logged_at: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      type: '',
    });
    setShowAddForm(true);
    journalPath({ add: true, editId: undefined, replace: false });
  };

  const openEditForm = (log) => {
    setEditingLog(log);
    populateForm(log);
    setShowAddForm(true);
    journalPath({ add: false, editId: log.id, replace: false });
  };

  const onSubmit = async (data) => {
    try {
      const formData = {
        ...data,
        plant_id: parseInt(data.plant_id || plantId, 10),
        logged_at: data.logged_at || new Date().toISOString(),
      };

      if (editingLog) {
        await logsApi.update(editingLog.id, formData);
        toast.success('Log updated');
      } else {
        await logsApi.create(formData);
        toast.success('Log added');
      }

      await fetchLogs();
      handleCancel();
    } catch {
      toast.error(editingLog ? 'Failed to update log' : 'Failed to add log');
    }
  };

  const handleDelete = async (logId) => {
    if (!window.confirm('Delete this log entry?')) return;
    try {
      await logsApi.delete(logId);
      toast.success('Log deleted');
      await fetchLogs();
    } catch {
      toast.error('Failed to delete log');
    }
  };

  const selectPlant = (id) => {
    const idStr = String(id);
    setRecentPlantIds((prev) => {
      const next = [idStr, ...prev.filter((x) => x !== idStr)].slice(0, 8);
      try {
        localStorage.setItem(RECENT_PLANTS_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    navigate(`/logs?plantId=${id}`);
  };

  const changePlant = () => navigate('/logs');

  const handleTypeFilterChange = (value) => {
    setSelectedType(value);
    journalPath({ type: value, add: showAddForm && !editingLog, editId: editingLog?.id, replace: true });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDateFilter('');
    handleTypeFilterChange('');
  };

  const filteredLogs = logs.filter((log) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = !q
      || log.description?.toLowerCase().includes(q)
      || log.notes?.toLowerCase().includes(q)
      || log.nutrient_info?.toLowerCase().includes(q);
    const matchesDate = !dateFilter
      || format(new Date(log.logged_at), 'yyyy-MM-dd') === dateFilter;
    return matchesSearch && matchesDate;
  });

  const groupedLogs = useMemo(() => {
    const groups = [];
    const map = new Map();
    filteredLogs.forEach((log) => {
      const dayKey = format(new Date(log.logged_at), 'yyyy-MM-dd');
      const dayLabel = format(new Date(log.logged_at), 'EEE, MMM d, yyyy');
      if (!map.has(dayKey)) {
        const group = { key: dayKey, label: dayLabel, logs: [] };
        map.set(dayKey, group);
        groups.push(group);
      }
      map.get(dayKey).logs.push(log);
    });
    return groups;
  }, [filteredLogs]);

  const visibleGroups = useMemo(
    () => groupedLogs.slice(0, visibleDayCount),
    [groupedLogs, visibleDayCount]
  );

  const visibleEntryCount = useMemo(
    () => visibleGroups.reduce((n, g) => n + g.logs.length, 0),
    [visibleGroups]
  );

  const olderDayCount = Math.max(0, groupedLogs.length - visibleDayCount);

  const hasFilters = Boolean(searchTerm || selectedType || dateFilter);

  const typeWatch = watch('type');
  const selectedTypeConfig = typeWatch ? getLogTypeConfig(typeWatch) : null;
  const metricFields = (selectedTypeConfig?.fields || []).filter((f) => f !== 'notes');
  const showNotesField = !selectedTypeConfig || selectedTypeConfig.fields.includes('notes');

  if (loading) {
    return (
      <div className="journal-page">
        <div className="flex items-center justify-center min-h-64">
          <div className="loading" />
        </div>
      </div>
    );
  }

  // ——— Plant picker ———
  if (!plantId) {
    const largeGrow = activePlants.length > 8;
    const pickerQuery = pickerSearch.trim().toLowerCase();
    const filteredPickerPlants = !pickerQuery
      ? activePlants
      : activePlants.filter((plant) => (
        plant.name?.toLowerCase().includes(pickerQuery)
          || plant.strain?.toLowerCase().includes(pickerQuery)
          || plant.grow_tent?.toLowerCase().includes(pickerQuery)
          || plant.stage?.toLowerCase().includes(pickerQuery)
      ));

    const recentPlants = [];
    const seenRecent = new Set();
    recentPlantIds.forEach((id) => {
      const plant = activePlants.find((p) => String(p.id) === String(id));
      if (!plant || seenRecent.has(String(plant.id))) return;
      seenRecent.add(String(plant.id));
      recentPlants.push(plant);
    });
    const recentIds = new Set(recentPlants.map((p) => String(p.id)));

    // Don't list the same plant twice (Recent + full list)
    const mainPickerPlants = !pickerQuery
      ? filteredPickerPlants.filter((p) => !recentIds.has(String(p.id)))
      : filteredPickerPlants;

    const pickerGrouped = mainPickerPlants.reduce((groups, plant) => {
      const tent = plant.grow_tent || 'Unassigned';
      if (!groups[tent]) groups[tent] = [];
      groups[tent].push(plant);
      return groups;
    }, {});
    const pickerTentEntries = Object.entries(pickerGrouped).sort(([a], [b]) => a.localeCompare(b));
    // Prefer flat list when few plants remain after Recent
    const useGrouped = largeGrow || (mainPickerPlants.length > 4 && pickerTentEntries.length > 1);

    // Skip "Recent" label noise when it's the entire roster (duplicates the main list)
    const showRecent =
      recentPlants.length > 0
      && !pickerQuery
      && mainPickerPlants.length > 0;

    const renderPickerRow = (plant) => (
      <button key={plant.id} type="button" className="logs-picker-row" onClick={() => selectPlant(plant.id)}>
        <div className="logs-picker-row-icon">
          <Sprout className="w-5 h-5" style={{ color: '#4ade80' }} />
        </div>
        <div className="logs-picker-row-body">
          <div className="logs-picker-row-name">{plant.name}</div>
          <div className="logs-picker-row-meta">
            {[plant.strain || 'Unknown strain', plant.stage, !useGrouped ? plant.grow_tent : null]
              .filter(Boolean)
              .join(' · ')}
          </div>
        </div>
        {plant.log_count != null && (
          <div className="logs-picker-row-side">{plant.log_count} logs</div>
        )}
      </button>
    );

    return (
      <div className="journal-page">
        <PageHeader
          icon={Activity}
          title="Care Journal"
          subtitle="Choose a plant to open its care journal"
        />

        <div className="page-panel journal-picker-panel">
          {activePlants.length === 0 ? (
            <div className="journal-empty">
              <Sprout className="plants-empty-icon" />
              <h3>No active plants</h3>
              <p>Add a plant first, then come back to log care.</p>
              <Link to="/" className="btn btn-primary">Go to Plants</Link>
            </div>
          ) : (
            <>
              {(largeGrow || activePlants.length > 3) && (
                <div className="logs-picker-search plants-search-wrap">
                  <Search className="plants-search-icon" />
                  <input
                    type="text"
                    className="plants-filter-input"
                    placeholder="Search name, strain, or tent…"
                    value={pickerSearch}
                    onChange={(e) => setPickerSearch(e.target.value)}
                    aria-label="Search plants"
                  />
                </div>
              )}

              {showRecent && (
                <div className="logs-picker-section">
                  <h3 className="logs-picker-section-title">Recent</h3>
                  <div className="logs-picker-list">
                    {recentPlants.map(renderPickerRow)}
                  </div>
                </div>
              )}

              {/* Single-plant / only-recent: still show when main is empty but recent has items */}
              {!showRecent && recentPlants.length > 0 && !pickerQuery && mainPickerPlants.length === 0 && (
                <div className="logs-picker-list">
                  {recentPlants.map(renderPickerRow)}
                </div>
              )}

              {mainPickerPlants.length === 0 && filteredPickerPlants.length === 0 ? (
                <div className="journal-empty-inline">No plants match “{pickerSearch}”</div>
              ) : mainPickerPlants.length === 0 ? null : useGrouped ? (
                pickerTentEntries.map(([tentName, tentPlants]) => (
                  <div key={tentName} className="logs-picker-section">
                    <h3 className="logs-picker-section-title">{tentName} · {tentPlants.length}</h3>
                    <div className="logs-picker-list">{tentPlants.map(renderPickerRow)}</div>
                  </div>
                ))
              ) : (
                <div className="logs-picker-list">{mainPickerPlants.map(renderPickerRow)}</div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // ——— Plant journal ———
  return (
    <div className="journal-page">
      <PageHeader
        icon={Activity}
        title={selectedPlant ? selectedPlant.name : 'Care Journal'}
        subtitle={
          selectedPlant
            ? [selectedPlant.strain || 'Unknown strain', selectedPlant.grow_tent, selectedPlant.stage]
              .filter(Boolean)
              .join(' · ')
            : 'Plant care history'
        }
        badge={<span className="journal-header-badge">Journal</span>}
        actions={(
          <div className="journal-header-actions">
            <button type="button" onClick={changePlant} className="btn btn-outline flex items-center gap-1.5 journal-action-change">
              <ArrowLeft className="w-4 h-4" />
              <span className="journal-action-change-label">Change plant</span>
            </button>
            {selectedPlant && (
              <Link to={`/plants/${selectedPlant.id}`} className="btn btn-outline flex items-center gap-1.5">
                Profile
              </Link>
            )}
            {(logs.length > 0 || showAddForm || hasFilters) && (
              <button type="button" onClick={openAddForm} className="btn btn-primary flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                Add log
              </button>
            )}
          </div>
        )}
      />

      {showAddForm && (
        <form className="page-panel journal-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="journal-form-head">
            <div>
              <h2 className="journal-form-title">{editingLog ? 'Edit log' : 'New log'}</h2>
              {selectedPlant && (
                <p className="journal-form-plant">{selectedPlant.name}</p>
              )}
            </div>
            <button type="button" className="journal-form-close" onClick={handleCancel} aria-label="Close">
              <X className="w-4 h-4" />
            </button>
          </div>

          <input type="hidden" {...register('plant_id', { required: true })} />

          <div className="journal-form-section">
            <div className="journal-form-core">
              <div className="plant-detail-field">
                <label htmlFor="log-type">Type *</label>
                <select
                  id="log-type"
                  className="plants-filter-input"
                  {...register('type', { required: 'Required' })}
                >
                  <option value="">Select type…</option>
                  {LOG_TYPES.map((type) => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
                {errors.type && <span className="plants-field-error">{errors.type.message}</span>}
              </div>
              <div className="plant-detail-field">
                <label htmlFor="log-when">When</label>
                <input
                  id="log-when"
                  type="datetime-local"
                  className="plants-filter-input"
                  {...register('logged_at')}
                />
              </div>
              <div className="plant-detail-field journal-form-summary">
                <label htmlFor="log-desc">Summary</label>
                <input
                  id="log-desc"
                  type="text"
                  className="plants-filter-input"
                  {...register('description')}
                  placeholder="Short label (e.g. Week 2 veg feed)"
                />
              </div>
            </div>
          </div>

          {metricFields.length > 0 && (
            <div className="journal-form-section">
              <div className="journal-form-section-label">
                {selectedTypeConfig?.label || 'Details'}
              </div>
              <div className="journal-form-metrics">
                {metricFields.map((fieldKey) => {
                  const meta = METRIC_FIELD_META[fieldKey];
                  if (!meta) return null;
                  const label = meta.unit ? `${meta.label} (${meta.unit})` : meta.label;
                  if (meta.type === 'text' || meta.wide) {
                    return (
                      <div key={fieldKey} className="plant-detail-field journal-form-metric-wide">
                        <label htmlFor={`log-${fieldKey}`}>{label}</label>
                        <input
                          id={`log-${fieldKey}`}
                          type="text"
                          className="plants-filter-input"
                          {...register(fieldKey)}
                          placeholder={fieldKey === 'nutrient_info' ? 'Mix, products, strength…' : ''}
                        />
                      </div>
                    );
                  }
                  return (
                    <div key={fieldKey} className="plant-detail-field">
                      <label htmlFor={`log-${fieldKey}`}>{label}</label>
                      <input
                        id={`log-${fieldKey}`}
                        type="number"
                        step={meta.step}
                        min={meta.min}
                        max={meta.max}
                        className="plants-filter-input"
                        {...register(fieldKey)}
                        inputMode="decimal"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {showNotesField && (
            <div className="journal-form-section">
              <div className="plant-detail-field">
                <label htmlFor="log-notes">Notes</label>
                <textarea
                  id="log-notes"
                  rows={2}
                  className="plants-filter-input plants-textarea journal-form-notes"
                  {...register('notes')}
                  placeholder="Optional observations…"
                />
              </div>
            </div>
          )}

          {!typeWatch && (
            <p className="journal-form-hint">Choose an activity type to show the relevant fields.</p>
          )}

          <div className="journal-form-actions">
            <button type="button" onClick={handleCancel} className="btn btn-outline">Cancel</button>
            <button type="submit" disabled={isSubmitting || !typeWatch} className="btn btn-primary flex items-center gap-1.5">
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Saving…' : (editingLog ? 'Update' : 'Save')}
            </button>
          </div>
        </form>
      )}

      <div className="plants-filters journal-filters">
        <div className="plants-filters-grid">
          <div className="plants-filter-field">
            <label htmlFor="journal-search">Search</label>
            <div className="plants-search-wrap">
              <Search className="plants-search-icon" />
              <input
                id="journal-search"
                type="text"
                className="plants-filter-input"
                placeholder="Notes, description…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="plants-filter-field">
            <label htmlFor="journal-type">Type</label>
            <select
              id="journal-type"
              className="plants-filter-input"
              value={selectedType}
              onChange={(e) => handleTypeFilterChange(e.target.value)}
            >
              <option value="">All types</option>
              {LOG_TYPES.map((type) => (
                <option key={type.id} value={type.id}>{type.label}</option>
              ))}
            </select>
          </div>
          <div className="plants-filter-field">
            <label htmlFor="journal-date">Date</label>
            <input
              id="journal-date"
              type="date"
              className="plants-filter-input"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        </div>
        {logs.length > 0 && (
          <div className="plants-result-summary">
            <span>
              {hasFilters
                ? `${filteredLogs.length} match · ${visibleEntryCount} shown`
                : `${visibleEntryCount} of ${filteredLogs.length} entries · ${Math.min(visibleDayCount, groupedLogs.length)} of ${groupedLogs.length} days`}
            </span>
            {hasFilters && (
              <button type="button" className="plants-clear-filters" onClick={clearFilters}>
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      <div className="page-panel journal-list-panel">
        {filteredLogs.length === 0 ? (
          <div className="journal-empty">
            <Activity className="plants-empty-icon" />
            <h3>{hasFilters ? 'No matching logs' : 'No logs yet'}</h3>
            <p>
              {hasFilters
                ? 'Try adjusting search or filters.'
                : 'Start this plant’s journal with a watering, feeding, or observation.'}
            </p>
            {!hasFilters && (
              <button type="button" onClick={openAddForm} className="btn btn-primary flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                Add first log
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="journal-table-scroll">
              <table className="journal-table">
                <thead>
                  <tr>
                    <th className="journal-th-time">When</th>
                    <th className="journal-th-type">Type</th>
                    <th className="journal-th-data">Data</th>
                    <th className="journal-th-notes">Notes</th>
                    <th className="journal-th-actions" aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {visibleGroups.map((group) => (
                    <React.Fragment key={group.key}>
                      <tr className="journal-day-row">
                        <td colSpan={5}>
                          <div className="journal-day-head-inline">
                            <span className="journal-day-label">{group.label}</span>
                            <span className="journal-day-count">{group.logs.length}</span>
                          </div>
                        </td>
                      </tr>
                      {group.logs.map((log) => {
                        const typeConfig = getLogTypeConfig(log.type);
                        const metrics = formatLogMetrics(log);
                        const primary = log.description || typeConfig.label;
                        const secondary = [
                          log.notes,
                          log.nutrient_info && !log.description?.includes(log.nutrient_info) ? log.nutrient_info : null,
                        ].filter(Boolean).join(' · ');

                        return (
                          <tr key={log.id} className="journal-data-row">
                            <td className="journal-td-time">{safeLogTime(log.logged_at)}</td>
                            <td className="journal-td-type">
                              <span
                                className="journal-type-pill"
                                style={{ color: typeConfig.color, borderColor: `${typeConfig.color}55` }}
                                title={typeConfig.label}
                              >
                                {typeConfig.iconEl}
                                {typeConfig.short}
                              </span>
                            </td>
                            <td className="journal-td-data">
                              <div className="journal-td-primary">{primary}</div>
                              {metrics.length > 0 && (
                                <div className="journal-metrics">{metrics.join(' · ')}</div>
                              )}
                            </td>
                            <td className="journal-td-notes" title={secondary || undefined}>
                              {secondary || <span className="plant-detail-muted">—</span>}
                            </td>
                            <td className="journal-td-actions">
                              <LogRowMenu
                                onEdit={() => openEditForm(log)}
                                onDelete={() => handleDelete(log.id)}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {olderDayCount > 0 && (
              <div className="journal-load-more">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setVisibleDayCount((n) => n + 7)}
                >
                  Show older days ({olderDayCount} more)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Logs;
