import { format, formatDistanceToNow } from 'date-fns';
import { Activity, ArrowLeft, Edit, Home, Plus, Save, Trash2, TrendingUp, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link, useParams } from 'react-router-dom';

import { logsApi, plantsApi } from '../utils/api';
// import LogModal from '../components/LogModal';

const InlineLogModal = ({ isOpen, onClose, onSuccess, plantId, logToEdit = null }) => {
  const [formData, setFormData] = useState({
    logged_at: '',
    type: 'observation',
    notes: '',
    ph_level: '',
    ec_tds: '',
    water_amount: '',
    height_cm: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const logTypes = [
    { value: 'watering', label: 'Watering' },
    { value: 'feeding', label: 'Feeding/Nutrients' },
    { value: 'environmental', label: 'Environment' },
    { value: 'observation', label: 'Observation' },
    { value: 'training', label: 'Training' },
    { value: 'transplant', label: 'Transplant' },
    { value: 'pest_disease', label: 'Pest/Disease' },
    { value: 'measurement', label: 'Measurement' }
  ];

  useEffect(() => {
    if (isOpen) {
      if (logToEdit) {
        setFormData({
          logged_at: logToEdit.logged_at ? new Date(logToEdit.logged_at).toISOString().split('T')[0] : '',
          type: logToEdit.type || 'observation',
          notes: logToEdit.notes || '',
          ph_level: logToEdit.ph_level || '',
          ec_tds: logToEdit.ec_tds || '',
          water_amount: logToEdit.water_amount || '',
          height_cm: logToEdit.height_cm || ''
        });
      } else {
        setFormData({
          logged_at: new Date().toISOString().split('T')[0],
          type: 'observation',
          notes: '',
          ph_level: '',
          ec_tds: '',
          water_amount: '',
          height_cm: ''
        });
      }
    }
  }, [isOpen, logToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submitData = {
        ...formData,
        plant_id: plantId,
        ph_level: formData.ph_level ? parseFloat(formData.ph_level) : null,
        ec_tds: formData.ec_tds ? parseFloat(formData.ec_tds) : null,
        water_amount: formData.water_amount ? parseFloat(formData.water_amount) : null,
        height_cm: formData.height_cm ? parseFloat(formData.height_cm) : null
      };

      if (logToEdit) {
        await logsApi.update(logToEdit.id, submitData);
        toast.success('Log updated successfully!');
      } else {
        await logsApi.create(submitData);
        toast.success('Log added successfully!');
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to save log: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#1e293b',
          borderRadius: '16px',
          padding: '0',
          minWidth: '600px',
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
          border: '1px solid #475569'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #475569',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '1.5rem',
            color: '#f8fafc',
            fontWeight: '600'
          }}>
            {logToEdit ? 'Edit Log Entry' : 'Add Log Entry'}
          </h2>
          <button
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: '4px',
              borderRadius: '6px',
              transition: 'color 0.2s ease'
            }}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '500',
                color: '#f8fafc',
                fontSize: '0.875rem'
              }}>
                Date *
              </label>
              <input
                type="date"
                value={formData.logged_at}
                onChange={(e) => setFormData(prev => ({ ...prev, logged_at: e.target.value }))}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(100, 116, 139, 0.3)',
                  borderRadius: '12px',
                  color: '#f8fafc',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#4ade80';
                  e.target.style.boxShadow = '0 0 0 3px rgba(74, 222, 128, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(100, 116, 139, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '500',
                color: '#f8fafc',
                fontSize: '0.875rem'
              }}>
                Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(100, 116, 139, 0.3)',
                  borderRadius: '12px',
                  color: '#f8fafc',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#4ade80';
                  e.target.style.boxShadow = '0 0 0 3px rgba(74, 222, 128, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(100, 116, 139, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {logTypes.map(type => (
                  <option key={type.value} value={type.value} style={{ background: '#1e293b', color: '#f8fafc' }}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: '#f8fafc',
              fontSize: '0.875rem'
            }}>
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows="3"
              placeholder="Activity notes and observations..."
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '12px',
                color: '#f8fafc',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'all 0.2s ease',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#4ade80';
                e.target.style.boxShadow = '0 0 0 3px rgba(74, 222, 128, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(100, 116, 139, 0.3)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '500',
                color: '#f8fafc',
                fontSize: '0.875rem'
              }}>
                Height (cm)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.height_cm}
                onChange={(e) => setFormData(prev => ({ ...prev, height_cm: e.target.value }))}
                placeholder="Plant height in cm"
                inputMode="decimal"
                autoComplete="off"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(100, 116, 139, 0.3)',
                  borderRadius: '12px',
                  color: '#f8fafc',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#4ade80';
                  e.target.style.boxShadow = '0 0 0 3px rgba(74, 222, 128, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(100, 116, 139, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '500',
                color: '#f8fafc',
                fontSize: '0.875rem'
              }}>
                Water Amount (L)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.water_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, water_amount: e.target.value }))}
                placeholder="Water volume in liters"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(100, 116, 139, 0.3)',
                  borderRadius: '12px',
                  color: '#f8fafc',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#4ade80';
                  e.target.style.boxShadow = '0 0 0 3px rgba(74, 222, 128, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(100, 116, 139, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '500',
                color: '#f8fafc',
                fontSize: '0.875rem'
              }}>
                pH Level
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="14"
                value={formData.ph_level}
                onChange={(e) => setFormData(prev => ({ ...prev, ph_level: e.target.value }))}
                placeholder="pH (0-14)"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(100, 116, 139, 0.3)',
                  borderRadius: '12px',
                  color: '#f8fafc',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#4ade80';
                  e.target.style.boxShadow = '0 0 0 3px rgba(74, 222, 128, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(100, 116, 139, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '500',
                color: '#f8fafc',
                fontSize: '0.875rem'
              }}>
                EC/TDS (ppm)
              </label>
              <input
                type="number"
                step="1"
                value={formData.ec_tds}
                onChange={(e) => setFormData(prev => ({ ...prev, ec_tds: e.target.value }))}
                placeholder="EC/TDS in ppm"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(100, 116, 139, 0.3)',
                  borderRadius: '12px',
                  color: '#f8fafc',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#4ade80';
                  e.target.style.boxShadow = '0 0 0 3px rgba(74, 222, 128, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(100, 116, 139, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end',
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid #475569'
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: '0.75rem 1.5rem',
                border: '1px solid #6c757d',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                backgroundColor: '#6c757d',
                color: '#f8fafc',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => !isSubmitting && (e.target.style.backgroundColor = '#545b62')}
              onMouseLeave={(e) => !isSubmitting && (e.target.style.backgroundColor = '#6c757d')}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '0.75rem 1.5rem',
                border: '1px solid #4ade80',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                backgroundColor: '#4ade80',
                color: '#0f172a',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => !isSubmitting && (e.target.style.backgroundColor = '#22c55e')}
              onMouseLeave={(e) => !isSubmitting && (e.target.style.backgroundColor = '#4ade80')}
            >
              {isSubmitting ? 'Saving...' : (logToEdit ? 'Update Log' : 'Add Log')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PlantDetail = () => {
  const { id } = useParams();
  const [plant, setPlant] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [growTents, setGrowTents] = useState([]);
  const [showLogModal, setShowLogModal] = useState(false);
  const [editingLog, setEditingLog] = useState(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    fetchPlantData();
    fetchGrowTents();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPlantData = async () => {
    try {
      setLoading(true);
      const [plantData, logsData] = await Promise.all([
        plantsApi.getById(id),
        logsApi.getAll({ plant_id: id })
      ]);
      setPlant(plantData);
      setLogs(logsData);

      // Reset form with plant data when editing
      if (plantData) {
        reset({
          name: plantData.name,
          strain: plantData.strain,
          stage: plantData.stage,
          grow_tent: plantData.grow_tent,
          planted_date: plantData.planted_date ? format(new Date(plantData.planted_date), 'yyyy-MM-dd') : '',
          expected_harvest: plantData.expected_harvest ? format(new Date(plantData.expected_harvest), 'yyyy-MM-dd') : '',
          notes: plantData.notes
        });
      }
    } catch {
      toast.error('Failed to load plant data');
    } finally {
      setLoading(false);
    }
  };

  const fetchGrowTents = async () => {
    try {
      const data = await plantsApi.getGrowTents();
      setGrowTents(data);
    } catch {
      // Grow tents fetch failed
    }
  };

  const onSubmit = async (data) => {
    try {
      await plantsApi.update(id, data);
      toast.success('Plant updated successfully');
      setEditing(false);
      fetchPlantData();
    } catch {
      toast.error('Failed to update plant');
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    reset(); // Reset form to original values
  };

  const handleAddLog = () => {
    setEditingLog(null);
    setShowLogModal(true);
  };

  const handleEditLog = (log) => {
    setEditingLog(log);
    setShowLogModal(true);
  };

  const handleLogModalClose = () => {
    setShowLogModal(false);
    setEditingLog(null);
  };

  const handleLogSuccess = () => {
    fetchPlantData(); // Refresh the data
  };

  const handleDeleteLog = async (logId) => {
    if (window.confirm('Are you sure you want to delete this log entry?')) {
      try {
        await logsApi.delete(logId);
        toast.success('Log deleted successfully');
        fetchPlantData(); // Refresh the data
      } catch {
        toast.error('Failed to delete log');
      }
    }
  };

  const getStageIcon = (stage) => {
    switch (stage) {
      case 'seedling': return '🌱';
      case 'vegetative': return '🌿';
      case 'flowering': return '🌸';
      case 'harvest': return '🌾';
      case 'cured': return '📦';
      default: return '🌱';
    }
  };

  const getLogTypeIcon = (type) => {
    switch (type) {
      case 'watering': return '💧';
      case 'feeding': return '🍽️';
      case 'pruning': return '✂️';
      case 'training': return '🔗';
      case 'observation': return '👁️';
      case 'harvest': return '🌾';
      case 'transplant': return '🪴';
      case 'deficiency': return '⚠️';
      case 'pest': return '🐛';
      case 'disease': return '🦠';
      default: return '📝';
    }
  };

  const getLogTypeColor = (type) => {
    const colors = {
      watering: { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' },
      feeding: { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', border: 'rgba(34, 197, 94, 0.3)' },
      pruning: { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' },
      training: { bg: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', border: 'rgba(168, 85, 247, 0.3)' },
      observation: { bg: 'rgba(156, 163, 175, 0.15)', color: '#9ca3af', border: 'rgba(156, 163, 175, 0.3)' },
      harvest: { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' },
      transplant: { bg: 'rgba(20, 184, 166, 0.15)', color: '#14b8a6', border: 'rgba(20, 184, 166, 0.3)' },
      deficiency: { bg: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', border: 'rgba(251, 191, 36, 0.3)' },
      pest: { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' },
      disease: { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' },
      default: { bg: 'rgba(100, 116, 139, 0.15)', color: '#64748b', border: 'rgba(100, 116, 139, 0.3)' }
    };
    return colors[type] || colors.default;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background-start to-background-end">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center min-h-64">
            <div className="loading"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!plant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background-start to-background-end">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-600">Plant not found</h2>
            <Link to="/plants" className="btn btn-primary mt-4">
              <ArrowLeft className="w-4 h-4" />
              Back to Plants
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-start to-background-end">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="dashboard-header" style={{ animation: 'fadeInUp 0.6s ease-out' }}>
          <div className="header-content">
            <div className="header-text">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <Link to="/plants" className="btn btn-secondary">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Link>
              </div>
              <h1 className="dashboard-title">{plant.name}</h1>
              <p className="dashboard-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {plant.grow_tent && (
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <Home className="w-4 h-4" />
                    {plant.grow_tent}
                  </span>
                )}
                <span style={{ color: '#60a5fa' }}>
                  {plant.strain || 'Unknown strain'}
                </span>
              </p>
            </div>
            <div className="header-actions">
              {!editing ? (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link
                    to={`/analytics/${id}`}
                    className="btn btn-primary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      textDecoration: 'none'
                    }}
                  >
                    <TrendingUp className="w-4 h-4" />
                    Analytics
                  </Link>
                  <button
                    onClick={handleEdit}
                    className="btn btn-accent"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Plant
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                    className="btn btn-primary"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="btn btn-secondary"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Form */}
        {editing && (
          <div style={{
            background: 'rgba(30, 41, 59, 0.6)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '20px',
            border: '1px solid rgba(100, 116, 139, 0.2)',
            overflow: 'hidden',
            boxShadow: '0 8px 20px -6px rgba(0, 0, 0, 0.3)',
            animation: 'fadeInUp 0.8s ease-out 0.2s both'
          }}>
            <div style={{ padding: '2rem', borderBottom: '1px solid rgba(100, 116, 139, 0.2)' }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#f8fafc',
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                ✏️ Edit Plant Details
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                Update plant information and growth details
              </p>
            </div>
            <div style={{ padding: '2rem' }}>
              <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'grid', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      color: '#e2e8f0',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      marginBottom: '0.5rem'
                    }}>
                      Plant Name *
                    </label>
                    <input
                      type="text"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid rgba(100, 116, 139, 0.3)',
                        borderRadius: '12px',
                        color: '#f8fafc',
                        fontSize: '0.875rem',
                        outline: 'none',
                        transition: 'all 0.2s ease'
                      }}
                      {...register('name', { required: 'Plant name is required' })}
                      placeholder="e.g., Plant #1, Blue Dream"
                    />
                    {errors.name && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.name.message}</p>}
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      color: '#e2e8f0',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      marginBottom: '0.5rem'
                    }}>
                      Strain
                    </label>
                    <input
                      type="text"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid rgba(100, 116, 139, 0.3)',
                        borderRadius: '12px',
                        color: '#f8fafc',
                        fontSize: '0.875rem',
                        outline: 'none'
                      }}
                      {...register('strain')}
                      placeholder="e.g., Blue Dream, OG Kush"
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      color: '#e2e8f0',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      marginBottom: '0.5rem'
                    }}>
                      Growth Stage
                    </label>
                    <select
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid rgba(100, 116, 139, 0.3)',
                        borderRadius: '12px',
                        color: '#f8fafc',
                        fontSize: '0.875rem',
                        outline: 'none'
                      }}
                      {...register('stage')}
                    >
                      <option value="seedling">🌱 Seedling</option>
                      <option value="vegetative">🌿 Vegetative</option>
                      <option value="flowering">🌸 Flowering</option>
                      <option value="harvest">🌾 Harvest</option>
                      <option value="cured">📦 Cured</option>
                    </select>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      color: '#e2e8f0',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      marginBottom: '0.5rem'
                    }}>
                      Grow Tent
                    </label>
                    <input
                      type="text"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid rgba(100, 116, 139, 0.3)',
                        borderRadius: '12px',
                        color: '#f8fafc',
                        fontSize: '0.875rem',
                        outline: 'none'
                      }}
                      {...register('grow_tent')}
                      placeholder="e.g., Tent 1, Main Room, Veg Tent"
                      list="grow-tent-options"
                    />
                    <datalist id="grow-tent-options">
                      {growTents.map((tent) => (
                        <option key={tent.grow_tent} value={tent.grow_tent} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      color: '#e2e8f0',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      marginBottom: '0.5rem'
                    }}>
                      Planted Date
                    </label>
                    <input
                      type="date"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid rgba(100, 116, 139, 0.3)',
                        borderRadius: '12px',
                        color: '#f8fafc',
                        fontSize: '0.875rem',
                        outline: 'none'
                      }}
                      {...register('planted_date')}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      color: '#e2e8f0',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      marginBottom: '0.5rem'
                    }}>
                      Expected Harvest
                    </label>
                    <input
                      type="date"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid rgba(100, 116, 139, 0.3)',
                        borderRadius: '12px',
                        color: '#f8fafc',
                        fontSize: '0.875rem',
                        outline: 'none'
                      }}
                      {...register('expected_harvest')}
                    />
                  </div>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    color: '#e2e8f0',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem'
                  }}>
                    Notes
                  </label>
                  <textarea
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid rgba(100, 116, 139, 0.3)',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '0.875rem',
                      outline: 'none',
                      minHeight: '100px',
                      resize: 'vertical'
                    }}
                    {...register('notes')}
                    placeholder="Any additional notes about this plant..."
                    rows={3}
                  />
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Plant Info Cards */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.6)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '20px',
          border: '1px solid rgba(100, 116, 139, 0.2)',
          overflow: 'hidden',
          boxShadow: '0 8px 20px -6px rgba(0, 0, 0, 0.3)',
          animation: 'fadeInUp 0.8s ease-out 0.4s both'
        }}>
          <div style={{ padding: '2rem', borderBottom: '1px solid rgba(100, 116, 139, 0.2)' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#f8fafc',
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              🌱 Plant Information
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
              Key details and growth tracking data
            </p>
          </div>
          <div style={{ padding: '2rem' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '2.5rem',
              marginBottom: '2rem'
            }}>
              {plant.planted_date && (
                <div style={{
                  background: 'rgba(15, 23, 42, 0.4)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  border: '1px solid rgba(100, 116, 139, 0.2)',
                  textAlign: 'center',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  animation: 'fadeInUp 0.8s ease-out 0.6s both'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.4)';
                  e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.2)';
                }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                    Planted Date
                  </div>
                  <div style={{ color: '#f8fafc', fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                    {format(new Date(plant.planted_date), 'MMM dd, yyyy')}
                  </div>
                  <div style={{ color: '#22c55e', fontSize: '0.875rem', fontWeight: '500' }}>
                    {formatDistanceToNow(new Date(plant.planted_date))} ago
                  </div>
                </div>
              )}
              {plant.expected_harvest && (
                <div style={{
                  background: 'rgba(15, 23, 42, 0.4)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  border: '1px solid rgba(100, 116, 139, 0.2)',
                  textAlign: 'center',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  animation: 'fadeInUp 0.8s ease-out 0.8s both'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.4)';
                  e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.2)';
                }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                    Expected Harvest
                  </div>
                  <div style={{ color: '#f8fafc', fontSize: '1.125rem', fontWeight: '700' }}>
                    {format(new Date(plant.expected_harvest), 'MMM dd, yyyy')}
                  </div>
                </div>
              )}
              <div style={{
                background: 'rgba(15, 23, 42, 0.4)',
                borderRadius: '16px',
                padding: '1.5rem',
                border: '1px solid rgba(100, 116, 139, 0.2)',
                textAlign: 'center',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                animation: 'fadeInUp 0.8s ease-out 1.0s both'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.4)';
                e.currentTarget.style.borderColor = plant.stage === 'vegetative' ? 'rgba(34, 197, 94, 0.4)' :
                                                   plant.stage === 'flowering' ? 'rgba(236, 72, 153, 0.4)' :
                                                   plant.stage === 'seedling' ? 'rgba(59, 130, 246, 0.4)' :
                                                   plant.stage === 'harvest' ? 'rgba(245, 158, 11, 0.4)' : 'rgba(100, 116, 139, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.2)';
              }}>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Growth Stage
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.25rem'
                }}>
                  <span style={{ fontSize: '1.5rem' }}>
                    {getStageIcon(plant.stage)}
                  </span>
                  <span style={{
                    color: plant.stage === 'vegetative' ? '#22c55e' :
                           plant.stage === 'flowering' ? '#ec4899' :
                           plant.stage === 'seedling' ? '#3b82f6' :
                           plant.stage === 'harvest' ? '#f59e0b' : '#64748b',
                    fontSize: '1.125rem',
                    fontWeight: '700',
                    textTransform: 'capitalize'
                  }}>
                    {plant.stage}
                  </span>
                </div>
              </div>
              <div style={{
                background: 'rgba(15, 23, 42, 0.4)',
                borderRadius: '16px',
                padding: '1.5rem',
                border: '1px solid rgba(100, 116, 139, 0.2)',
                textAlign: 'center',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                animation: 'fadeInUp 0.8s ease-out 1.2s both'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.4)';
                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.2)';
              }}>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Total Activities
                </div>
                <div style={{ color: '#f8fafc', fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                  {plant.log_count || 0}
                </div>
                <div style={{ color: '#3b82f6', fontSize: '0.875rem', fontWeight: '500' }}>
                  logged events
                </div>
              </div>
            </div>
            {plant.notes && (
              <div style={{
                padding: '1.5rem',
                background: 'rgba(34, 197, 94, 0.1)',
                borderRadius: '16px',
                border: '1px solid rgba(34, 197, 94, 0.2)'
              }}>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                  📝 Notes
                </div>
                <p style={{ color: '#f8fafc', lineHeight: '1.6', margin: 0 }}>{plant.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Spacing between cards */}
        <div style={{ height: '3rem' }}></div>

        {/* Recent Activity Table */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.6)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '20px',
          border: '1px solid rgba(100, 116, 139, 0.2)',
          overflow: 'hidden',
          boxShadow: '0 8px 20px -6px rgba(0, 0, 0, 0.3)',
          animation: 'fadeInUp 0.8s ease-out 0.6s both'
        }}>
          <div style={{ padding: '2rem', borderBottom: '1px solid rgba(100, 116, 139, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#f8fafc',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  📋 Recent Activity
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
                  Latest plant care logs and observations
                </p>
              </div>
              <button
                onClick={handleAddLog}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  color: 'white',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px -2px rgba(34, 197, 94, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px -4px rgba(34, 197, 94, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px -2px rgba(34, 197, 94, 0.3)';
                }}
              >
                <Plus className="w-4 h-4" />
                Add Log
              </button>
            </div>
          </div>

          {logs.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              background: 'rgba(15, 23, 42, 0.4)',
              margin: '2rem',
              borderRadius: '16px',
              border: '1px solid rgba(100, 116, 139, 0.2)'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                opacity: 0.8
              }}>
                <Activity className="w-10 h-10" style={{ color: 'white' }} />
              </div>
              <h3 style={{
                color: '#f8fafc',
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '0.75rem',
                letterSpacing: '-0.025em'
              }}>
                No activity logs yet
              </h3>
              <p style={{
                color: '#94a3b8',
                marginBottom: '2rem',
                fontSize: '0.95rem',
                lineHeight: '1.5'
              }}>
                Start tracking your plant&apos;s growth by adding your first log entry.
              </p>
              <button
                onClick={handleAddLog}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  color: 'white',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
              >
                <Plus className="w-4 h-4" />
                Add First Log
              </button>
            </div>
          ) : (
            <div style={{
              background: 'rgba(30, 41, 59, 0.6)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              overflow: 'hidden'
            }}>
              <div style={{ overflowX: 'auto', minWidth: '100%' }}>
                <table style={{ width: '100%', fontSize: '0.875rem', textAlign: 'left', borderCollapse: 'collapse', minWidth: '900px' }}>
                  <thead>
                    <tr style={{
                      background: 'rgba(15, 23, 42, 0.8)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      borderBottom: '1px solid rgba(100, 116, 139, 0.3)'
                    }}>
                      <th style={{
                        padding: '1rem 1rem',
                        fontWeight: '600',
                        color: '#e2e8f0',
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        textAlign: 'left',
                        width: '18%'
                      }}>Date/Time</th>
                      <th style={{
                        padding: '1rem 1rem',
                        fontWeight: '600',
                        color: '#e2e8f0',
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        textAlign: 'center',
                        width: '15%'
                      }}>Type</th>
                      <th style={{
                        padding: '1rem 1rem',
                        fontWeight: '600',
                        color: '#e2e8f0',
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        textAlign: 'center',
                        width: '35%'
                      }}>Measurements</th>
                      <th style={{
                        padding: '1rem 1rem',
                        fontWeight: '600',
                        color: '#e2e8f0',
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        textAlign: 'left',
                        width: '22%'
                      }}>Notes</th>
                      <th style={{
                        padding: '1rem 1rem',
                        fontWeight: '600',
                        color: '#e2e8f0',
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        textAlign: 'center',
                        width: '10%'
                      }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.slice(0, 10).map((log, index) => (
                      <tr
                        key={log.id}
                        style={{
                          borderBottom: index < Math.min(logs.length - 1, 9) ? '1px solid rgba(100, 116, 139, 0.2)' : 'none',
                          transition: 'all 0.2s ease',
                          background: index % 2 === 0 ? 'rgba(15, 23, 42, 0.3)' : 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(30, 41, 59, 0.7)';
                          e.currentTarget.style.backdropFilter = 'blur(8px)';
                          e.currentTarget.style.WebkitBackdropFilter = 'blur(8px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = index % 2 === 0 ? 'rgba(15, 23, 42, 0.3)' : 'transparent';
                          e.currentTarget.style.backdropFilter = 'none';
                          e.currentTarget.style.WebkitBackdropFilter = 'none';
                        }}
                      >
                        <td style={{ padding: '1rem 1rem', whiteSpace: 'nowrap', textAlign: 'left' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.8rem', gap: '0.125rem' }}>
                            <span style={{ color: '#f8fafc', fontWeight: '600', fontSize: '0.875rem' }}>
                              {format(new Date(log.logged_at), 'MMM dd, yyyy')}
                            </span>
                            <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '500' }}>
                              {format(new Date(log.logged_at), 'HH:mm:ss')}
                            </span>
                          </div>
                        </td>
                        <td style={{
                          padding: '1rem 1rem',
                          whiteSpace: 'nowrap',
                          textAlign: 'center',
                          verticalAlign: 'middle'
                        }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0.375rem 0.75rem',
                            borderRadius: '100px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            background: getLogTypeColor(log.type).bg,
                            color: getLogTypeColor(log.type).color,
                            border: `1px solid ${getLogTypeColor(log.type).border}`,
                            gap: '0.375rem',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                            textTransform: 'capitalize',
                            letterSpacing: '0.015em',
                            whiteSpace: 'nowrap',
                            minWidth: 'fit-content'
                          }}>
                            <span style={{ fontSize: '0.75rem' }}>{getLogTypeIcon(log.type)}</span>
                            {log.type.replace('_', ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1rem', textAlign: 'left' }}>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '0.5rem',
                            fontSize: '0.75rem'
                          }}>
                            {log.height_cm && (
                              <div style={{
                                padding: '0.25rem 0.5rem',
                                background: 'rgba(16, 185, 129, 0.1)',
                                border: '1px solid rgba(16, 185, 129, 0.2)',
                                borderRadius: '6px',
                                color: '#10b981',
                                textAlign: 'center'
                              }}>
                                📏 {log.height_cm}cm
                              </div>
                            )}
                            {log.water_amount && (
                              <div style={{
                                padding: '0.25rem 0.5rem',
                                background: 'rgba(59, 130, 246, 0.1)',
                                border: '1px solid rgba(59, 130, 246, 0.2)',
                                borderRadius: '6px',
                                color: '#3b82f6',
                                textAlign: 'center'
                              }}>
                                💧 {log.water_amount}L
                              </div>
                            )}
                            {log.ph_level && (
                              <div style={{
                                padding: '0.25rem 0.5rem',
                                background: 'rgba(168, 85, 247, 0.1)',
                                border: '1px solid rgba(168, 85, 247, 0.2)',
                                borderRadius: '6px',
                                color: '#a855f7',
                                textAlign: 'center'
                              }}>
                                pH {log.ph_level}
                              </div>
                            )}
                            {log.ec_tds && (
                              <div style={{
                                padding: '0.25rem 0.5rem',
                                background: 'rgba(245, 158, 11, 0.1)',
                                border: '1px solid rgba(245, 158, 11, 0.2)',
                                borderRadius: '6px',
                                color: '#f59e0b',
                                textAlign: 'center'
                              }}>
                                ⚡ {log.ec_tds}ppm
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '1rem 1rem', textAlign: 'left' }}>
                          <div style={{ maxWidth: '250px' }}>
                            <span style={{
                              color: '#cbd5e1',
                              fontWeight: '400',
                              fontSize: '0.875rem',
                              lineHeight: '1.4',
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {log.notes || 'No notes provided'}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '1rem 1rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                            <button
                              onClick={() => handleEditLog(log)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '0.5rem',
                                background: 'rgba(59, 130, 246, 0.1)',
                                color: '#3b82f6',
                                borderRadius: '8px',
                                border: '1px solid rgba(59, 130, 246, 0.2)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteLog(log.id)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '0.5rem',
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: '#ef4444',
                                borderRadius: '8px',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Log Modal */}
        {showLogModal && (
          <InlineLogModal
            isOpen={showLogModal}
            onClose={handleLogModalClose}
            onSuccess={handleLogSuccess}
            plantId={id}
            logToEdit={editingLog}
          />
        )}
      </div>
    </div>
  );
};

export default PlantDetail;
