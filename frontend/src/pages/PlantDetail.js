import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Plus, Edit, Home, Save, X } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import { plantsApi, logsApi } from '../utils/api';

const PlantDetail = () => {
  const { id } = useParams();
  const [plant, setPlant] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [growTents, setGrowTents] = useState([]);

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
    } catch (error) {
      toast.error('Failed to load plant data');
      console.error('Plant detail error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGrowTents = async () => {
    try {
      const data = await plantsApi.getGrowTents();
      setGrowTents(data);
    } catch (error) {
      console.error('Grow tents fetch error:', error);
    }
  };

  const onSubmit = async (data) => {
    try {
      await plantsApi.update(id, data);
      toast.success('Plant updated successfully');
      setEditing(false);
      fetchPlantData();
    } catch (error) {
      toast.error('Failed to update plant');
      console.error('Update error:', error);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    reset(); // Reset form to original values
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="loading"></div>
      </div>
    );
  }

  if (!plant) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-600">Plant not found</h2>
        <Link to="/plants" className="btn btn-primary mt-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Plants
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-text">
            <div className="flex items-center gap-4 mb-2">
              <Link to="/plants" className="btn btn-secondary">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
              <span className={`stage-badge stage-${plant.stage}`}>
                {getStageIcon(plant.stage)} {plant.stage}
              </span>
            </div>
            <h1 className="dashboard-title">{plant.name}</h1>
            <p className="dashboard-subtitle">
              {plant.strain || 'Unknown strain'}
              {plant.grow_tent && (
                <span className="ml-2">
                  <Home className="w-4 h-4 inline mr-1" />
                  {plant.grow_tent}
                </span>
              )}
            </p>
          </div>
          <div className="header-actions">
            {!editing ? (
              <button onClick={handleEdit} className="btn btn-accent">
                <Edit className="w-4 h-4" />
                Edit Plant
              </button>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={handleSubmit(onSubmit)} 
                  disabled={isSubmitting}
                  className="btn btn-primary"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button onClick={handleCancelEdit} className="btn btn-secondary">
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
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">✏️ Edit Plant Details</h2>
          </div>
          <div className="section-content">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-2 gap-4">
                <div className="form-group">
                  <label className="label">Plant Name *</label>
                  <input
                    type="text"
                    className="input"
                    {...register('name', { required: 'Plant name is required' })}
                    placeholder="e.g., Plant #1, Blue Dream"
                  />
                  {errors.name && <p className="text-error text-sm mt-1">{errors.name.message}</p>}
                </div>

                <div className="form-group">
                  <label className="label">Strain</label>
                  <input
                    type="text"
                    className="input"
                    {...register('strain')}
                    placeholder="e.g., Blue Dream, OG Kush"
                  />
                </div>

                <div className="form-group">
                  <label className="label">Growth Stage</label>
                  <select className="select" {...register('stage')}>
                    <option value="seedling">🌱 Seedling</option>
                    <option value="vegetative">🌿 Vegetative</option>
                    <option value="flowering">🌸 Flowering</option>
                    <option value="harvest">🌾 Harvest</option>
                    <option value="cured">📦 Cured</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="label">Grow Tent</label>
                  <input
                    type="text"
                    className="input"
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

                <div className="form-group">
                  <label className="label">Planted Date</label>
                  <input
                    type="date"
                    className="input"
                    {...register('planted_date')}
                  />
                </div>

                <div className="form-group">
                  <label className="label">Expected Harvest</label>
                  <input
                    type="date"
                    className="input"
                    {...register('expected_harvest')}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="label">Notes</label>
                <textarea
                  className="input textarea"
                  {...register('notes')}
                  placeholder="Any additional notes about this plant..."
                  rows={3}
                />
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Plant Info Card */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">🌱 Plant Information</h2>
        </div>
        <div className="section-content">
          <div className="grid grid-2 gap-6">
            {plant.planted_date && (
              <div className="stat-item">
                <div className="stat-label">Planted Date</div>
                <div className="stat-value">{format(new Date(plant.planted_date), 'PPP')}</div>
                <div className="stat-description">{formatDistanceToNow(new Date(plant.planted_date))} ago</div>
              </div>
            )}
            {plant.expected_harvest && (
              <div className="stat-item">
                <div className="stat-label">Expected Harvest</div>
                <div className="stat-value">{format(new Date(plant.expected_harvest), 'PPP')}</div>
              </div>
            )}
            <div className="stat-item">
              <div className="stat-label">Last Activity</div>
              <div className="stat-value">
                {plant.last_log_date 
                  ? formatDistanceToNow(new Date(plant.last_log_date)) + ' ago'
                  : 'No activities yet'
                }
              </div>
            </div>
            {plant.grow_tent && (
              <div className="stat-item">
                <div className="stat-label">Grow Location</div>
                <div className="stat-value">{plant.grow_tent}</div>
              </div>
            )}
          </div>
          {plant.notes && (
            <div className="mt-6 p-4 bg-accent-primary/10 rounded-lg border border-accent-primary/20">
              <div className="stat-label mb-2">📝 Notes</div>
              <p className="text-text-primary">{plant.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlantDetail; 