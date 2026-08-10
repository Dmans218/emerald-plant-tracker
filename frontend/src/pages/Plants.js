import React, { useState, useEffect, useCallback, useMemo, useRef, useLayoutEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
  Sprout,
  Plus,
  Search,
  SortAsc,
  SortDesc,
  Edit,
  Trash2,
  Archive,
  ArchiveRestore,
  Copy,
  Home,
  Download,
  AlertTriangle,
  LayoutGrid,
  List,
  Thermometer,
  Droplets,
  Wind,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  X,
  CheckSquare,
} from 'lucide-react';
import { formatDistanceToNow, format, parseISO, isValid } from 'date-fns';
import toast from 'react-hot-toast';
import { plantsApi, environmentApi, logsApi } from '../utils/api';
import { formatPlantDate, parsePlantDate, toDateInputValue } from '../utils/dates';
import PageHeader from '../components/PageHeader';
import { useSettings } from '../contexts/SettingsContext';
import { fromCanonicalTemp } from '../utils/temperature';

const VIEW_THRESHOLD = 8;
const COLLAPSE_KEY = 'plantsCollapsedTents';
const VIEW_PREF_KEY = 'plantsViewMode';
const VIEW_EXPLICIT_KEY = 'plantsViewModeExplicit';

const STAGE_OPTIONS = [
  { value: 'seedling', label: 'Seedling' },
  { value: 'vegetative', label: 'Vegetative' },
  { value: 'flowering', label: 'Flowering' },
  { value: 'harvest', label: 'Harvest' },
  { value: 'drying', label: 'Drying' },
  { value: 'curing', label: 'Curing' },
  { value: 'cured', label: 'Cured' },
];

const readViewPreference = () => {
  try {
    // Only honor preference after an explicit Cards/Table click (avoids old auto-save locking everyone to cards)
    if (localStorage.getItem(VIEW_EXPLICIT_KEY) !== '1') return null;
    const saved = localStorage.getItem(VIEW_PREF_KEY);
    return saved === 'table' || saved === 'cards' ? saved : null;
  } catch {
    return null;
  }
};

const readCollapsedTents = () => {
  try {
    const raw = sessionStorage.getItem(COLLAPSE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const formatLastLog = (value) => {
  if (!value) return null;
  try {
    const date = typeof value === 'string' ? parseISO(value) : new Date(value);
    if (!isValid(date)) return null;
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return null;
  }
};

const TentEnvGlance = ({ reading }) => {
  const { temperatureUnit } = useSettings();

  if (!reading) {
    return (
      <span className="plants-env-muted">No climate data</span>
    );
  }

  const metrics = [
    { key: 't', value: reading.temperature != null ? `${fromCanonicalTemp(reading.temperature, temperatureUnit).toFixed(1)}°${temperatureUnit}` : null, color: '#f87171', Icon: Thermometer },
    { key: 'h', value: reading.humidity != null ? `${reading.humidity}%` : null, color: '#60a5fa', Icon: Droplets },
    { key: 'v', value: reading.vpd != null ? `${reading.vpd} kPa` : null, color: '#22d3ee', Icon: Wind },
    { key: 'c', value: reading.co2_ppm != null ? `${reading.co2_ppm} ppm` : null, color: '#fbbf24', Icon: Wind },
  ].filter((m) => m.value != null);

  if (metrics.length === 0) return null;

  return (
    <span className="plants-env-glance">
      {metrics.map(({ key, value, color, Icon }) => (
        <span key={key} className="plants-env-metric" style={{ color }}>
          <Icon className="w-4 h-4" style={{ width: '0.85rem', height: '0.85rem' }} />
          {value}
        </span>
      ))}
    </span>
  );
};

const PlantRowMenu = ({ plant, onClone, onEdit, onArchive, onDelete }) => {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return undefined;

    const place = () => {
      const rect = triggerRef.current.getBoundingClientRect();
      const menuWidth = 168;
      const menuHeight = plant.archived ? 132 : 176;
      const pad = 8;
      let left = rect.right - menuWidth;
      let top = rect.bottom + 4;
      if (left < pad) left = pad;
      if (left + menuWidth > window.innerWidth - pad) {
        left = Math.max(pad, window.innerWidth - menuWidth - pad);
      }
      if (top + menuHeight > window.innerHeight - pad) {
        top = Math.max(pad, rect.top - menuHeight - 4);
      }
      setCoords({ top, left });
    };

    place();
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [open, plant.archived]);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      const t = e.target;
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const menu = open
    ? createPortal(
      (
        <div
          ref={menuRef}
          className="plants-row-menu-dropdown"
          role="menu"
          style={{ top: coords.top, left: coords.left }}
        >
          {!plant.archived && (
            <button type="button" role="menuitem" onClick={() => { setOpen(false); onClone(plant); }}>
              <Copy className="w-4 h-4" /> Clone
            </button>
          )}
          <button type="button" role="menuitem" onClick={() => { setOpen(false); onEdit(plant); }}>
            <Edit className="w-4 h-4" /> Edit
          </button>
          <button type="button" role="menuitem" onClick={() => { setOpen(false); onArchive(plant); }}>
            {plant.archived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
            {plant.archived ? 'Restore' : 'Archive'}
          </button>
          <button
            type="button"
            role="menuitem"
            className="is-danger"
            onClick={() => { setOpen(false); onDelete(plant); }}
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      ),
      document.body
    )
    : null;

  return (
    <div className="plants-row-menu" onClick={(e) => e.stopPropagation()}>
      <button
        ref={triggerRef}
        type="button"
        className={`plants-row-menu-trigger ${open ? 'is-open' : ''}`}
        title="Actions"
        aria-label="Plant actions"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
      >
        <MoreVertical size={16} strokeWidth={2} />
      </button>
      {menu}
    </div>
  );
};

const Plants = () => {
  const navigate = useNavigate();
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlant, setEditingPlant] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState('');
  const [filterTent, setFilterTent] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showArchived, setShowArchived] = useState(false);
  const [viewPreference, setViewPreference] = useState(readViewPreference);
  const [viewMode, setViewMode] = useState(() => readViewPreference() || 'cards');
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [plantToArchive, setPlantToArchive] = useState(null);
  const [latestByTent, setLatestByTent] = useState({});
  const [collapsedTents, setCollapsedTents] = useState(readCollapsedTents);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [showBulkLog, setShowBulkLog] = useState(false);
  const [bulkStage, setBulkStage] = useState('');
  const [bulkTent, setBulkTent] = useState('');

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const setUserViewMode = (mode) => {
    setViewPreference(mode);
    setViewMode(mode);
    try {
      localStorage.setItem(VIEW_PREF_KEY, mode);
      localStorage.setItem(VIEW_EXPLICIT_KEY, '1');
    } catch {
      // ignore
    }
    if (mode !== 'table') {
      setSelectMode(false);
      setSelectedIds(new Set());
    }
  };

  useEffect(() => {
    try {
      sessionStorage.setItem(COLLAPSE_KEY, JSON.stringify(collapsedTents));
    } catch {
      // ignore
    }
  }, [collapsedTents]);

  const fetchLatestEnv = useCallback(async () => {
    try {
      const rows = await environmentApi.getLatestPerTent();
      const map = {};
      (Array.isArray(rows) ? rows : []).forEach((row) => {
        if (row.grow_tent) map[row.grow_tent] = row;
      });
      setLatestByTent(map);
    } catch {
      setLatestByTent({});
    }
  }, []);

  const fetchPlants = useCallback(async () => {
    try {
      setLoading(true);
      setPlants([]);

      if (showArchived) {
        const archivedData = await plantsApi.getArchivedGrows();
        const transformedData = archivedData.map((grow) => ({
          id: grow.id,
          name: grow.plant_name,
          strain: grow.strain,
          stage: grow.final_stage,
          planted_date: grow.planted_date,
          expected_harvest: null,
          harvest_date: grow.harvest_date,
          notes: grow.notes || '',
          grow_tent: grow.grow_tent,
          archived: true,
          archived_at: grow.archived_at,
          archive_reason: grow.archive_reason,
          final_yield: grow.final_yield,
          log_count: grow.total_logs,
          last_log_date: null,
          created_at: grow.archived_at,
          updated_at: grow.archived_at,
        }));
        setPlants(transformedData);
      } else {
        const plantsData = await plantsApi.getAll();
        setPlants(Array.isArray(plantsData) ? plantsData : []);
      }
      await fetchLatestEnv();
    } catch {
      toast.error('Failed to load plants');
    } finally {
      setLoading(false);
    }
  }, [showArchived, fetchLatestEnv]);

  useEffect(() => {
    fetchPlants();
  }, [fetchPlants]);

  // Adaptive default when user has not saved a preference (cards on phones)
  useEffect(() => {
    if (viewPreference || loading) return;
    const narrow =
      typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
    if (narrow) {
      setViewMode('cards');
      return;
    }
    setViewMode(plants.length >= VIEW_THRESHOLD ? 'table' : 'cards');
  }, [plants.length, loading, viewPreference]);

  // Phones always use cards (table control is hidden); restore preference on wider screens
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const mq = window.matchMedia('(max-width: 768px)');
    const apply = () => {
      if (mq.matches) {
        setViewMode('cards');
        setSelectMode(false);
        setSelectedIds(new Set());
      } else if (viewPreference) {
        setViewMode(viewPreference);
      }
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [viewPreference]);

  useEffect(() => {
    setSelectedIds(new Set());
    setSelectMode(false);
    setBulkStage('');
    setBulkTent('');
  }, [showArchived, searchTerm, filterStage, filterTent]);

  const onSubmit = async (data) => {
    try {
      if (editingPlant) {
        await plantsApi.update(editingPlant.id, data);
        toast.success('Plant updated successfully');
      } else {
        await plantsApi.create(data);
        toast.success('Plant added successfully');
      }
      fetchPlants();
      resetForm();
    } catch {
      toast.error('Failed to save plant');
    }
  };

  const handleEdit = (plant) => {
    setEditingPlant(plant);
    setShowForm(true);
    reset({
      name: plant.name || '',
      strain: plant.strain || '',
      stage: plant.stage || 'seedling',
      grow_tent: plant.grow_tent || '',
      planted_date: toDateInputValue(plant.planted_date),
      expected_harvest: toDateInputValue(plant.expected_harvest),
      notes: plant.notes || '',
    });
  };

  const handleClone = (plant) => {
    if (window.confirm(`Clone "${plant.name}"? This will create a copy with the same details.`)) {
      setEditingPlant(null);
      setShowForm(true);
      reset({
        name: `${plant.name} (Clone)`,
        strain: plant.strain || '',
        stage: 'seedling',
        grow_tent: plant.grow_tent || '',
        planted_date: '',
        expected_harvest: '',
        notes: plant.notes || '',
      });
    }
  };

  const handleDelete = async (plant) => {
    if (window.confirm(`Are you sure you want to delete "${plant.name}"? This will also delete all associated logs.`)) {
      try {
        await plantsApi.delete(plant.id);
        toast.success('Plant deleted successfully');
        fetchPlants();
      } catch {
        toast.error('Failed to delete plant');
      }
    }
  };

  const handleArchive = async (plant, archiveData = null) => {
    if (archiveData) {
      try {
        await plantsApi.archive(plant.id, archiveData);
        toast.success('Plant archived successfully with environment data');
        fetchPlants();
        setShowArchiveModal(false);
        setPlantToArchive(null);
      } catch (error) {
        toast.error('Failed to archive plant: ' + error.message);
      }
    } else {
      const action = plant.archived ? 'unarchive' : 'archive';
      if (window.confirm(`Are you sure you want to ${action} "${plant.name}"?`)) {
        try {
          if (plant.archived) {
            await plantsApi.unarchive(plant.id);
            toast.success(`Plant "${plant.name}" restored successfully`);
          } else {
            await plantsApi.archive(plant.id, { reason: 'manual' });
            toast.success(`Plant ${action}d successfully`);
          }
          fetchPlants();
        } catch (error) {
          toast.error(`Failed to ${action} plant: ${error.message || 'Unknown error'}`);
        }
      }
    }
  };

  const openArchiveModal = (plant) => {
    setPlantToArchive(plant);
    setShowArchiveModal(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingPlant(null);
    reset();
  };

  const handleExportTent = async (tentName) => {
    try {
      const blob = await plantsApi.exportArchivedTent(tentName);
      const url = window.URL.createObjectURL(blob instanceof Blob ? blob : new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${tentName}_complete_data_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`${tentName} data exported successfully`);
    } catch {
      toast.error('Failed to export tent data');
    }
  };

  const handleClearTentData = async (tentName) => {
    const activePlantsInTent = plants.filter((plant) => !plant.archived && plant.grow_tent === tentName);

    if (activePlantsInTent.length > 0) {
      toast.error(`Cannot clear data: ${activePlantsInTent.length} active plants in ${tentName}`);
      return;
    }

    const confirmed = window.confirm(
      `WARNING: This will permanently delete all environment data for "${tentName}" tent.\n\n` +
        `This action cannot be undone. Make sure you have exported the data first.\n\n` +
        `Are you sure you want to proceed?`
    );
    if (!confirmed) return;

    const doubleConfirmed = window.confirm(
      `FINAL CONFIRMATION\n\n` +
        `You are about to permanently delete all environment data for "${tentName}".\n\n` +
        `Click OK to confirm.`
    );
    if (!doubleConfirmed) return;

    try {
      await plantsApi.clearTentEnvironmentData(tentName, true);
      toast.success(`${tentName} environment data cleared successfully`);
    } catch (error) {
      toast.error(error.message || 'Failed to clear tent data');
    }
  };

  const getStageIcon = (stage) => {
    switch (stage) {
      case 'seedling': return '🌱';
      case 'vegetative': return '🌿';
      case 'flowering': return '🌸';
      case 'drying': return '🌾';
      case 'curing': return '📦';
      case 'harvest': return '✂️';
      case 'cured': return '🏆';
      default: return '🌱';
    }
  };

  const getStageColor = (stage) => {
    const map = {
      seedling: { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: 'rgba(34, 197, 94, 0.2)' },
      vegetative: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'rgba(59, 130, 246, 0.2)' },
      flowering: { bg: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', border: 'rgba(168, 85, 247, 0.2)' },
      drying: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.2)' },
      curing: { bg: 'rgba(161, 98, 7, 0.1)', color: '#a16207', border: 'rgba(161, 98, 7, 0.2)' },
      harvest: { bg: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24', border: 'rgba(251, 191, 36, 0.2)' },
      cured: { bg: 'rgba(100, 116, 139, 0.1)', color: '#64748b', border: 'rgba(100, 116, 139, 0.2)' },
    };
    return map[stage] || map.cured;
  };

  const statusPlants = useMemo(
    () => plants.filter((p) => (showArchived ? p.archived : !p.archived)),
    [plants, showArchived]
  );

  const availableTents = useMemo(() => {
    const set = new Set();
    statusPlants.forEach((p) => set.add(p.grow_tent || 'Unassigned'));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [statusPlants]);

  const showTentFilter = availableTents.length > 1;

  const filteredPlants = useMemo(() => {
    let filtered = statusPlants.filter((plant) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !q ||
        plant.name.toLowerCase().includes(q) ||
        (plant.strain && plant.strain.toLowerCase().includes(q)) ||
        (plant.grow_tent && plant.grow_tent.toLowerCase().includes(q));
      const matchesStage = !filterStage || plant.stage === filterStage;
      const tentKey = plant.grow_tent || 'Unassigned';
      const matchesTent = !filterTent || tentKey === filterTent;
      return matchesSearch && matchesStage && matchesTent;
    });

    filtered = [...filtered].sort((a, b) => {
      let aValue = a[sortBy] || '';
      let bValue = b[sortBy] || '';

      if (sortBy === 'planted_date' || sortBy === 'expected_harvest' || sortBy === 'last_log_date') {
        aValue = aValue ? new Date(aValue) : new Date(0);
        bValue = bValue ? new Date(bValue) : new Date(0);
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue || '').toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    });

    return filtered;
  }, [statusPlants, searchTerm, filterStage, filterTent, sortBy, sortDirection]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStage('');
    setFilterTent('');
  };

  const hasActiveFilters = Boolean(searchTerm || filterStage || filterTent);
  const showResultSummary = hasActiveFilters || statusPlants.length > VIEW_THRESHOLD;
  const longList = filteredPlants.length > VIEW_THRESHOLD || statusPlants.length > VIEW_THRESHOLD;

  const groupedPlants = useMemo(() => {
    return filteredPlants.reduce((groups, plant) => {
      const tent = plant.grow_tent || 'Unassigned';
      if (!groups[tent]) groups[tent] = [];
      groups[tent].push(plant);
      return groups;
    }, {});
  }, [filteredPlants]);

  const tentEntries = useMemo(() => Object.entries(groupedPlants), [groupedPlants]);
  const tentCount = tentEntries.length;
  const allowCollapse = tentCount > 2 || filteredPlants.length > VIEW_THRESHOLD;

  const toggleTentCollapsed = (tentName) => {
    if (!allowCollapse) return;
    setCollapsedTents((prev) => ({
      ...prev,
      [tentName]: !prev[tentName],
    }));
  };

  const isTentCollapsed = (tentName) => {
    if (!allowCollapse) return false;
    return Boolean(collapsedTents[tentName]);
  };

  const toggleSelectPlant = (id, e) => {
    e?.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllVisible = () => {
    setSelectedIds(new Set(filteredPlants.map((p) => p.id)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const selectedPlants = useMemo(
    () => filteredPlants.filter((p) => selectedIds.has(p.id)),
    [filteredPlants, selectedIds]
  );

  const allVisibleSelected =
    filteredPlants.length > 0 && filteredPlants.every((p) => selectedIds.has(p.id));

  const runBulk = async (label, fn) => {
    if (selectedPlants.length === 0) return;
    setBulkBusy(true);
    let ok = 0;
    let fail = 0;
    for (const plant of selectedPlants) {
      try {
        await fn(plant);
        ok += 1;
      } catch {
        fail += 1;
      }
    }
    setBulkBusy(false);
    if (fail === 0) toast.success(`${label}: ${ok} plant${ok !== 1 ? 's' : ''}`);
    else toast.error(`${label}: ${ok} ok, ${fail} failed`);
    clearSelection();
    setSelectMode(false);
    await fetchPlants();
  };

  const handleBulkStage = async () => {
    if (!bulkStage) {
      toast.error('Choose a stage');
      return;
    }
    await runBulk('Stage updated', (plant) =>
      plantsApi.update(plant.id, { stage: bulkStage })
    );
    setBulkStage('');
  };

  const handleBulkTent = async () => {
    if (!bulkTent.trim()) {
      toast.error('Enter a tent name');
      return;
    }
    const tent = bulkTent.trim();
    await runBulk('Moved to tent', (plant) =>
      plantsApi.update(plant.id, {
        grow_tent: tent === 'Unassigned' ? '' : tent,
      })
    );
    setBulkTent('');
  };

  const handleBulkArchive = async () => {
    if (showArchived) return;
    if (!window.confirm(`Archive ${selectedPlants.length} selected plant(s)?`)) return;
    await runBulk('Archived', (plant) => plantsApi.archive(plant.id, { reason: 'manual' }));
  };

  const handleBulkLog = async (data) => {
    setBulkBusy(true);
    let ok = 0;
    let fail = 0;
    for (const plant of selectedPlants) {
      try {
        await logsApi.create({
          plant_id: plant.id,
          type: data.type,
          water_amount: data.water_amount !== '' && data.water_amount != null ? Number(data.water_amount) : null,
          ph_level: data.ph_level !== '' && data.ph_level != null ? Number(data.ph_level) : null,
          ec_tds: data.ec_tds !== '' && data.ec_tds != null ? Number(data.ec_tds) : null,
          nutrient_info: data.nutrient_info || null,
          notes: data.notes || null,
          logged_at: data.logged_at || new Date().toISOString(),
        });
        ok += 1;
      } catch {
        fail += 1;
      }
    }
    setBulkBusy(false);
    setShowBulkLog(false);
    if (fail === 0) toast.success(`Logged care on ${ok} plant${ok !== 1 ? 's' : ''}`);
    else toast.error(`Logs: ${ok} ok, ${fail} failed`);
    clearSelection();
    setSelectMode(false);
    await fetchPlants();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="loading" />
      </div>
    );
  }

  const renderTentHeader = (tentName, count) => {
    const collapsed = isTentCollapsed(tentName);
    return (
      <div className={`grow-tent-header ${viewMode === 'table' ? 'is-table' : ''}`}>
        <div className="grow-tent-header-row">
          <div className="grow-tent-header-main">
            {allowCollapse ? (
              <button
                type="button"
                className="plants-tent-toggle"
                onClick={() => toggleTentCollapsed(tentName)}
                aria-expanded={!collapsed}
                title={collapsed ? 'Expand tent' : 'Collapse tent'}
              >
                {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            ) : (
              <Home className="w-4 h-4 plants-tent-home-icon" />
            )}
            <h3 className="page-panel-title" style={{ margin: 0 }}>{tentName}</h3>
            <span className="grow-tent-count">
              {count} plant{count !== 1 ? 's' : ''}
            </span>
            {tentName !== 'Unassigned' && !showArchived && (
              <TentEnvGlance reading={latestByTent[tentName]} />
            )}
          </div>

          <div className="flex items-center gap-2">
            {tentName !== 'Unassigned' && (
              <Link
                to={`/environment?tent=${encodeURIComponent(tentName)}`}
                className="btn btn-outline flex items-center gap-2 plants-tent-action"
              >
                <Thermometer className="w-4 h-4" />
                Environment
              </Link>
            )}

            {showArchived && (
              <>
                <button
                  type="button"
                  onClick={() => handleExportTent(tentName)}
                  className="btn btn-outline flex items-center gap-2 plants-tent-action"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button
                  type="button"
                  onClick={() => handleClearTentData(tentName)}
                  className="btn btn-outline flex items-center gap-2 plants-tent-action plants-tent-action-danger"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Clear
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderPlantActions = (plant) => (
    <div className="flex" style={{ gap: '0.35rem' }}>
      {!plant.archived && (
        <button
          type="button"
          onClick={() => handleClone(plant)}
          className="btn btn-secondary btn-sm"
          title="Clone Plant"
        >
          <Copy className="w-3 h-3" />
        </button>
      )}
      <button
        type="button"
        onClick={() => handleEdit(plant)}
        className="btn btn-secondary btn-sm"
        title="Edit Plant"
      >
        <Edit className="w-3 h-3" />
      </button>
      <button
        type="button"
        onClick={() => (plant.archived ? handleArchive(plant) : openArchiveModal(plant))}
        className="btn btn-outline btn-sm"
        title={plant.archived ? 'Unarchive Plant' : 'Archive Plant'}
      >
        {plant.archived ? <ArchiveRestore className="w-3 h-3" /> : <Archive className="w-3 h-3" />}
      </button>
      <button
        type="button"
        onClick={() => handleDelete(plant)}
        className="btn btn-danger btn-sm"
        title="Delete Plant"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );

  const renderPlantCard = (plant) => (
    <div key={plant.id} className="plant-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <Link to={`/plants/${plant.id}`} className="plant-name">
            {plant.name}
          </Link>
          <p className="plant-strain">{plant.strain || 'Unknown strain'}</p>
        </div>
        <span className={`stage-badge stage-${plant.stage}`}>
          {getStageIcon(plant.stage)} {plant.stage}
        </span>
      </div>

      {plant.notes && <p className="plant-notes">{plant.notes}</p>}

      <div className="plant-meta">
        {plant.planted_date && parsePlantDate(plant.planted_date) && (
          <div className="plant-meta-item">
            <span>
              Planted {formatPlantDate(plant.planted_date)}
              {' · '}
              {formatDistanceToNow(parsePlantDate(plant.planted_date))} ago
            </span>
          </div>
        )}
        {!plant.archived && formatPlantDate(plant.expected_harvest) && (
          <div className="plant-meta-item">
            <span>Harvest {formatPlantDate(plant.expected_harvest)}</span>
          </div>
        )}
        {!!plant.archived && formatPlantDate(plant.harvest_date) && (
          <div className="plant-meta-item">
            <span>Harvested {formatPlantDate(plant.harvest_date)}</span>
          </div>
        )}
        {!!plant.archived && plant.final_yield != null && plant.final_yield !== '' && (
          <div className="plant-meta-item">
            <span>Yield {plant.final_yield}g</span>
          </div>
        )}
        <div className="plant-meta-item">
          <Sprout className="w-4 h-4" />
          <span>{plant.log_count || 0} activity logs</span>
        </div>
        {formatLastLog(plant.last_log_date) && (
          <div className="plant-meta-item">
            <span>Last log {formatLastLog(plant.last_log_date)}</span>
          </div>
        )}
      </div>

      <div className="plant-actions">
        <Link to={`/plants/${plant.id}`} className="plant-link">
          View Details →
        </Link>
        {renderPlantActions(plant)}
      </div>
    </div>
  );

  const renderPlantTableRow = (plant, index, total) => {
    const stage = getStageColor(plant.stage);
    const harvestValue = plant.archived ? plant.harvest_date : plant.expected_harvest;
    const lastLog = formatLastLog(plant.last_log_date);

    return (
      <tr
        key={plant.id}
        className={`plants-table-row ${index % 2 === 0 ? 'is-even' : ''} ${index < total - 1 ? 'has-border' : ''}`}
        onClick={() => navigate(`/plants/${plant.id}`)}
      >
        {selectMode && !showArchived && (
          <td className="plants-td plants-td-check" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={selectedIds.has(plant.id)}
              onChange={(e) => toggleSelectPlant(plant.id, e)}
              aria-label={`Select ${plant.name}`}
            />
          </td>
        )}
        <td className="plants-td plants-td-plant">
          <div className="plants-table-plant">
            <span className="plants-table-name" title={plant.name}>{plant.name}</span>
            <span className="plants-table-meta" title={plant.strain || 'Unknown strain'}>
              {plant.strain || 'Unknown strain'}
            </span>
          </div>
        </td>
        <td className="plants-td">
          <span
            className="plants-stage-pill"
            style={{ background: stage.bg, color: stage.color, borderColor: stage.border }}
          >
            {getStageIcon(plant.stage)} {plant.stage}
          </span>
        </td>
        <td className="plants-td plants-td-muted">
          {parsePlantDate(plant.planted_date) ? formatPlantDate(plant.planted_date) : '—'}
        </td>
        <td className="plants-td plants-td-muted">
          {formatPlantDate(harvestValue) || '—'}
          {!!plant.archived && plant.final_yield != null && plant.final_yield !== '' && (
            <div className="plants-table-sub">{plant.final_yield}g</div>
          )}
        </td>
        <td className="plants-td" onClick={(e) => e.stopPropagation()}>
          <Link to={`/logs?plantId=${plant.id}`} className="plants-logs-chip" title="View activity logs">
            <Sprout style={{ width: '12px', height: '12px' }} />
            <span>{plant.log_count || 0}</span>
          </Link>
        </td>
        <td className="plants-td plants-td-muted plants-td-nowrap">
          {lastLog || '—'}
        </td>
        <td className="plants-td plants-td-notes">
          <span title={plant.notes || ''} className={plant.notes ? '' : 'is-empty'}>
            {plant.notes || '—'}
          </span>
        </td>
        <td className="plants-td plants-td-actions" onClick={(e) => e.stopPropagation()}>
          <PlantRowMenu
            plant={plant}
            onClone={handleClone}
            onEdit={handleEdit}
            onArchive={(p) => (p.archived ? handleArchive(p) : openArchiveModal(p))}
            onDelete={handleDelete}
          />
        </td>
      </tr>
    );
  };

  const pageClass = `dashboard-page plants-page ${viewMode === 'table' ? 'is-table-mode' : ''}`;

  return (
    <div className={pageClass}>
      <PageHeader
        icon={Sprout}
        title="Plants"
        subtitle="Track and manage your cannabis cultivation"
        badge={showArchived ? <span className="plants-status-badge">Archived</span> : null}
        actions={(
          <div className="plants-toolbar">
            <div className="plants-segment" role="group" aria-label="Plant status">
              <button
                type="button"
                className={`plants-segment-btn ${!showArchived ? 'is-active' : ''}`}
                onClick={() => {
                  if (showArchived) {
                    setLoading(true);
                    setPlants([]);
                    setShowArchived(false);
                  }
                }}
              >
                Active
              </button>
              <button
                type="button"
                className={`plants-segment-btn ${showArchived ? 'is-active is-archived' : ''}`}
                onClick={() => {
                  if (!showArchived) {
                    setLoading(true);
                    setPlants([]);
                    setShowArchived(true);
                  }
                }}
              >
                Archived
              </button>
            </div>

            <div className="plants-segment plants-view-toggle" role="group" aria-label="View mode">
              <button
                type="button"
                className={`plants-segment-btn ${viewMode === 'cards' ? 'is-active' : ''}`}
                onClick={() => setUserViewMode('cards')}
                title="Card view"
              >
                <LayoutGrid className="w-4 h-4" />
                Cards
              </button>
              <button
                type="button"
                className={`plants-segment-btn ${viewMode === 'table' ? 'is-active' : ''}`}
                onClick={() => setUserViewMode('table')}
                title="Table view"
              >
                <List className="w-4 h-4" />
                Table
              </button>
            </div>

            {viewMode === 'table' && !showArchived && filteredPlants.length > 0 && (
              <button
                type="button"
                className={`btn btn-outline flex items-center gap-2 ${selectMode ? 'plants-select-active' : ''}`}
                onClick={() => {
                  if (selectMode) {
                    setSelectMode(false);
                    clearSelection();
                  } else {
                    setSelectMode(true);
                  }
                }}
              >
                <CheckSquare className="w-4 h-4" />
                {selectMode ? 'Done' : 'Select'}
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Plant
            </button>
          </div>
        )}
      />

      <div className={`plants-filters ${longList ? 'is-sticky' : ''}`}>
        <div className={`plants-filters-grid ${showTentFilter ? 'has-tent' : ''}`}>
          <div className="plants-filter-field">
            <label htmlFor="plants-search">Search</label>
            <div className="plants-search-wrap">
              <Search className="plants-search-icon" />
              <input
                id="plants-search"
                type="text"
                className="plants-filter-input"
                placeholder="Name, strain, or tent..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="plants-filter-field">
            <label htmlFor="plants-stage">Growth stage</label>
            <select
              id="plants-stage"
              className="plants-filter-input"
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
            >
              <option value="">All stages</option>
              {STAGE_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {showTentFilter && (
            <div className="plants-filter-field">
              <label htmlFor="plants-tent">Tent</label>
              <select
                id="plants-tent"
                className="plants-filter-input"
                value={filterTent}
                onChange={(e) => setFilterTent(e.target.value)}
              >
                <option value="">All tents</option>
                {availableTents.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          )}

          <div className="plants-filter-field">
            <label htmlFor="plants-sort">Sort by</label>
            <div className="plants-sort-row">
              <select
                id="plants-sort"
                className="plants-filter-input"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Name</option>
                <option value="strain">Strain</option>
                <option value="stage">Stage</option>
                <option value="grow_tent">Tent</option>
                <option value="planted_date">Planted date</option>
                <option value="expected_harvest">Expected harvest</option>
                <option value="last_log_date">Last log</option>
              </select>
              <button
                type="button"
                className="plants-sort-dir"
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                title={`Sort ${sortDirection === 'asc' ? 'ascending' : 'descending'}`}
              >
                {sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {showResultSummary && statusPlants.length > 0 && (
          <div className="plants-result-summary">
            <span>
              Showing {filteredPlants.length} of {statusPlants.length}
              {hasActiveFilters ? ' (filtered)' : ''}
            </span>
            {hasActiveFilters && (
              <button type="button" className="plants-clear-filters" onClick={clearFilters}>
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {selectMode && selectedIds.size > 0 && !showArchived && (
        <div className="plants-bulk-bar">
          <div className="plants-bulk-count">
            {selectedIds.size} selected
            <button type="button" className="plants-clear-filters" onClick={selectAllVisible} disabled={allVisibleSelected}>
              Select all visible
            </button>
            <button type="button" className="plants-clear-filters" onClick={clearSelection}>
              Clear
            </button>
          </div>
          <div className="plants-bulk-actions">
            <div className="plants-bulk-group">
              <select
                className="plants-filter-input"
                value={bulkStage}
                onChange={(e) => setBulkStage(e.target.value)}
                aria-label="Bulk stage"
              >
                <option value="">Set stage…</option>
                {STAGE_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <button type="button" className="btn btn-secondary btn-sm" disabled={bulkBusy || !bulkStage} onClick={handleBulkStage}>
                Apply
              </button>
            </div>
            <div className="plants-bulk-group">
              <input
                type="text"
                className="plants-filter-input"
                placeholder="Move to tent…"
                value={bulkTent}
                onChange={(e) => setBulkTent(e.target.value)}
                list="plants-bulk-tent-list"
              />
              <datalist id="plants-bulk-tent-list">
                {availableTents.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
              <button type="button" className="btn btn-secondary btn-sm" disabled={bulkBusy || !bulkTent.trim()} onClick={handleBulkTent}>
                Move
              </button>
            </div>
            <button type="button" className="btn btn-outline btn-sm" disabled={bulkBusy} onClick={() => setShowBulkLog(true)}>
              Log care
            </button>
            <button type="button" className="btn btn-outline btn-sm" disabled={bulkBusy} onClick={handleBulkArchive}>
              Archive
            </button>
          </div>
        </div>
      )}

      {plants.length === 0 ? (
        <div className="plants-empty">
          <Sprout className="plants-empty-icon" />
          <h3>{showArchived ? 'No archived plants yet' : 'No plants yet'}</h3>
          <p>
            {showArchived
              ? 'When you archive plants, they will appear here with their grow data'
              : 'Start your cultivation journey by adding your first plant'}
          </p>
          {!showArchived && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Plant
            </button>
          )}
        </div>
      ) : filteredPlants.length === 0 ? (
        <div className="plants-empty">
          <Search className="plants-empty-icon" />
          <h3>No plants match your filters</h3>
          <p>Try adjusting search, stage, or tent, or clear filters to see all plants.</p>
          <button type="button" onClick={clearFilters} className="btn btn-outline">
            Clear filters
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="plants-list-stack">
          {tentEntries.map(([tentName, tentPlants]) => (
            <div key={tentName} className="page-panel">
              {renderTentHeader(tentName, tentPlants.length)}
              {!isTentCollapsed(tentName) && (
                <div className="grid grid-2">
                  {tentPlants.map((plant) => renderPlantCard(plant))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="plants-list-stack">
          {tentEntries.map(([tentName, tentPlants]) => (
            <div key={tentName} className="page-panel plants-table-panel">
              <div className="plants-table-panel-header">
                {renderTentHeader(tentName, tentPlants.length)}
              </div>
              {!isTentCollapsed(tentName) && (
                <div className="plants-table-scroll">
                  <table className={`plants-inventory-table ${selectMode ? 'is-selecting' : ''}`}>
                    <colgroup>
                      {selectMode && !showArchived && <col style={{ width: '2.5rem' }} />}
                      <col style={{ width: '16%' }} />
                      <col style={{ width: '11%' }} />
                      <col style={{ width: '10%' }} />
                      <col style={{ width: '10%' }} />
                      <col style={{ width: '6%' }} />
                      <col style={{ width: '12%' }} />
                      <col style={{ width: 'auto' }} />
                      <col style={{ width: '52px' }} />
                    </colgroup>
                    <thead>
                      <tr>
                        {selectMode && !showArchived && (
                          <th className="plants-th">
                            <input
                              type="checkbox"
                              checked={allVisibleSelected && tentPlants.every((p) => selectedIds.has(p.id))}
                              onChange={() => {
                                const tentIds = tentPlants.map((p) => p.id);
                                const allIn = tentIds.every((id) => selectedIds.has(id));
                                setSelectedIds((prev) => {
                                  const next = new Set(prev);
                                  if (allIn) tentIds.forEach((id) => next.delete(id));
                                  else tentIds.forEach((id) => next.add(id));
                                  return next;
                                });
                              }}
                              aria-label={`Select all in ${tentName}`}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </th>
                        )}
                        <th className="plants-th">Plant</th>
                        <th className="plants-th">Stage</th>
                        <th className="plants-th">Planted</th>
                        <th className="plants-th">Harvest</th>
                        <th className="plants-th">Logs</th>
                        <th className="plants-th">Last log</th>
                        <th className="plants-th">Notes</th>
                        <th className="plants-th plants-th-actions"> </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tentPlants.map((plant, index) =>
                        renderPlantTableRow(plant, index, tentPlants.length)
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="plants-modal-overlay">
          <div className="plants-modal">
            <h2 className="plants-modal-title">
              {editingPlant ? 'Edit Plant' : 'Add New Plant'}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="plants-modal-form">
              <div className="plants-modal-grid">
                <div>
                  <label className="plants-modal-label">Plant Name *</label>
                  <input
                    type="text"
                    {...register('name', { required: 'Plant name is required' })}
                    className={`plants-filter-input ${errors.name ? 'is-error' : ''}`}
                  />
                  {errors.name && <p className="plants-field-error">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="plants-modal-label">Strain</label>
                  <input type="text" {...register('strain')} className="plants-filter-input" />
                </div>

                <div>
                  <label className="plants-modal-label">Growth Stage *</label>
                  <select
                    {...register('stage', { required: 'Growth stage is required' })}
                    className={`plants-filter-input ${errors.stage ? 'is-error' : ''}`}
                  >
                    <option value="">Select Stage</option>
                    {STAGE_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {getStageIcon(s.value)} {s.label}
                      </option>
                    ))}
                  </select>
                  {errors.stage && <p className="plants-field-error">{errors.stage.message}</p>}
                </div>

                <div>
                  <label className="plants-modal-label">Grow Tent</label>
                  <input type="text" {...register('grow_tent')} className="plants-filter-input" list="plant-form-tents" />
                  <datalist id="plant-form-tents">
                    {availableTents.filter((t) => t !== 'Unassigned').map((t) => (
                      <option key={t} value={t} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="plants-modal-label">Planted Date</label>
                  <input type="date" {...register('planted_date')} className="plants-filter-input" />
                </div>

                <div>
                  <label className="plants-modal-label">Expected Harvest</label>
                  <input type="date" {...register('expected_harvest')} className="plants-filter-input" />
                </div>
              </div>

              <div>
                <label className="plants-modal-label">Notes</label>
                <textarea {...register('notes')} rows="3" className="plants-filter-input plants-textarea" />
              </div>

              <div className="plants-modal-actions">
                <button type="button" onClick={resetForm} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingPlant ? 'Update Plant' : 'Add Plant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showArchiveModal && plantToArchive && (
        <ArchiveModal
          plant={plantToArchive}
          onClose={() => {
            setShowArchiveModal(false);
            setPlantToArchive(null);
          }}
          onArchive={handleArchive}
        />
      )}

      {showBulkLog && (
        <BulkLogModal
          count={selectedPlants.length}
          busy={bulkBusy}
          onClose={() => setShowBulkLog(false)}
          onSubmit={handleBulkLog}
        />
      )}
    </div>
  );
};

const BulkLogModal = ({ count, busy, onClose, onSubmit }) => {
  const [type, setType] = useState('watering');
  const [waterAmount, setWaterAmount] = useState('');
  const [ph, setPh] = useState('');
  const [ec, setEc] = useState('');
  const [nutrient, setNutrient] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      type,
      water_amount: waterAmount || null,
      ph_level: ph || null,
      ec_tds: ec || null,
      nutrient_info: nutrient || null,
      notes: notes || null,
      logged_at: new Date().toISOString(),
    });
  };

  return (
    <div className="plants-modal-overlay" onClick={onClose}>
      <div className="plants-modal plants-modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="plants-modal-head">
          <h2 className="plants-modal-title" style={{ margin: 0 }}>
            Log care on {count} plant{count !== 1 ? 's' : ''}
          </h2>
          <button type="button" className="plants-modal-close" onClick={onClose} aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="plants-modal-form">
          <div>
            <label className="plants-modal-label">Type</label>
            <select className="plants-filter-input" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="watering">Watering</option>
              <option value="feeding">Nutrient Feeding</option>
            </select>
          </div>
          <div className="plants-modal-grid">
            <div>
              <label className="plants-modal-label">Water (L)</label>
              <input type="number" step="0.1" className="plants-filter-input" value={waterAmount} onChange={(e) => setWaterAmount(e.target.value)} />
            </div>
            <div>
              <label className="plants-modal-label">pH</label>
              <input type="number" step="0.1" className="plants-filter-input" value={ph} onChange={(e) => setPh(e.target.value)} />
            </div>
            <div>
              <label className="plants-modal-label">EC / TDS</label>
              <input type="number" step="1" className="plants-filter-input" value={ec} onChange={(e) => setEc(e.target.value)} />
            </div>
          </div>
          {type === 'feeding' && (
            <div>
              <label className="plants-modal-label">Nutrients</label>
              <input type="text" className="plants-filter-input" value={nutrient} onChange={(e) => setNutrient(e.target.value)} />
            </div>
          )}
          <div>
            <label className="plants-modal-label">Notes</label>
            <textarea className="plants-filter-input plants-textarea" rows="2" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="plants-modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={busy}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? 'Saving…' : 'Apply to selected'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ArchiveModal = ({ plant, onClose, onArchive }) => {
  const [archiveReason, setArchiveReason] = useState('completed');
  const [finalYield, setFinalYield] = useState('');
  const [harvestDate, setHarvestDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const archiveData = {
      archive_reason: archiveReason,
      final_yield: finalYield ? parseFloat(finalYield) : null,
      harvest_date: harvestDate,
    };

    await onArchive(plant, archiveData);
    setLoading(false);
  };

  return (
    <div className="plants-modal-overlay" onClick={onClose}>
      <div className="plants-modal plants-modal-sm" onClick={(e) => e.stopPropagation()}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 className="plants-modal-title" style={{ marginBottom: '0.5rem' }}>
            Archive Plant: {plant.name}
          </h2>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.875rem' }}>
            Archive this plant and preserve all environment data from the grow
          </p>
        </div>

        <form onSubmit={handleSubmit} className="plants-modal-form">
          <div>
            <label className="plants-modal-label">Archive Reason</label>
            <select
              value={archiveReason}
              onChange={(e) => setArchiveReason(e.target.value)}
              className="plants-filter-input"
              required
            >
              <option value="completed">Completed Harvest</option>
              <option value="died">Plant Died</option>
              <option value="removed">Removed Early</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="plants-modal-label">Final Yield (grams) - Optional</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={finalYield}
              onChange={(e) => setFinalYield(e.target.value)}
              placeholder="Enter yield in grams"
              className="plants-filter-input"
            />
          </div>

          <div>
            <label className="plants-modal-label">Harvest/Archive Date</label>
            <input
              type="date"
              value={harvestDate}
              onChange={(e) => setHarvestDate(e.target.value)}
              className="plants-filter-input"
              required
            />
          </div>

          <div className="plants-modal-actions">
            <button type="button" onClick={onClose} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ background: loading ? undefined : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
              <Archive className="w-4 h-4" />
              {loading ? 'Archiving...' : 'Archive Plant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Plants;
