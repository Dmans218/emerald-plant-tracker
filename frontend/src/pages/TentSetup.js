import React, { useState, useEffect } from 'react';
import { Plus, Home, Archive, Edit3, Trash2, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const TentSetup = () => {
  const [tents, setTents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTent, setEditingTent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTents();
  }, []);

  const fetchTents = async () => {
    try {
      const response = await fetch('/api/tents');
      const data = await response.json();
      setTents(data);
    } catch (error) {
      console.error('Error fetching tents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      const url = editingTent ? `/api/tents/${editingTent.id}` : '/api/tents';
      const method = editingTent ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchTents();
        setShowForm(false);
        setEditingTent(null);
      }
    } catch (error) {
      console.error('Error saving tent:', error);
    }
  };

  const archiveTent = async (tentId) => {
    try {
      await fetch(`/api/tents/${tentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'archived' }),
      });
      await fetchTents();
    } catch (error) {
      console.error('Error archiving tent:', error);
    }
  };

  const deleteTent = async (tentId) => {
    if (!window.confirm('Are you sure you want to delete this tent?')) {
      return;
    }

    try {
      await fetch(`/api/tents/${tentId}`, {
        method: 'DELETE',
      });
      await fetchTents();
    } catch (error) {
      console.error('Error deleting tent:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-500">Loading tents...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Home className="text-green-600" size={24} />
            <h1 className="text-2xl font-bold text-gray-900">Tent Setup</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/archived-tents"
              className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Archive size={16} />
              Archived Tents
            </Link>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Plus size={16} />
              Add Tent
            </button>
          </div>
        </div>

        {tents.length === 0 ? (
          <div className="text-center py-12">
            <Home className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tents configured</h3>
            <p className="text-gray-500 mb-4">Set up your first grow tent to get started.</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Plus size={16} />
              Add Your First Tent
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tents.map((tent) => (
              <TentCard
                key={tent.id}
                tent={tent}
                onEdit={(tent) => {
                  setEditingTent(tent);
                  setShowForm(true);
                }}
                onArchive={archiveTent}
                onDelete={deleteTent}
              />
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <TentForm
          tent={editingTent}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingTent(null);
          }}
        />
      )}
    </div>
  );
};

const TentCard = ({ tent, onEdit, onArchive, onDelete }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{tent.name}</h3>
          <p className="text-sm text-gray-600">{tent.description}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(tent)}
            className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={() => onArchive(tent.id)}
            className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
          >
            <Archive size={16} />
          </button>
          <button
            onClick={() => onDelete(tent.id)}
            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Size:</span>
          <span className="font-medium">{tent.size}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Lighting:</span>
          <span className="font-medium">{tent.lighting || 'Not specified'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Ventilation:</span>
          <span className="font-medium">{tent.ventilation || 'Not specified'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Plants:</span>
          <span className="font-medium">{tent.plant_count || 0}</span>
        </div>
      </div>

      {tent.notes && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">{tent.notes}</p>
        </div>
      )}
    </div>
  );
};

const TentForm = ({ tent, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: tent?.name || '',
    description: tent?.description || '',
    size: tent?.size || '',
    lighting: tent?.lighting || '',
    ventilation: tent?.ventilation || '',
    notes: tent?.notes || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="text-green-600" size={24} />
            <h2 className="text-xl font-bold text-gray-900">
              {tent ? 'Edit Tent' : 'Add New Tent'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tent Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Main Tent, Veg Tent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Brief description of this tent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Size *
              </label>
              <select
                required
                value={formData.size}
                onChange={(e) => handleChange('size', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select size</option>
                <option value="2x2">2' x 2'</option>
                <option value="2x4">2' x 4'</option>
                <option value="3x3">3' x 3'</option>
                <option value="4x4">4' x 4'</option>
                <option value="4x8">4' x 8'</option>
                <option value="5x5">5' x 5'</option>
                <option value="8x8">8' x 8'</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lighting Setup
              </label>
              <input
                type="text"
                value={formData.lighting}
                onChange={(e) => handleChange('lighting', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., 600W HPS, LED Quantum Board"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ventilation
              </label>
              <input
                type="text"
                value={formData.ventilation}
                onChange={(e) => handleChange('ventilation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., 6' inline fan, carbon filter"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Additional notes about this tent setup"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                {tent ? 'Update' : 'Create'} Tent
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TentSetup;
