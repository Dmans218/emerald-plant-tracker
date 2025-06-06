import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Edit, Trash2, Calendar, Sprout, Copy, Archive, ArchiveRestore, Home } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { formatDistanceToNow, format } from 'date-fns';
import toast from 'react-hot-toast';

import { plantsApi } from '../utils/api';

const Plants = () => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlant, setEditingPlant] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [selectedGrowTent, setSelectedGrowTent] = useState('');
  const [growTents, setGrowTents] = useState([]);
  const [groupByTent, setGroupByTent] = useState(true);
  
  // Get URL search parameters for filtering
  const [searchParams] = useSearchParams();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    // Check for tent filter from URL
    const tentFromUrl = searchParams.get('tent');
    if (tentFromUrl) {
      setSelectedGrowTent(tentFromUrl);
      setGroupByTent(false); // Switch to list view when filtering
    }
  }, [searchParams]);

  useEffect(() => {
    fetchPlants();
    fetchGrowTents();
  }, [showArchived, selectedGrowTent]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPlants = async () => {
    try {
      setLoading(true);
      const params = { archived: showArchived };
      if (selectedGrowTent) {
        params.grow_tent = selectedGrowTent;
      }
      const data = await plantsApi.getAll(params);
      setPlants(data);
    } catch (error) {
      toast.error('Failed to load plants');
      console.error('Plants fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGrowTents = async () => {
    try {
      const data = await plantsApi.getGrowTents();
      setGrowTents(data);
    } catch (error) {
      console.error('Error fetching grow tents:', error);
    }
  };

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
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEdit = (plant) => {
    setEditingPlant(plant);
    reset({
      name: plant.name,
      strain: plant.strain,
      stage: plant.stage,
      planted_date: plant.planted_date ? format(new Date(plant.planted_date), 'yyyy-MM-dd') : '',
      expected_harvest: plant.expected_harvest ? format(new Date(plant.expected_harvest), 'yyyy-MM-dd') : '',
      notes: plant.notes,
      grow_tent: plant.grow_tent,
    });
    setShowForm(true);
  };

  const handleClone = (plant) => {
    const cloneName = prompt(`Enter name for cloned plant:`, `${plant.name} Clone`);
    if (cloneName && cloneName.trim()) {
      setEditingPlant(null);
      reset({
        name: cloneName.trim(),
        strain: plant.strain,
        stage: 'seedling', // Start clones as seedlings
        planted_date: '', // Let user set new planted date
        expected_harvest: '', // Let user set new harvest date
        notes: plant.notes ? `Cloned from ${plant.name}. ${plant.notes}` : `Cloned from ${plant.name}`,
        grow_tent: plant.grow_tent, // Keep same grow tent
      });
      setShowForm(true);
    }
  };

  const handleDelete = async (plant) => {
    if (window.confirm(`Are you sure you want to delete "${plant.name}"? This will also delete all associated logs.`)) {
      try {
        await plantsApi.delete(plant.id);
        toast.success('Plant deleted successfully');
        fetchPlants();
      } catch (error) {
        toast.error('Failed to delete plant');
      }
    }
  };

  const handleArchive = async (plant) => {
    const action = plant.archived ? 'unarchive' : 'archive';
    if (window.confirm(`Are you sure you want to ${action} "${plant.name}"?`)) {
      try {
        await plantsApi.update(plant.id, { archived: !plant.archived });
        toast.success(`Plant ${action}d successfully`);
        fetchPlants();
      } catch (error) {
        toast.error(`Failed to ${action} plant`);
      }
    }
  };

  const handleExportEnvironment = async (plantId) => {
    try {
      const response = await fetch(`/api/environment/plant/${plantId}/export`);
      if (!response.ok) throw new Error('Failed to export environment log');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `plant-${plantId}-environment.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error('Failed to export environment log');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingPlant(null);
    reset();
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

  // Group plants by tent when in group mode
  const groupedPlants = groupByTent ? plants.reduce((groups, plant) => {
    const tent = plant.grow_tent || 'Unassigned';
    if (!groups[tent]) {
      groups[tent] = [];
    }
    groups[tent].push(plant);
    return groups;
  }, {}) : { 'All Plants': plants };

  const renderPlantCard = (plant) => {
    // Defensive: ensure only the card is returned, nothing else
    return (
      <div className="plant-card">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <Link
              to={`/plants/${plant.id}`}
              className="plant-name"
            >
              {plant.name}
            </Link>
            <p className="plant-strain">{plant.strain || 'Unknown strain'}</p>
            {plant.grow_tent && (
              <span className="plant-tent-label">
                <Home className="w-3 h-3 inline mr-1" />
                {plant.grow_tent}
              </span>
            )}
          </div>
          <span className={`stage-badge stage-${plant.stage}`}>
            {getStageIcon(plant.stage)} {plant.stage}
          </span>
        </div>

        {plant.notes && (
          <p className="plant-notes">{plant.notes}</p>
        )}

        <div className="plant-meta">
          {plant.planted_date && (
            <div className="plant-meta-item">
              <Calendar className="w-4 h-4" />
              <span>Planted {formatDistanceToNow(new Date(plant.planted_date))} ago</span>
            </div>
          )}
        </div>

        <div className="plant-actions">
          <Link
            to={`/plants/${plant.id}`}
            className="plant-link"
          >
            View Details →
          </Link>
          <div className="flex gap-2">
            {!plant.archived && (
              <button
                onClick={() => handleClone(plant)}
                className="btn btn-secondary btn-sm"
                title="Clone Plant"
              >
                <Copy className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={() => handleEdit(plant)}
              className="btn btn-secondary btn-sm"
              title="Edit Plant"
              type="button"
            >
              <Edit className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleArchive(plant)}
              className="btn btn-outline btn-sm"
              title={plant.archived ? "Unarchive Plant" : "Archive Plant"}
              type="button"
            >
              {plant.archived ? <ArchiveRestore className="w-3 h-3" /> : <Archive className="w-3 h-3" />}
            </button>
            <button
              onClick={() => handleDelete(plant)}
              className="btn btn-danger btn-sm"
              title="Delete Plant"
              type="button"
            >
              <Trash2 className="w-3 h-3" />
            </button>
            {plant.archived && (
              <button
                onClick={() => handleExportEnvironment(plant.id)}
                className="btn btn-secondary btn-sm"
                title="Export Environment Log"
                type="button"
              >
                <Export className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="dashboard-title">
              🌱 Plant Management {showArchived && '(Archived)'}
            </h1>
            <p className="dashboard-subtitle">Organize your cannabis cultivation by grow tents</p>
          </div>
          <div className="header-actions">
          <button
            onClick={() => setGroupByTent(!groupByTent)}
            className={`btn ${groupByTent ? 'btn-secondary' : 'btn-outline'}`}
          >
            {groupByTent ? <Home className="w-4 h-4" /> : <List className="w-4 h-4" />}
            {groupByTent ? 'Group by Tent' : 'List View'}
          </button>
          
          {!groupByTent && (
            <select
              value={selectedGrowTent}
              onChange={(e) => setSelectedGrowTent(e.target.value)}
              className="select"
            >
              <option value="">All Tents</option>
              {growTents.map((tent) => (
                <option key={tent.grow_tent} value={tent.grow_tent}>
                  {tent.grow_tent} ({tent.plant_count})
                </option>
              ))}
            </select>
          )}
          
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`btn ${showArchived ? 'btn-secondary' : 'btn-outline'}`}
          >
            {showArchived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
            {showArchived ? 'Show Active' : 'Show Archived'}
          </button>
          {!showArchived && (
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4" />
              Add Plant
            </button>
          )}
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              {editingPlant ? 'Edit Plant' : 'Add New Plant'}
            </h2>
            <div className="flex gap-2">
              {!editingPlant && plants.length > 0 && (
                <select
                  className="select"
                  onChange={(e) => {
                    if (e.target.value) {
                      const plantToClone = plants.find(p => p.id === parseInt(e.target.value));
                      if (plantToClone) {
                        handleClone(plantToClone);
                      }
                    }
                    e.target.value = '';
                  }}
                  defaultValue=""
                >
                  <option value="">Clone from existing plant...</option>
                  {plants.map((plant) => (
                    <option key={plant.id} value={plant.id}>
                      {plant.name} ({plant.strain})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

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

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
              >
                {isSubmitting && <div className="loading"></div>}
                {editingPlant ? 'Update Plant' : 'Add Plant'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Plants List */}
      {plants.length === 0 ? (
        <div className="card text-center py-12">
          <Sprout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No plants yet</h3>
          <p className="text-gray-500 mb-4">Start your cultivation journey by adding your first plant</p>
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            Add Your First Plant
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedPlants).map(([tentName, tentPlants]) => (
            <div key={tentName} className="grow-tent-group">
              {groupByTent && (
                <div className="grow-tent-header">
                  <div className="flex items-center gap-3">
                    <Home className="w-5 h-5" />
                    <h3 className="text-xl font-bold">{tentName}</h3>
                    <span className="grow-tent-count">
                      {tentPlants.length} plant{tentPlants.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              )}
              <div className="grid grid-2">
                {tentPlants.map(plant => (
                  <React.Fragment key={plant.id}>
                    {renderPlantCard(plant)}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Plants; 