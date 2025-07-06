import { format, parseISO } from 'date-fns';
import {
    Activity,
    ArrowLeft,
    Bug,
    Camera,
    Droplets,
    Edit,
    Eye,
    FlaskConical,
    Home,
    Leaf,
    Plus,
    Ruler,
    Save,
    Scissors,
    Search,
    Thermometer,
    Trash2,
    X
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { logsApi, plantsApi } from '../utils/api';

const Logs = () => {
  const [plants, setPlants] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [selectedPlant, setSelectedPlant] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const location = useLocation();
  const navigate = useNavigate();
  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm();

  // Parse URL parameters for editing
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const editId = params.get('editId');
    const plantId = params.get('plantId');

    if (editId && plantId) {
      setShowAddForm(true);
      // Will set editing log after logs are loaded
    }
    if (plantId) {
      setSelectedPlant(plantId);
    }
  }, [location.search]);

  useEffect(() => {
    fetchData();
  }, []);

  const populateForm = useCallback((log) => {
    Object.keys(log).forEach(key => {
      if (key === 'logged_at') {
        setValue(key, format(parseISO(log[key]), "yyyy-MM-dd'T'HH:mm"));
      } else {
        setValue(key, log[key] || '');
      }
    });
  }, [setValue]);

  const fetchData = async () => {
    try {
      const [plantsResponse, logsResponse] = await Promise.all([
        plantsApi.getAll(),
        logsApi.getAll()
      ]);
      setPlants(plantsResponse.data);
      setLogs(logsResponse.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const editId = params.get('editId');

    if (editId && logs.length > 0) {
      const logToEdit = logs.find(log => log.id === parseInt(editId));
      if (logToEdit) {
        setEditingLog(logToEdit);
        populateForm(logToEdit);
      }
    }
  }, [logs, location.search, setValue, populateForm]);

  const logTypes = [
    {
      id: 'watering',
      label: 'Watering',
      icon: <Droplets className="w-4 h-4" />,
      color: '#3b82f6',
      fields: ['water_amount', 'ph_level', 'ec_tds', 'notes']
    },
    {
      id: 'feeding',
      label: 'Nutrient Feeding',
      icon: <FlaskConical className="w-4 h-4" />,
      color: '#10b981',
      fields: ['nutrient_info', 'ph_level', 'ec_tds', 'water_amount', 'notes']
    },
    {
      id: 'environmental',
      label: 'Environmental Check',
      icon: <Thermometer className="w-4 h-4" />,
      color: '#f59e0b',
      fields: ['temperature', 'humidity', 'light_intensity', 'co2_level', 'notes']
    },
    {
      id: 'observation',
      label: 'Plant Observation',
      icon: <Eye className="w-4 h-4" />,
      color: '#8b5cf6',
      fields: ['height_cm', 'notes']
    },
    {
      id: 'training',
      label: 'Training/Pruning',
      icon: <Scissors className="w-4 h-4" />,
      color: '#ef4444',
      fields: ['notes']
    },
    {
      id: 'transplant',
      label: 'Transplant',
      icon: <Home className="w-4 h-4" />,
      color: '#06b6d4',
      fields: ['notes']
    },
    {
      id: 'pest_disease',
      label: 'Pest/Disease',
      icon: <Bug className="w-4 h-4" />,
      color: '#dc2626',
      fields: ['notes']
    },
    {
      id: 'deficiency',
      label: 'Nutrient Issue',
      icon: <Leaf className="w-4 h-4" />,
      color: '#ea580c',
      fields: ['notes']
    },
    {
      id: 'measurement',
      label: 'Growth Measurement',
      icon: <Ruler className="w-4 h-4" />,
      color: '#059669',
      fields: ['height_cm', 'notes']
    },
    {
      id: 'photo',
      label: 'Photo Documentation',
      icon: <Camera className="w-4 h-4" />,
      color: '#7c3aed',
      fields: ['notes']
    }
  ];

  const getLogTypeConfig = (type) => {
    return logTypes.find(t => t.id === type) || {
      id: type,
      label: type,
      icon: <Activity className="w-4 h-4" />,
      color: '#64748b',
      fields: ['notes']
    };
  };

  const selectedTypeConfig = watch('type') ? getLogTypeConfig(watch('type')) : null;

  const onSubmit = async (data) => {
    try {
      const formData = {
        ...data,
        plant_id: parseInt(data.plant_id),
        logged_at: data.logged_at || new Date().toISOString()
      };

      if (editingLog) {
        await logsApi.update(editingLog.id, formData);
        toast.success('Log updated successfully!');
      } else {
        await logsApi.create(formData);
        toast.success('Log added successfully!');
      }

      await fetchData();
      handleCancel();
    } catch {
      toast.error(editingLog ? 'Failed to update log' : 'Failed to add log');
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingLog(null);
    reset();
    navigate('/logs');
  };

  const handleDelete = async (logId) => {
    if (window.confirm('Are you sure you want to delete this log?')) {
      try {
        await logsApi.delete(logId);
        toast.success('Log deleted successfully!');
        await fetchData();
      } catch {
        toast.error('Failed to delete log');
      }
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesPlant = !selectedPlant || log.plant_id === parseInt(selectedPlant);
    const matchesType = !selectedType || log.type === selectedType;
    const matchesSearch = !searchTerm ||
      log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plants.find(p => p.id === log.plant_id)?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !dateFilter ||
      format(parseISO(log.logged_at), 'yyyy-MM-dd') === dateFilter;

    return matchesPlant && matchesType && matchesSearch && matchesDate;
  });

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--background)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          padding: '2rem',
          background: 'rgba(30, 41, 59, 0.6)',
          borderRadius: '16px',
          border: '1px solid rgba(100, 116, 139, 0.2)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(74, 222, 128, 0.3)',
            borderTop: '3px solid #4ade80',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: '#f8fafc', margin: 0 }}>Loading logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--background)',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div
          style={{
            background: 'rgba(30, 41, 59, 0.6)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '20px',
            border: '1px solid rgba(100, 116, 139, 0.2)',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 8px 20px -6px rgba(0, 0, 0, 0.3)',
            animation: 'fadeInUp 0.6s ease-out',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
            e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 20px -6px rgba(0, 0, 0, 0.3)';
            e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.2)';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link to="/dashboard" className="btn btn-secondary">
                <ArrowLeft className="w-4 h-4" />
                Dashboard
              </Link>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Plus className="w-4 h-4" />
              Add Log Entry
            </button>
          </div>

          <div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#f8fafc',
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              📋 Cultivation Logs
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '1rem', margin: 0 }}>
              Track and monitor your plant care activities
            </p>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div
            style={{
              background: 'rgba(30, 41, 59, 0.6)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '20px',
              border: '1px solid rgba(100, 116, 139, 0.2)',
              padding: '2rem',
              marginBottom: '2rem',
              boxShadow: '0 8px 20px -6px rgba(0, 0, 0, 0.3)',
              animation: 'fadeInUp 0.8s ease-out 0.2s both',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
              e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 20px -6px rgba(0, 0, 0, 0.3)';
              e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.2)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#f8fafc',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                {editingLog ? '✏️ Edit Log Entry' : '➕ Add New Log Entry'}
              </h2>
              <button
                onClick={handleCancel}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(100, 116, 139, 0.2)';
                  e.currentTarget.style.color = '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#94a3b8';
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Plant Selection */}
                <div>
                  <label style={{
                    display: 'block',
                    color: '#e2e8f0',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem'
                  }}>
                    Plant *
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
                    {...register('plant_id', { required: 'Please select a plant' })}
                  >
                    <option value="">Select a plant...</option>
                    {plants.filter(p => !p.archived).map(plant => (
                      <option key={plant.id} value={plant.id}>
                        {plant.name} ({plant.strain || 'Unknown strain'})
                      </option>
                    ))}
                  </select>
                  {errors.plant_id && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.plant_id.message}</p>}
                </div>

                {/* Log Type */}
                <div>
                  <label style={{
                    display: 'block',
                    color: '#e2e8f0',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem'
                  }}>
                    Activity Type *
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
                    {...register('type', { required: 'Please select an activity type' })}
                  >
                    <option value="">Select activity type...</option>
                    {logTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {errors.type && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.type.message}</p>}
                </div>

                {/* Date/Time */}
                <div>
                  <label style={{
                    display: 'block',
                    color: '#e2e8f0',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem'
                  }}>
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
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
                    {...register('logged_at')}
                    defaultValue={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                  />
                </div>

                {/* Description */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{
                    display: 'block',
                    color: '#e2e8f0',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem'
                  }}>
                    Description
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
                    {...register('description')}
                    placeholder="Brief description of the activity..."
                  />
                </div>
              </div>

              {/* Dynamic Fields Based on Type */}
              {selectedTypeConfig && selectedTypeConfig.fields.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{
                    color: '#f8fafc',
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    {selectedTypeConfig.icon}
                    {selectedTypeConfig.label} Details
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                    {selectedTypeConfig.fields.includes('water_amount') && (
                      <div>
                        <label style={{
                          display: 'block',
                          color: '#e2e8f0',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          marginBottom: '0.5rem'
                        }}>
                          Water Amount (L)
                        </label>
                        <input
                          type="number"
                          step="0.1"
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
                          {...register('water_amount')}
                          placeholder="0.0"
                        />
                      </div>
                    )}

                    {selectedTypeConfig.fields.includes('ph_level') && (
                      <div>
                        <label style={{
                          display: 'block',
                          color: '#e2e8f0',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          marginBottom: '0.5rem'
                        }}>
                          pH Level
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="14"
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
                          {...register('ph_level')}
                          placeholder="6.0"
                        />
                      </div>
                    )}

                    {selectedTypeConfig.fields.includes('ec_tds') && (
                      <div>
                        <label style={{
                          display: 'block',
                          color: '#e2e8f0',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          marginBottom: '0.5rem'
                        }}>
                          EC/TDS (ppm)
                        </label>
                        <input
                          type="number"
                          step="1"
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
                          {...register('ec_tds')}
                          placeholder="800"
                        />
                      </div>
                    )}

                    {selectedTypeConfig.fields.includes('temperature') && (
                      <div>
                        <label style={{
                          display: 'block',
                          color: '#e2e8f0',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          marginBottom: '0.5rem'
                        }}>
                          Temperature (°C)
                        </label>
                        <input
                          type="number"
                          step="0.1"
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
                          {...register('temperature')}
                          placeholder="24.0"
                        />
                      </div>
                    )}

                    {selectedTypeConfig.fields.includes('humidity') && (
                      <div>
                        <label style={{
                          display: 'block',
                          color: '#e2e8f0',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          marginBottom: '0.5rem'
                        }}>
                          Humidity (%)
                        </label>
                        <input
                          type="number"
                          step="1"
                          min="0"
                          max="100"
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
                          {...register('humidity')}
                          placeholder="60"
                        />
                      </div>
                    )}

                    {selectedTypeConfig.fields.includes('light_intensity') && (
                      <div>
                        <label style={{
                          display: 'block',
                          color: '#e2e8f0',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          marginBottom: '0.5rem'
                        }}>
                          Light Intensity (PPFD)
                        </label>
                        <input
                          type="number"
                          step="1"
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
                          {...register('light_intensity')}
                          placeholder="800"
                        />
                      </div>
                    )}

                    {selectedTypeConfig.fields.includes('co2_level') && (
                      <div>
                        <label style={{
                          display: 'block',
                          color: '#e2e8f0',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          marginBottom: '0.5rem'
                        }}>
                          CO2 Level (ppm)
                        </label>
                        <input
                          type="number"
                          step="1"
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
                          {...register('co2_level')}
                          placeholder="1200"
                        />
                      </div>
                    )}

                    {selectedTypeConfig.fields.includes('height_cm') && (
                      <div>
                        <label style={{
                          display: 'block',
                          color: '#e2e8f0',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          marginBottom: '0.5rem'
                        }}>
                          Plant Height (cm)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          {...register('height_cm')}
                          placeholder="25.0"
                          inputMode="decimal"
                          autoComplete="off"
                        />
                      </div>
                    )}

                    {selectedTypeConfig.fields.includes('nutrient_info') && (
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{
                          display: 'block',
                          color: '#e2e8f0',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          marginBottom: '0.5rem'
                        }}>
                          Nutrient Information
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
                          {...register('nutrient_info')}
                          placeholder="e.g., NPK 10-5-14, Cal-Mag 2ml/L"
                        />
                      </div>
                    )}

                    {selectedTypeConfig.fields.includes('notes') && (
                      <div style={{ gridColumn: '1 / -1' }}>
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
                          rows="4"
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            background: 'rgba(15, 23, 42, 0.6)',
                            border: '1px solid rgba(100, 116, 139, 0.3)',
                            borderRadius: '12px',
                            color: '#f8fafc',
                            fontSize: '0.875rem',
                            outline: 'none',
                            resize: 'vertical',
                            minHeight: '100px'
                          }}
                          {...register('notes')}
                          placeholder="Additional observations, thoughts, or details..."
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleCancel}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'transparent',
                    border: '1px solid rgba(100, 116, 139, 0.3)',
                    borderRadius: '12px',
                    color: '#94a3b8',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.7 : 1,
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Save className="w-4 h-4" />
                  {isSubmitting ? 'Saving...' : (editingLog ? 'Update Log' : 'Save Log')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div
          style={{
            background: 'rgba(30, 41, 59, 0.6)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '20px',
            border: '1px solid rgba(100, 116, 139, 0.2)',
            padding: '1.5rem',
            marginBottom: '2rem',
            boxShadow: '0 8px 20px -6px rgba(0, 0, 0, 0.3)',
            animation: 'fadeInUp 0.8s ease-out 0.4s both',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
            e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 20px -6px rgba(0, 0, 0, 0.3)';
            e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.2)';
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{
                display: 'block',
                color: '#e2e8f0',
                fontSize: '0.75rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Search Logs
              </label>
              <div style={{ position: 'relative' }}>
                <Search className="w-4 h-4" style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8'
                }} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search descriptions, notes..."
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(100, 116, 139, 0.3)',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{
                display: 'block',
                color: '#e2e8f0',
                fontSize: '0.75rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Filter by Plant
              </label>
              <select
                value={selectedPlant}
                onChange={(e) => setSelectedPlant(e.target.value)}
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
              >
                <option value="">All plants</option>
                {plants.filter(p => !p.archived).map(plant => (
                  <option key={plant.id} value={plant.id}>
                    {plant.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                color: '#e2e8f0',
                fontSize: '0.75rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Filter by Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
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
              >
                <option value="">All types</option>
                {logTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                color: '#e2e8f0',
                fontSize: '0.75rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Filter by Date
              </label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
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
              />
            </div>
          </div>

          {(searchTerm || selectedPlant || selectedType || dateFilter) && (
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
                Showing {filteredLogs.length} of {logs.length} logs
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedPlant('');
                  setSelectedType('');
                  setDateFilter('');
                }}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'transparent',
                  border: '1px solid rgba(100, 116, 139, 0.3)',
                  borderRadius: '8px',
                  color: '#94a3b8',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Logs Table */}
        <div
          style={{
            background: 'rgba(30, 41, 59, 0.6)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '20px',
            border: '1px solid rgba(100, 116, 139, 0.2)',
            overflow: 'hidden',
            boxShadow: '0 8px 20px -6px rgba(0, 0, 0, 0.3)',
            animation: 'fadeInUp 0.8s ease-out 0.6s both',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
            e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 20px -6px rgba(0, 0, 0, 0.3)';
            e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.2)';
          }}
        >
          {filteredLogs.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              background: 'rgba(15, 23, 42, 0.4)'
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
                marginBottom: '0.75rem'
              }}>
                {searchTerm || selectedPlant || selectedType || dateFilter
                  ? 'No logs match your filters'
                  : 'No logs yet'
                }
              </h3>
              <p style={{
                color: '#94a3b8',
                marginBottom: '2rem',
                fontSize: '0.95rem'
              }}>
                {searchTerm || selectedPlant || selectedType || dateFilter
                  ? 'Try adjusting your search criteria or filters.'
                  : 'Start tracking your cultivation activities by adding your first log entry.'
                }
              </p>
              {!(searchTerm || selectedPlant || selectedType || dateFilter) && (
                <button
                  onClick={() => setShowAddForm(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    color: 'white',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Add First Log
                </button>
              )}
            </div>
          ) : (
            <div style={{ overflowX: 'auto', minWidth: '100%' }}>
              <table style={{ width: '100%', fontSize: '0.875rem', textAlign: 'left', borderCollapse: 'collapse', minWidth: '900px' }}>
                <thead>
                  <tr style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    borderBottom: '1px solid rgba(100, 116, 139, 0.3)'
                  }}>
                    <th style={{
                      padding: '1rem 1.25rem',
                      fontWeight: '600',
                      color: '#e2e8f0',
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      textAlign: 'left',
                      width: '15%'
                    }}>Date/Time</th>
                    <th style={{
                      padding: '1rem 1.25rem',
                      fontWeight: '600',
                      color: '#e2e8f0',
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      textAlign: 'left',
                      width: '15%'
                    }}>Plant</th>
                    <th style={{
                      padding: '1rem 1.25rem',
                      fontWeight: '600',
                      color: '#e2e8f0',
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      textAlign: 'center',
                      width: '12%'
                    }}>Type</th>
                    <th style={{
                      padding: '1rem 1.25rem',
                      fontWeight: '600',
                      color: '#e2e8f0',
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      textAlign: 'left',
                      width: '20%'
                    }}>Description</th>
                    <th style={{
                      padding: '1rem 1.25rem',
                      fontWeight: '600',
                      color: '#e2e8f0',
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      textAlign: 'left',
                      width: '25%'
                    }}>Notes</th>
                    <th style={{
                      padding: '1rem 1.25rem',
                      fontWeight: '600',
                      color: '#e2e8f0',
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      textAlign: 'center',
                      width: '13%'
                    }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log, index) => {
                    const plant = plants.find(p => p.id === log.plant_id);
                    const typeConfig = getLogTypeConfig(log.type);

                    return (
                      <tr
                        key={log.id}
                        style={{
                          borderBottom: index < filteredLogs.length - 1 ? '1px solid rgba(100, 116, 139, 0.2)' : 'none',
                          transition: 'all 0.2s ease',
                          background: index % 2 === 0 ? 'rgba(15, 23, 42, 0.3)' : 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(30, 41, 59, 0.7)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = index % 2 === 0 ? 'rgba(15, 23, 42, 0.3)' : 'transparent';
                        }}
                      >
                        <td style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap', textAlign: 'left' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                            <span style={{ color: '#f8fafc', fontWeight: '600', fontSize: '0.875rem' }}>
                              {format(parseISO(log.logged_at), 'MMM dd, yyyy')}
                            </span>
                            <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '500' }}>
                              {format(parseISO(log.logged_at), 'HH:mm:ss')}
                            </span>
                          </div>
                        </td>

                        <td style={{ padding: '1rem 1.25rem', textAlign: 'left' }}>
                          <Link
                            to={`/plants/${plant?.id}`}
                            style={{
                              color: '#4ade80',
                              textDecoration: 'none',
                              fontWeight: '600',
                              fontSize: '0.875rem',
                              display: 'block',
                              marginBottom: '0.25rem'
                            }}
                          >
                            {plant?.name || 'Unknown Plant'}
                          </Link>
                          {plant?.strain && (
                            <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                              {plant.strain}
                            </span>
                          )}
                        </td>

                        <td style={{
                          padding: '1rem 1.25rem',
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
                            background: `${typeConfig.color}20`,
                            color: typeConfig.color,
                            border: `1px solid ${typeConfig.color}40`,
                            gap: '0.375rem',
                            textTransform: 'capitalize',
                            letterSpacing: '0.015em',
                            whiteSpace: 'nowrap',
                            minWidth: 'fit-content'
                          }}>
                            {typeConfig.icon}
                            {typeConfig.label}
                          </span>
                        </td>

                        <td style={{ padding: '1rem 1.25rem', textAlign: 'left' }}>
                          <span style={{
                            color: '#f8fafc',
                            fontWeight: '500',
                            fontSize: '0.875rem',
                            lineHeight: '1.4',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {log.description || 'No description provided'}
                          </span>
                        </td>

                        <td style={{ padding: '1rem 1.25rem', textAlign: 'left' }}>
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
                        </td>

                        <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                            <button
                              onClick={() => {
                                setEditingLog(log);
                                populateForm(log);
                                setShowAddForm(true);
                              }}
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
                              onClick={() => handleDelete(log.id)}
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Logs;
