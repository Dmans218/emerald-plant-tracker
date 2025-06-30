import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
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
  AlertTriangle
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import toast from 'react-hot-toast';
import { plantsApi } from '../utils/api';

const Plants = () => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlant, setEditingPlant] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState('');
  const [selectedGrowTent, setSelectedGrowTent] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showArchived, setShowArchived] = useState(false);
  const [groupByTent, setGroupByTent] = useState(true);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [plantToArchive, setPlantToArchive] = useState(null);

  // Add spinner animation CSS
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes fadeInUp {
        0% {
          opacity: 0;
          transform: translateY(30px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();

  const fetchPlants = useCallback(async () => {
    try {
      setLoading(true);
      setPlants([]); // Clear plants immediately to prevent wrong empty state flash
      
      if (showArchived) {
        // Use new archived grows API
        const archivedData = await plantsApi.getArchivedGrows();
        // Transform archived grows data to match plants format for rendering
        const transformedData = archivedData.map(grow => ({
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
          updated_at: grow.archived_at
        }));
        setPlants(transformedData);
      } else {
        // Use regular plants API for active plants
        const plantsData = await plantsApi.getAll();
        setPlants(plantsData);
      }
    } catch {
      toast.error('Failed to load plants');
    } finally {
      setLoading(false);
    }
  }, [showArchived]);

  useEffect(() => {
    fetchPlants();
  }, [fetchPlants]); // Re-fetch when showArchived changes

  const uniqueGrowTents = [...new Set(plants.map(plant => plant.grow_tent).filter(Boolean))];

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
    setValue('name', plant.name);
    setValue('strain', plant.strain);
    setValue('stage', plant.stage);
    setValue('grow_tent', plant.grow_tent);
    setValue('planted_date', plant.planted_date);
    setValue('expected_harvest', plant.expected_harvest);
    setValue('notes', plant.notes);
    setShowForm(true);
  };

  const handleClone = (plant) => {
    if (window.confirm(`Clone "${plant.name}"? This will create a copy with the same details.`)) {
      setValue('name', `${plant.name} (Clone)`);
      setValue('strain', plant.strain);
      setValue('stage', 'seedling');
      setValue('grow_tent', plant.grow_tent);
      setValue('planted_date', '');
      setValue('expected_harvest', '');
      setValue('notes', plant.notes);

      setShowForm(true);
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
      // Advanced archive with reason and yield data
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
      // Handle archive/unarchive toggle
      const action = plant.archived ? 'unarchive' : 'archive';
      if (window.confirm(`Are you sure you want to ${action} "${plant.name}"?`)) {
        try {
          if (plant.archived) {
            // For archived plants, use the unarchive API with archived grow ID
            await plantsApi.unarchive(plant.id);
            toast.success(`Plant "${plant.name}" restored successfully`);
          } else {
            // For active plants, use the simple archive toggle
            await plantsApi.update(plant.id, { archived: !plant.archived });
            toast.success(`Plant ${action}d successfully`);
          }
          fetchPlants();
        } catch (error) {
          toast.error(`Failed to ${action} plant: ${error.response?.data?.error || error.message}`);
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

  // Tent Management Functions for Archived Grows
  const handleExportTent = async (tentName) => {
    try {
      const csvData = await plantsApi.exportArchivedTent(tentName);
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
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
    const activePlantsInTent = plants.filter(plant => !plant.archived && plant.grow_tent === tentName);
    
    if (activePlantsInTent.length > 0) {
      toast.error(`Cannot clear data: ${activePlantsInTent.length} active plants in ${tentName}`);
      return;
    }

    const confirmed = window.confirm(
      `⚠️ WARNING: This will permanently delete all environment data for "${tentName}" tent.\n\n` +
      `This action cannot be undone. Make sure you have exported the data first.\n\n` +
      `Are you sure you want to proceed?`
    );

    if (!confirmed) return;

    const doubleConfirmed = window.confirm(
      `🚨 FINAL CONFIRMATION\n\n` +
      `You are about to PERMANENTLY DELETE all environment data for "${tentName}".\n\n` +
      `Type "DELETE" in your mind and click OK to confirm.`
    );

    if (!doubleConfirmed) return;

    try {
      await plantsApi.clearTentEnvironmentData(tentName, true);
      toast.success(`${tentName} environment data cleared successfully`);
    } catch {
      toast.error('Failed to clear tent data');
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
    switch (stage) {
      case 'seedling':
        return {
          bg: 'rgba(34, 197, 94, 0.1)',
          color: '#22c55e',
          border: 'rgba(34, 197, 94, 0.2)'
        };
      case 'vegetative':
        return {
          bg: 'rgba(59, 130, 246, 0.1)',
          color: '#3b82f6',
          border: 'rgba(59, 130, 246, 0.2)'
        };
      case 'flowering':
        return {
          bg: 'rgba(168, 85, 247, 0.1)',
          color: '#a855f7',
          border: 'rgba(168, 85, 247, 0.2)'
        };
      case 'drying':
        return {
          bg: 'rgba(245, 158, 11, 0.1)',
          color: '#f59e0b',
          border: 'rgba(245, 158, 11, 0.2)'
        };
      case 'curing':
        return {
          bg: 'rgba(161, 98, 7, 0.1)',
          color: '#a16207',
          border: 'rgba(161, 98, 7, 0.2)'
        };
      case 'harvest':
        return {
          bg: 'rgba(251, 191, 36, 0.1)',
          color: '#fbbf24',
          border: 'rgba(251, 191, 36, 0.2)'
        };
      case 'cured':
        return {
          bg: 'rgba(100, 116, 139, 0.1)',
          color: '#64748b',
          border: 'rgba(100, 116, 139, 0.2)'
        };
      default:
        return {
          bg: 'rgba(100, 116, 139, 0.1)',
          color: '#64748b',
          border: 'rgba(100, 116, 139, 0.2)'
        };
    }
  };

  const filteredAndSortedPlants = () => {
    let filtered = plants.filter(plant => {
      const matchesArchived = showArchived ? plant.archived : !plant.archived;
      const matchesSearch = 
        plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (plant.strain && plant.strain.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (plant.grow_tent && plant.grow_tent.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStage = !filterStage || plant.stage === filterStage;
      const matchesTent = !selectedGrowTent || plant.grow_tent === selectedGrowTent;
      
      return matchesArchived && matchesSearch && matchesStage && matchesTent;
    });

    // Sort the filtered plants
    filtered.sort((a, b) => {
      let aValue = a[sortBy] || '';
      let bValue = b[sortBy] || '';

      if (sortBy === 'planted_date' || sortBy === 'expected_harvest') {
        aValue = aValue ? new Date(aValue) : new Date(0);
        bValue = bValue ? new Date(bValue) : new Date(0);
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="loading"></div>
      </div>
    );
  }

  // Group plants by tent when in group mode
  const groupedPlants = groupByTent ? plants.filter(plant => {
    return showArchived ? plant.archived : !plant.archived;
  }).reduce((groups, plant) => {
    const tent = plant.grow_tent || 'Unassigned';
    if (!groups[tent]) {
      groups[tent] = [];
    }
    groups[tent].push(plant);
    return groups;
  }, {}) : { 'All Plants': plants.filter(plant => showArchived ? plant.archived : !plant.archived) };

  const renderPlantCard = (plant) => (
    <div key={plant.id} className="plant-card">
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
            <p className="text-xs text-muted mt-1">
              <Home className="w-3 h-3 inline mr-1" />
              {plant.grow_tent}
            </p>
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
            <span>Planted {formatDistanceToNow(new Date(plant.planted_date))} ago</span>
          </div>
        )}
        <div className="plant-meta-item">
          <Sprout className="w-4 h-4" />
          <span>{plant.log_count || 0} activity logs</span>
        </div>
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
          >
            <Edit className="w-3 h-3" />
          </button>
          <button
            onClick={() => plant.archived ? handleArchive(plant) : openArchiveModal(plant)}
            className="btn btn-outline btn-sm"
            title={plant.archived ? "Unarchive Plant" : "Archive Plant"}
          >
            {plant.archived ? <ArchiveRestore className="w-3 h-3" /> : <Archive className="w-3 h-3" />}
          </button>
          <button
            onClick={() => handleDelete(plant)}
            className="btn btn-danger btn-sm"
            title="Delete Plant"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashboard-page">
      {/* Header */}
      <header className="dashboard-header" style={{ animation: 'fadeInUp 0.6s ease-out' }}>
        <div className="header-content">
          <div className="header-text">
            <h1 className="dashboard-title">
              <Sprout className="w-8 h-8" style={{ display: 'inline-block', marginRight: '0.75rem', verticalAlign: 'middle' }} />
              My Plants {showArchived && '(Archived)'}
            </h1>
            <p className="dashboard-subtitle">
              Track and manage your cannabis cultivation
            </p>
          </div>
          
          <div className="header-actions">
            <button
              onClick={() => {
                setLoading(true);  // Set loading immediately to prevent wrong empty state
                setPlants([]);     // Clear plants immediately
                setShowArchived(!showArchived);
              }}
              className="btn btn-outline flex items-center gap-2"
              style={{
                background: showArchived ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                border: `1px solid ${showArchived ? 'rgba(245, 158, 11, 0.3)' : 'rgba(100, 116, 139, 0.3)'}`,
                color: showArchived ? '#f59e0b' : '#e2e8f0',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.background = showArchived ? 'rgba(245, 158, 11, 0.3)' : 'rgba(100, 116, 139, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background = showArchived ? 'rgba(245, 158, 11, 0.2)' : 'transparent';
              }}
            >
              <Archive className="w-4 h-4" />
              {showArchived ? 'Archived Plants' : 'Active Plants'}
            </button>
            <button
              onClick={() => setGroupByTent(!groupByTent)}
              className="btn btn-warning flex items-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(245, 158, 11, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
              }}
            >
              <Home className="w-4 h-4" />
              {groupByTent ? 'Table View' : 'Card View'}
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-warning flex items-center gap-2"
              style={{ borderRadius: '8px' }}
            >
              <Plus className="w-5 h-5" />
              Add Plant
            </button>
          </div>
        </div>
      </header>

      {/* Filters Card */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '1.5rem',
        marginBottom: '2rem',
        animation: 'fadeInUp 0.8s ease-out 0.2s both'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', alignItems: 'end' }}>
          {/* Search */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#cbd5e1' }}>
              Search Plants
            </label>
            <div style={{ position: 'relative' }}>
              <Search style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '16px',
                height: '16px',
                color: '#94a3b8'
              }} />
              <input
                type="text"
                placeholder="Search by name, strain, or tent..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(100, 116, 139, 0.3)',
                  borderRadius: '8px',
                  color: '#e2e8f0',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(74, 222, 128, 0.5)';
                  e.currentTarget.style.background = 'rgba(30, 41, 59, 0.9)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.3)';
                  e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)';
                }}
              />
            </div>
          </div>

          {/* Stage Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#cbd5e1' }}>
              Growth Stage
            </label>
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '8px',
                color: '#e2e8f0',
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgba(74, 222, 128, 0.5)';
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.9)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.3)';
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)';
              }}
            >
              <option value="">All Stages</option>
              <option value="seedling">🌱 Seedling</option>
              <option value="vegetative">🌿 Vegetative</option>
              <option value="flowering">🌸 Flowering</option>
              <option value="harvest">✂️ Harvest</option>
              <option value="drying">🌾 Drying</option>
              <option value="curing">📦 Curing</option>
              <option value="cured">🏆 Cured</option>
            </select>
          </div>

          {/* Tent Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#cbd5e1' }}>
              Grow Tent
            </label>
            <select
              value={selectedGrowTent}
              onChange={(e) => setSelectedGrowTent(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '8px',
                color: '#e2e8f0',
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgba(74, 222, 128, 0.5)';
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.9)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.3)';
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)';
              }}
            >
              <option value="">All Tents</option>
              {uniqueGrowTents.map(tent => (
                <option key={tent} value={tent}>🏠 {tent}</option>
              ))}
            </select>
          </div>

          {/* Sort Options */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#cbd5e1' }}>
              Sort By
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(100, 116, 139, 0.3)',
                  borderRadius: '8px',
                  color: '#e2e8f0',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <option value="name">Name</option>
                <option value="strain">Strain</option>
                <option value="stage">Stage</option>
                <option value="grow_tent">Tent</option>
                <option value="planted_date">Planted Date</option>
                <option value="expected_harvest">Expected Harvest</option>
              </select>
              <button
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                style={{
                  padding: '0.75rem',
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(100, 116, 139, 0.3)',
                  borderRadius: '8px',
                  color: '#e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  minWidth: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title={`Sort ${sortDirection === 'asc' ? 'Ascending' : 'Descending'}`}
              >
                {sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Plants Display */}
      {loading ? (
        <div style={{
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '20px',
          border: '1px solid rgba(100, 116, 139, 0.2)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
          padding: '3rem 2rem',
          textAlign: 'center',
          animation: 'fadeInUp 0.6s ease-out'
        }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            margin: '0 auto 1rem',
            border: '4px solid rgba(100, 116, 139, 0.2)',
            borderTop: '4px solid #4ade80',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', fontWeight: '600', color: '#cbd5e1' }}>
            Loading {showArchived ? 'archived' : 'active'} plants...
          </h3>
        </div>
      ) : plants.length === 0 ? (
        <div style={{
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '20px',
          border: '1px solid rgba(100, 116, 139, 0.2)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
          padding: '3rem 2rem',
          textAlign: 'center',
          animation: 'fadeInUp 0.8s ease-out 0.2s both'
        }}>
          <Sprout style={{ width: '64px', height: '64px', color: '#475569', margin: '0 auto 1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', fontWeight: '600', color: '#cbd5e1' }}>
            {showArchived ? 'No archived plants yet' : 'No plants yet'}
          </h3>
          <p style={{ margin: '0 0 1.5rem 0', color: '#94a3b8' }}>
            {showArchived 
              ? 'When you archive plants, they will appear here with their grow data'
              : 'Start your cultivation journey by adding your first plant'
            }
          </p>
          {!showArchived && (
            <button
              onClick={() => setShowForm(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #4ade80, #22c55e)',
                color: 'white',
                borderRadius: '12px',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(74, 222, 128, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(74, 222, 128, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(74, 222, 128, 0.3)';
              }}
            >
              <Plus className="w-4 h-4" />
              Add Your First Plant
            </button>
          )}
        </div>
      ) : groupByTent ? (
        // Card Grid View - Original grouped by tent layout
        <div className="space-y-8" style={{ animation: 'fadeInUp 0.8s ease-out 0.4s both' }}>
          {Object.entries(groupedPlants).map(([tentName, tentPlants]) => (
            <div key={tentName} style={{
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '20px',
              border: '1px solid rgba(100, 116, 139, 0.2)',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div className="grow-tent-header" style={{ 
                marginBottom: '1.5rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid rgba(100, 116, 139, 0.2)'
              }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Home className="w-5 h-5" />
                    <h3 className="text-xl font-bold">{tentName}</h3>
                    <span className="grow-tent-count">
                      {tentPlants.filter(plant => {
                        const matchesArchived = showArchived ? plant.archived : !plant.archived;
                        const matchesSearch = 
                          plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (plant.strain && plant.strain.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (plant.grow_tent && plant.grow_tent.toLowerCase().includes(searchTerm.toLowerCase()));
                        
                        const matchesStage = !filterStage || plant.stage === filterStage;
                        const matchesTent = !selectedGrowTent || plant.grow_tent === selectedGrowTent;
                        
                        return matchesArchived && matchesSearch && matchesStage && matchesTent;
                      }).length} plant{tentPlants.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  {/* Tent Management Actions for Archived Grows */}
                  {showArchived && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleExportTent(tentName)}
                        style={{
                          padding: '0.5rem 1rem',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                        }}
                      >
                        <Download className="w-4 h-4" />
                        Export Tent Data
                      </button>
                      <button
                        onClick={() => handleClearTentData(tentName)}
                        style={{
                          padding: '0.5rem 1rem',
                          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                        }}
                      >
                        <AlertTriangle className="w-4 h-4" />
                        Clear Tent Data
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-2">
                {tentPlants
                  .filter(plant => {
                    const matchesArchived = showArchived ? plant.archived : !plant.archived;
                    const matchesSearch = 
                      plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (plant.strain && plant.strain.toLowerCase().includes(searchTerm.toLowerCase())) ||
                      (plant.grow_tent && plant.grow_tent.toLowerCase().includes(searchTerm.toLowerCase()));
                    
                    const matchesStage = !filterStage || plant.stage === filterStage;
                    const matchesTent = !selectedGrowTent || plant.grow_tent === selectedGrowTent;
                    
                    return matchesArchived && matchesSearch && matchesStage && matchesTent;
                  })
                  .sort((a, b) => {
                    let aValue = a[sortBy] || '';
                    let bValue = b[sortBy] || '';

                    if (sortBy === 'planted_date' || sortBy === 'expected_harvest') {
                      aValue = aValue ? new Date(aValue) : new Date(0);
                      bValue = bValue ? new Date(bValue) : new Date(0);
                    } else if (typeof aValue === 'string') {
                      aValue = aValue.toLowerCase();
                      bValue = bValue.toLowerCase();
                    }

                    if (sortDirection === 'asc') {
                      return aValue > bValue ? 1 : -1;
                    } else {
                      return aValue < bValue ? 1 : -1;
                    }
                  })
                  .map(plant => renderPlantCard(plant))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Table View - Modern table layout
        (() => {
          const filtered = filteredAndSortedPlants();
          
          return (
            <div style={{
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '20px',
              border: '1px solid rgba(100, 116, 139, 0.2)',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
              overflow: 'hidden',
              animation: 'fadeInUp 0.8s ease-out 0.4s both'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1.5rem 2rem',
                background: 'rgba(30, 41, 59, 0.8)',
                borderBottom: '1px solid rgba(100, 116, 139, 0.2)'
              }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#f8fafc' }}>
                  All Plants
                </h3>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  background: 'rgba(74, 222, 128, 0.1)',
                  color: '#4ade80',
                  borderRadius: '100px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  border: '1px solid rgba(74, 222, 128, 0.2)'
                }}>
                  {filtered.length} plant{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', fontSize: '0.875rem', textAlign: 'left', borderCollapse: 'collapse', minWidth: '1200px' }}>
                  <thead>
                    <tr style={{
                      background: 'rgba(30, 41, 59, 0.5)',
                      borderBottom: '1px solid rgba(100, 116, 139, 0.3)'
                    }}>
                      <th style={{ padding: '1rem', fontWeight: '600', color: '#e2e8f0', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', width: '18%' }}>
                        Plant Name
                      </th>
                      <th style={{ padding: '1rem', fontWeight: '600', color: '#e2e8f0', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', width: '13%' }}>
                        Strain
                      </th>
                      <th style={{ padding: '1rem', fontWeight: '600', color: '#e2e8f0', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', width: '12%' }}>
                        Grow Tent
                      </th>
                      <th style={{ padding: '1rem', fontWeight: '600', color: '#e2e8f0', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center', width: '10%' }}>
                        Stage
                      </th>
                      <th style={{ padding: '1rem', fontWeight: '600', color: '#e2e8f0', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', width: '13%' }}>
                        Planted Date
                      </th>
                      <th style={{ padding: '1rem', fontWeight: '600', color: '#e2e8f0', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center', width: '8%' }}>
                        Logs
                      </th>
                      <th style={{ padding: '1rem', fontWeight: '600', color: '#e2e8f0', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', width: '16%' }}>
                        Notes
                      </th>
                      <th style={{ padding: '1rem', fontWeight: '600', color: '#e2e8f0', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center', width: '10%' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((plant, index) => (
                      <tr 
                        key={plant.id}
                        style={{
                          borderBottom: index < filtered.length - 1 ? '1px solid rgba(100, 116, 139, 0.2)' : 'none',
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
                        <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                          <Link
                            to={`/plants/${plant.id}`}
                            style={{
                              color: '#4ade80',
                              fontWeight: '600',
                              textDecoration: 'none',
                              fontSize: '0.875rem',
                              transition: 'color 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = '#22c55e';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = '#4ade80';
                            }}
                          >
                            {plant.name}
                          </Link>
                        </td>
                        <td style={{ padding: '1rem', color: '#cbd5e1', verticalAlign: 'middle' }}>
                          {plant.strain || 'Unknown strain'}
                        </td>
                        <td style={{ padding: '1rem', color: '#cbd5e1', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <Home style={{ width: '12px', height: '12px', color: '#94a3b8' }} />
                            {plant.grow_tent || 'Unassigned'}
                          </div>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center', verticalAlign: 'middle' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0.375rem 0.75rem',
                            borderRadius: '100px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            background: getStageColor(plant.stage).bg,
                            color: getStageColor(plant.stage).color,
                            border: `1px solid ${getStageColor(plant.stage).border}`,
                            gap: '0.375rem',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                            textTransform: 'capitalize',
                            letterSpacing: '0.015em',
                            whiteSpace: 'nowrap',
                            minWidth: 'fit-content'
                          }}>
                            <span style={{ fontSize: '0.75rem' }}>{getStageIcon(plant.stage)}</span>
                            {plant.stage}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', color: '#cbd5e1', verticalAlign: 'middle' }}>
                          {plant.planted_date ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                              <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                                {format(new Date(plant.planted_date), 'MMM dd, yyyy')}
                              </span>
                              <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                                {formatDistanceToNow(new Date(plant.planted_date))} ago
                              </span>
                            </div>
                          ) : (
                            <span style={{ color: '#64748b', fontStyle: 'italic' }}>Not set</span>
                          )}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center', verticalAlign: 'middle' }}>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            padding: '0.375rem 0.75rem',
                            background: 'rgba(34, 197, 94, 0.1)',
                            border: '1px solid rgba(34, 197, 94, 0.2)',
                            borderRadius: '6px',
                            color: '#22c55e'
                          }}>
                            <Sprout style={{ width: '12px', height: '12px' }} />
                            <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>
                              {plant.log_count || 0}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                          <span style={{
                            color: '#cbd5e1',
                            fontSize: '0.875rem',
                            lineHeight: '1.4',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {plant.notes || 'No notes'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                            {!plant.archived && (
                              <button
                                onClick={() => handleClone(plant)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  padding: '0.5rem',
                                  background: 'rgba(168, 85, 247, 0.1)',
                                  color: '#a855f7',
                                  borderRadius: '8px',
                                  border: '1px solid rgba(168, 85, 247, 0.2)',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = 'rgba(168, 85, 247, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'rgba(168, 85, 247, 0.1)';
                                }}
                                title="Clone Plant"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              onClick={() => handleEdit(plant)}
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
                              title="Edit Plant"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => plant.archived ? handleArchive(plant) : openArchiveModal(plant)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '0.5rem',
                                background: 'rgba(245, 158, 11, 0.1)',
                                color: '#f59e0b',
                                borderRadius: '8px',
                                border: '1px solid rgba(245, 158, 11, 0.2)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(245, 158, 11, 0.2)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)';
                              }}
                              title={plant.archived ? "Unarchive Plant" : "Archive Plant"}
                            >
                              {plant.archived ? <ArchiveRestore className="w-3 h-3" /> : <Archive className="w-3 h-3" />}
                            </button>
                            <button
                              onClick={() => handleDelete(plant)}
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
                              title="Delete Plant"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '20px',
            border: '1px solid rgba(100, 116, 139, 0.2)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            padding: '2rem',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{
              margin: '0 0 1.5rem 0',
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#f8fafc',
              textAlign: 'center'
            }}>
              {editingPlant ? 'Edit Plant' : 'Add New Plant'}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#cbd5e1' }}>
                    Plant Name *
                  </label>
                  <input
                    type="text"
                    {...register('name', { required: 'Plant name is required' })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: errors.name ? '1px solid #ef4444' : '1px solid rgba(100, 116, 139, 0.3)',
                      borderRadius: '8px',
                      color: '#e2e8f0',
                      fontSize: '0.875rem'
                    }}
                  />
                  {errors.name && (
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#ef4444' }}>
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#cbd5e1' }}>
                    Strain
                  </label>
                  <input
                    type="text"
                    {...register('strain')}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(100, 116, 139, 0.3)',
                      borderRadius: '8px',
                      color: '#e2e8f0',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#cbd5e1' }}>
                    Growth Stage *
                  </label>
                  <select
                    {...register('stage', { required: 'Growth stage is required' })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: errors.stage ? '1px solid #ef4444' : '1px solid rgba(100, 116, 139, 0.3)',
                      borderRadius: '8px',
                      color: '#e2e8f0',
                      fontSize: '0.875rem',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">Select Stage</option>
                    <option value="seedling">🌱 Seedling</option>
                    <option value="vegetative">🌿 Vegetative</option>
                    <option value="flowering">🌸 Flowering</option>
                    <option value="harvest">✂️ Harvest</option>
                    <option value="drying">🌾 Drying</option>
                    <option value="curing">📦 Curing</option>
                    <option value="cured">🏆 Cured</option>
                  </select>
                  {errors.stage && (
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#ef4444' }}>
                      {errors.stage.message}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#cbd5e1' }}>
                    Grow Tent
                  </label>
                  <input
                    type="text"
                    {...register('grow_tent')}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(100, 116, 139, 0.3)',
                      borderRadius: '8px',
                      color: '#e2e8f0',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#cbd5e1' }}>
                    Planted Date
                  </label>
                  <input
                    type="date"
                    {...register('planted_date')}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(100, 116, 139, 0.3)',
                      borderRadius: '8px',
                      color: '#e2e8f0',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#cbd5e1' }}>
                    Expected Harvest
                  </label>
                  <input
                    type="date"
                    {...register('expected_harvest')}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(100, 116, 139, 0.3)',
                      borderRadius: '8px',
                      color: '#e2e8f0',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#cbd5e1' }}>
                  Notes
                </label>
                <textarea
                  {...register('notes')}
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid rgba(100, 116, 139, 0.3)',
                    borderRadius: '8px',
                    color: '#e2e8f0',
                    fontSize: '0.875rem',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'rgba(100, 116, 139, 0.2)',
                    color: '#cbd5e1',
                    border: '1px solid rgba(100, 116, 139, 0.3)',
                    borderRadius: '8px',
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
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #4ade80, #22c55e)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(74, 222, 128, 0.3)'
                  }}
                >
                  {editingPlant ? 'Update Plant' : 'Add Plant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Archive Modal */}
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
    </div>
  );
};

// Archive Modal Component
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
      harvest_date: harvestDate
    };
    
    await onArchive(plant, archiveData);
    setLoading(false);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          borderRadius: '16px',
          padding: '2rem',
          width: '90%',
          maxWidth: '500px',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#f1f5f9', marginBottom: '0.5rem' }}>
            Archive Plant: {plant.name}
          </h2>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.875rem' }}>
            Archive this plant and preserve all environment data from the grow
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#cbd5e1' }}>
              Archive Reason
            </label>
            <select
              value={archiveReason}
              onChange={(e) => setArchiveReason(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '8px',
                color: '#f1f5f9',
                fontSize: '0.875rem'
              }}
              required
            >
              <option value="completed">Completed Harvest</option>
              <option value="died">Plant Died</option>
              <option value="removed">Removed Early</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#cbd5e1' }}>
              Final Yield (grams) - Optional
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={finalYield}
              onChange={(e) => setFinalYield(e.target.value)}
              placeholder="Enter yield in grams"
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '8px',
                color: '#f1f5f9',
                fontSize: '0.875rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#cbd5e1' }}>
              Harvest/Archive Date
            </label>
            <input
              type="date"
              value={harvestDate}
              onChange={(e) => setHarvestDate(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '8px',
                color: '#f1f5f9',
                fontSize: '0.875rem'
              }}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'rgba(100, 116, 139, 0.2)',
                color: '#cbd5e1',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                background: loading ? 'rgba(245, 158, 11, 0.5)' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
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