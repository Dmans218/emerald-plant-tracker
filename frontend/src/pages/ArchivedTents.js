import React, { useState, useEffect } from 'react';
import { Archive, ArrowLeft, Calendar, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const ArchivedTents = () => {
  const [archivedTents, setArchivedTents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArchivedTents();
  }, []);

  const fetchArchivedTents = async () => {
    try {
      const response = await fetch('/api/tents?status=archived');
      const data = await response.json();
      setArchivedTents(data);
    } catch (error) {
      console.error('Error fetching archived tents:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTent = async (tentId) => {
    if (!window.confirm('Are you sure you want to permanently delete this tent?')) {
      return;
    }

    try {
      await fetch(`/api/tents/${tentId}`, {
        method: 'DELETE',
      });
      setArchivedTents(archivedTents.filter(tent => tent.id !== tentId));
    } catch (error) {
      console.error('Error deleting tent:', error);
    }
  };

  const restoreTent = async (tentId) => {
    try {
      await fetch(`/api/tents/${tentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'active' }),
      });
      setArchivedTents(archivedTents.filter(tent => tent.id !== tentId));
    } catch (error) {
      console.error('Error restoring tent:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-500">Loading archived tents...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          to="/tent-setup"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Tent Setup
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Archive className="text-gray-600" size={24} />
          <h1 className="text-2xl font-bold text-gray-900">Archived Tents</h1>
        </div>

        {archivedTents.length === 0 ? (
          <div className="text-center py-12">
            <Archive className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No archived tents</h3>
            <p className="text-gray-500">When you archive tents, they'll appear here.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {archivedTents.map((tent) => (
              <div key={tent.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{tent.name}</h3>
                    <p className="text-sm text-gray-600">{tent.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        Archived: {format(new Date(tent.archivedAt), 'MMM d, yyyy')}
                      </div>
                      <div>Size: {tent.size}</div>
                      <div>Plants: {tent.plantCount || 0}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => restoreTent(tent.id)}
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => deleteTent(tent.id)}
                      className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArchivedTents;
