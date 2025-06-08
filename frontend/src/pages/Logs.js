import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, FileText, Filter, Search } from 'lucide-react';
import { format } from 'date-fns';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    plantId: '',
    search: '',
    dateFrom: '',
    dateTo: ''
  });

  useEffect(() => {
    fetchLogs();
    fetchPlants();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/logs');
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlants = async () => {
    try {
      const response = await fetch('/api/plants');
      const data = await response.json();
      setPlants(data);
    } catch (error) {
      console.error('Error fetching plants:', error);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesPlant = !filters.plantId || log.plant_id === parseInt(filters.plantId);
    const matchesSearch = !filters.search || 
      log.notes?.toLowerCase().includes(filters.search.toLowerCase()) ||
      log.activity_type?.toLowerCase().includes(filters.search.toLowerCase());
    
    const logDate = new Date(log.date);
    const matchesDateFrom = !filters.dateFrom || logDate >= new Date(filters.dateFrom);
    const matchesDateTo = !filters.dateTo || logDate <= new Date(filters.dateTo);
    
    return matchesPlant && matchesSearch && matchesDateFrom && matchesDateTo;
  });

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      plantId: '',
      search: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  const getActivityIcon = (activityType) => {
    const icons = {
      watering: '💧',
      feeding: '🌱',
      transplanting: '🪴',
      pruning: '✂️',
      training: '🔧',
      observation: '👀',
      harvest: '🌾',
      other: '📝'
    };
    return icons[activityType] || icons.other;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-500">Loading logs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="text-green-600" size={24} />
          <h1 className="text-2xl font-bold text-gray-900">Grow Logs</h1>
        </div>

        {/* Filters */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={18} className="text-gray-600" />
            <span className="font-medium text-gray-700">Filters</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plant
              </label>
              <select
                value={filters.plantId}
                onChange={(e) => handleFilterChange('plantId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Plants</option>
                {plants.map(plant => (
                  <option key={plant.id} value={plant.id}>
                    {plant.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search notes or activity..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Logs List */}
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No logs found</h3>
            <p className="text-gray-500">
              {logs.length === 0 
                ? "Start logging your grow activities to track your plants' progress."
                : "No logs match your current filters."
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <div key={log.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getActivityIcon(log.activity_type)}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900 capitalize">
                          {log.activity_type?.replace('_', ' ')}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {plants.find(p => p.id === log.plant_id)?.name || 'Unknown Plant'}
                        </p>
                      </div>
                    </div>
                    
                    {log.notes && (
                      <p className="text-gray-700 mb-2">{log.notes}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {format(new Date(log.date), 'MMM d, yyyy')}
                      </div>
                      {log.water_amount && (
                        <div>Water: {log.water_amount}ml</div>
                      )}
                      {log.nutrient_ppm && (
                        <div>PPM: {log.nutrient_ppm}</div>
                      )}
                      {log.ph_level && (
                        <div>pH: {log.ph_level}</div>
                      )}
                    </div>
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

export default Logs;
