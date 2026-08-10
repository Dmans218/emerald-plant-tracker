import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Edit,
  Save,
  X,
  Activity,
  Sprout,
  Home,
  BookOpen,
} from 'lucide-react';
import { formatDistanceToNow, format, isValid } from 'date-fns';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import { plantsApi, logsApi } from '../utils/api';
import { toDateInputValue, formatPlantDate, parsePlantDate } from '../utils/dates';
import PageHeader from '../components/PageHeader';
import { useSettings } from '../contexts/SettingsContext';
import { fromCanonicalTemp } from '../utils/temperature';

const STAGES = [
  { value: 'seedling', label: 'Seedling', icon: '🌱' },
  { value: 'vegetative', label: 'Vegetative', icon: '🌿' },
  { value: 'flowering', label: 'Flowering', icon: '🌸' },
  { value: 'harvest', label: 'Harvest', icon: '✂️' },
  { value: 'drying', label: 'Drying', icon: '🌾' },
  { value: 'curing', label: 'Curing', icon: '📦' },
  { value: 'cured', label: 'Cured', icon: '🏆' },
];

const stageMeta = (stage) => STAGES.find((s) => s.value === stage) || STAGES[0];

const LOG_TYPE_STYLES = {
  watering: { bg: 'rgba(59, 130, 246, 0.12)', color: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' },
  feeding: { bg: 'rgba(34, 197, 94, 0.12)', color: '#4ade80', border: 'rgba(34, 197, 94, 0.3)' },
  environmental: { bg: 'rgba(245, 158, 11, 0.12)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' },
  pruning: { bg: 'rgba(245, 158, 11, 0.12)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' },
  training: { bg: 'rgba(168, 85, 247, 0.12)', color: '#c084fc', border: 'rgba(168, 85, 247, 0.3)' },
  observation: { bg: 'rgba(148, 163, 184, 0.12)', color: '#94a3b8', border: 'rgba(148, 163, 184, 0.3)' },
  harvest: { bg: 'rgba(239, 68, 68, 0.12)', color: '#f87171', border: 'rgba(239, 68, 68, 0.3)' },
  transplant: { bg: 'rgba(20, 184, 166, 0.12)', color: '#2dd4bf', border: 'rgba(20, 184, 166, 0.3)' },
  deficiency: { bg: 'rgba(251, 191, 36, 0.12)', color: '#fbbf24', border: 'rgba(251, 191, 36, 0.3)' },
  pest: { bg: 'rgba(239, 68, 68, 0.12)', color: '#f87171', border: 'rgba(239, 68, 68, 0.3)' },
  pest_disease: { bg: 'rgba(220, 38, 38, 0.12)', color: '#f87171', border: 'rgba(220, 38, 38, 0.3)' },
  disease: { bg: 'rgba(239, 68, 68, 0.12)', color: '#f87171', border: 'rgba(239, 68, 68, 0.3)' },
  measurement: { bg: 'rgba(5, 150, 105, 0.12)', color: '#34d399', border: 'rgba(5, 150, 105, 0.3)' },
  photo: { bg: 'rgba(124, 58, 237, 0.12)', color: '#a78bfa', border: 'rgba(124, 58, 237, 0.3)' },
};

const logTypeStyle = (type) =>
  LOG_TYPE_STYLES[type] || { bg: 'rgba(100, 116, 139, 0.12)', color: '#94a3b8', border: 'rgba(100, 116, 139, 0.3)' };

const formatLogAt = (value) => {
  if (!value) return { date: '—', time: '' };
  const d = new Date(value);
  if (!isValid(d)) return { date: '—', time: '' };
  return {
    date: format(d, 'MMM d, yyyy'),
    time: format(d, 'HH:mm'),
  };
};

const measurementChips = (log, temperatureUnit) => {
  const chips = [];
  if (log.height_cm) chips.push({ key: 'h', label: `${log.height_cm}cm`, tone: 'green' });
  if (log.water_amount) chips.push({ key: 'w', label: `${log.water_amount}L`, tone: 'blue' });
  if (log.ph_level) chips.push({ key: 'p', label: `pH ${log.ph_level}`, tone: 'purple' });
  if (log.ec_tds) chips.push({ key: 'e', label: `${log.ec_tds}ppm`, tone: 'amber' });
  if (log.temperature) chips.push({ key: 't', label: `${fromCanonicalTemp(log.temperature, temperatureUnit).toFixed(1)}°${temperatureUnit}`, tone: 'amber' });
  if (log.humidity) chips.push({ key: 'hu', label: `${log.humidity}%`, tone: 'blue' });
  return chips;
};

const PlantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plant, setPlant] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [growTents, setGrowTents] = useState([]);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  const { temperatureUnit } = useSettings();

  const fetchPlantData = useCallback(async () => {
    try {
      setLoading(true);
      const [plantData, logsData] = await Promise.all([
        plantsApi.getById(id),
        logsApi.getAll({ plant_id: id, limit: 12 }),
      ]);
      setPlant(plantData);
      setLogs(Array.isArray(logsData) ? logsData : []);

      if (plantData) {
        reset({
          name: plantData.name || '',
          strain: plantData.strain || '',
          stage: plantData.stage || 'seedling',
          grow_tent: plantData.grow_tent || '',
          planted_date: toDateInputValue(plantData.planted_date),
          expected_harvest: toDateInputValue(plantData.expected_harvest),
          notes: plantData.notes || '',
        });
      }
    } catch {
      toast.error('Failed to load plant data');
      setPlant(null);
    } finally {
      setLoading(false);
    }
  }, [id, reset]);

  useEffect(() => {
    fetchPlantData();
  }, [fetchPlantData]);

  useEffect(() => {
    plantsApi.getGrowTents()
      .then((data) => setGrowTents(Array.isArray(data) ? data : []))
      .catch(() => setGrowTents([]));
  }, []);

  const onSubmit = async (data) => {
    try {
      await plantsApi.update(id, data);
      toast.success('Plant updated');
      setEditing(false);
      fetchPlantData();
    } catch {
      toast.error('Failed to update plant');
    }
  };

  const handleEdit = () => setEditing(true);

  const handleCancelEdit = () => {
    setEditing(false);
    if (plant) {
      reset({
        name: plant.name || '',
        strain: plant.strain || '',
        stage: plant.stage || 'seedling',
        grow_tent: plant.grow_tent || '',
        planted_date: toDateInputValue(plant.planted_date),
        expected_harvest: toDateInputValue(plant.expected_harvest),
        notes: plant.notes || '',
      });
    }
  };

  const journalUrl = `/logs?plantId=${id}`;
  const addLogUrl = `/logs?plantId=${id}&add=1`;

  if (loading) {
    return (
      <div className="plant-detail-page">
        <div className="flex items-center justify-center min-h-64">
          <div className="loading" />
        </div>
      </div>
    );
  }

  if (!plant) {
    return (
      <div className="plant-detail-page plants-empty">
        <Sprout className="plants-empty-icon" />
        <h3>Plant not found</h3>
        <p>It may have been archived or deleted.</p>
        <Link to="/" className="btn btn-primary flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Plants
        </Link>
      </div>
    );
  }

  const stage = stageMeta(plant.stage);
  const planted = parsePlantDate(plant.planted_date);
  const plantedLabel = formatPlantDate(plant.planted_date);
  const harvestLabel = formatPlantDate(plant.expected_harvest);
  const lastLog = plant.last_log_date ? new Date(plant.last_log_date) : null;
  const lastLogLabel =
    lastLog && isValid(lastLog) ? formatDistanceToNow(lastLog, { addSuffix: true }) : null;

  const subtitle = [plant.strain || 'Unknown strain', plant.grow_tent].filter(Boolean).join(' · ');

  return (
    <div className="plant-detail-page">
      <PageHeader
        icon={Sprout}
        title={plant.name}
        subtitle={subtitle}
        badge={(
          <span className={`stage-badge stage-${plant.stage} plant-detail-stage-badge`}>
            {stage.icon} {plant.stage}
          </span>
        )}
        actions={(
          <div className="plant-detail-actions">
            <Link to="/" className="btn btn-outline flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Plants
            </Link>
            <Link to={journalUrl} className="btn btn-outline flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Journal
            </Link>
            {!editing ? (
              <>
                <Link to={addLogUrl} className="btn btn-primary flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Log
                </Link>
                <button type="button" onClick={handleEdit} className="btn btn-outline flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button type="button" onClick={handleCancelEdit} className="btn btn-outline flex items-center gap-2">
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </>
            )}
          </div>
        )}
      />

      {editing ? (
        <form className="page-panel plant-detail-edit" onSubmit={handleSubmit(onSubmit)}>
          <div className="plant-detail-section-head">
            <h2 className="plant-detail-section-title">Edit plant</h2>
          </div>
          <div className="plant-detail-edit-grid">
            <div className="plant-detail-field">
              <label htmlFor="pd-name">Name *</label>
              <input id="pd-name" type="text" className="plants-filter-input" {...register('name', { required: 'Required' })} />
              {errors.name && <span className="plants-field-error">{errors.name.message}</span>}
            </div>
            <div className="plant-detail-field">
              <label htmlFor="pd-strain">Strain</label>
              <input id="pd-strain" type="text" className="plants-filter-input" {...register('strain')} />
            </div>
            <div className="plant-detail-field">
              <label htmlFor="pd-stage">Stage</label>
              <select id="pd-stage" className="plants-filter-input" {...register('stage')}>
                {STAGES.map((s) => (
                  <option key={s.value} value={s.value}>{s.icon} {s.label}</option>
                ))}
              </select>
            </div>
            <div className="plant-detail-field">
              <label htmlFor="pd-tent">Grow tent</label>
              <input
                id="pd-tent"
                type="text"
                className="plants-filter-input"
                list="pd-tent-options"
                {...register('grow_tent')}
              />
              <datalist id="pd-tent-options">
                {growTents.map((tent) => (
                  <option key={tent.grow_tent || tent} value={tent.grow_tent || tent} />
                ))}
              </datalist>
            </div>
            <div className="plant-detail-field">
              <label htmlFor="pd-planted">Planted</label>
              <input id="pd-planted" type="date" className="plants-filter-input" {...register('planted_date')} />
            </div>
            <div className="plant-detail-field">
              <label htmlFor="pd-harvest">Expected harvest</label>
              <input id="pd-harvest" type="date" className="plants-filter-input" {...register('expected_harvest')} />
            </div>
            <div className="plant-detail-field plant-detail-field-span">
              <label htmlFor="pd-notes">Notes</label>
              <textarea id="pd-notes" rows={2} className="plants-filter-input plants-textarea" {...register('notes')} />
            </div>
          </div>
        </form>
      ) : (
        <div className="page-panel plant-detail-summary">
          <dl className="plant-detail-facts">
            <div className="plant-detail-fact">
              <dt>Stage</dt>
              <dd>
                <span className={`stage-badge stage-${plant.stage}`}>
                  {stage.icon} {plant.stage}
                </span>
              </dd>
            </div>
            <div className="plant-detail-fact">
              <dt>Tent</dt>
              <dd>
                {plant.grow_tent ? (
                  <Link
                    to={`/environment?tent=${encodeURIComponent(plant.grow_tent)}`}
                    className="plant-detail-tent-link"
                  >
                    <Home className="w-3.5 h-3.5" />
                    {plant.grow_tent}
                  </Link>
                ) : (
                  <span className="plant-detail-muted">Unassigned</span>
                )}
              </dd>
            </div>
            <div className="plant-detail-fact">
              <dt>Planted</dt>
              <dd>
                {plantedLabel || <span className="plant-detail-muted">—</span>}
                {planted && (
                  <span className="plant-detail-sub">
                    {formatDistanceToNow(planted, { addSuffix: true })}
                  </span>
                )}
              </dd>
            </div>
            <div className="plant-detail-fact">
              <dt>Harvest</dt>
              <dd>
                {harvestLabel || <span className="plant-detail-muted">—</span>}
              </dd>
            </div>
            <div className="plant-detail-fact">
              <dt>Logs</dt>
              <dd>
                <Link to={journalUrl} className="plant-detail-logs-link">
                  {plant.log_count || 0}
                  <span className="plant-detail-sub">entries</span>
                </Link>
              </dd>
            </div>
            <div className="plant-detail-fact">
              <dt>Last log</dt>
              <dd>
                {lastLogLabel || <span className="plant-detail-muted">None yet</span>}
              </dd>
            </div>
          </dl>

          {plant.notes && (
            <div className="plant-detail-notes">
              <span className="plant-detail-notes-label">Notes</span>
              <p>{plant.notes}</p>
            </div>
          )}
        </div>
      )}

      <div className="page-panel plant-detail-activity">
        <div className="plant-detail-section-head">
          <div>
            <h2 className="plant-detail-section-title">Recent activity</h2>
            <p className="plant-detail-section-sub">
              {logs.length === 0
                ? 'No care logs yet'
                : `Showing ${logs.length}${plant.log_count > logs.length ? ` of ${plant.log_count}` : ''} latest`}
            </p>
          </div>
          <div className="plant-detail-activity-actions">
            {logs.length > 0 && (
              <Link to={journalUrl} className="btn btn-outline flex items-center gap-1">
                Full journal
              </Link>
            )}
            <Link to={addLogUrl} className="btn btn-outline flex items-center gap-1 plant-detail-log-btn">
              <Plus className="w-3.5 h-3.5" />
              Log
            </Link>
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="plant-detail-empty-logs">
            <Activity className="w-8 h-8" />
            <p>Track watering, feeding, and observations from the journal.</p>
            <Link to={addLogUrl} className="btn btn-primary btn-sm flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" />
              Add first log
            </Link>
          </div>
        ) : (
          <div className="plant-detail-table-scroll">
            <table className="plant-detail-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Type</th>
                  <th>Data</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const when = formatLogAt(log.logged_at);
                  const style = logTypeStyle(log.type);
                  const chips = measurementChips(log, temperatureUnit);
                  const note = log.notes || log.description || '';
                  return (
                    <tr
                      key={log.id}
                      onClick={() => navigate(`/logs?plantId=${id}&editId=${log.id}`)}
                    >
                      <td className="plant-detail-when">
                        <span className="plant-detail-when-date">{when.date}</span>
                        <span className="plant-detail-when-time">{when.time}</span>
                      </td>
                      <td>
                        <span
                          className="plant-detail-type-pill"
                          style={{
                            background: style.bg,
                            color: style.color,
                            borderColor: style.border,
                          }}
                        >
                          {(log.type || 'log').replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td>
                        {chips.length === 0 ? (
                          <span className="plant-detail-muted">—</span>
                        ) : (
                          <div className="plant-detail-chips">
                            {chips.map((c) => (
                              <span key={c.key} className={`plant-detail-chip tone-${c.tone}`}>
                                {c.label}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="plant-detail-log-notes" title={note}>
                        {note || <span className="plant-detail-muted">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {plant.log_count > logs.length && (
          <div className="plant-detail-more">
            <Link to={journalUrl}>View all {plant.log_count} journal entries →</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlantDetail;
