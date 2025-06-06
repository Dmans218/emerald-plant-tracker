import React, { useState, useEffect } from 'react';
import { Plus, Thermometer, Droplets, TestTube, Sun, Trash2, TrendingUp, Camera, Wind, Beaker, Edit, X, ZoomIn, ChevronDown, ChevronUp, Download, Save, RotateCcw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

import { environmentApi, plantsApi } from '../utils/api';
import ImageUpload from '../components/ImageUpload';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Environment = () => {
  const [environmentLogs, setEnvironmentLogs] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [latestReading, setLatestReading] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showWeekly, setShowWeekly] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [growTents, setGrowTents] = useState([]);
  const [selectedTent, setSelectedTent] = useState('');
  const [editingLog, setEditingLog] = useState(null);
  const [showRecentReadingsTable, setShowRecentReadingsTable] = useState(false);
  const [showEnvironmentSaveModal, setShowEnvironmentSaveModal] = useState(false);
  const [plants, setPlants] = useState([]);

  const [detailModal, setDetailModal] = useState({ isOpen: false, metric: null, title: '' });

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  useEffect(() => {
    fetchEnvironmentData();
    fetchLatestReading();
    fetchWeeklyData();
    fetchGrowTents();
    fetchPlants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchEnvironmentData();
    fetchLatestReading();
    fetchWeeklyData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTent]);

  const fetchEnvironmentData = async () => {
    try {
      setLoading(true);
      const params = { limit: 50 };
      if (selectedTent) {
        params.grow_tent = selectedTent;
      }
      const data = await environmentApi.getAll(params);
      setEnvironmentLogs(data);
    } catch (error) {
      toast.error('Failed to load environment data');
      console.error('Environment fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestReading = async () => {
    try {
      const params = {};
      if (selectedTent) {
        params.grow_tent = selectedTent;
      }
      const data = await environmentApi.getLatest(params);
      setLatestReading(data);
    } catch (error) {
      console.error('Latest reading fetch error:', error);
    }
  };

  const fetchWeeklyData = async () => {
    try {
      const params = { weeks: 8 };
      if (selectedTent) {
        params.grow_tent = selectedTent;
      }
      const data = await environmentApi.getWeekly(params);
      setWeeklyData(data);
    } catch (error) {
      console.error('Weekly data fetch error:', error);
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

  const fetchPlants = async () => {
    try {
      const data = await plantsApi.getAll();
      setPlants(data);
    } catch (error) {
      console.error('Plants fetch error:', error);
    }
  };

  const onSubmit = async (data) => {
    try {
      // Convert form data to proper types
      const environmentData = {
        ...data,
        temperature: data.temperature ? parseFloat(data.temperature) : null,
        humidity: data.humidity ? parseFloat(data.humidity) : null,
        ph_level: data.ph_level ? parseFloat(data.ph_level) : null,
        light_hours: data.light_hours ? parseFloat(data.light_hours) : null,
        vpd: data.vpd ? parseFloat(data.vpd) : null,
        co2_ppm: data.co2_ppm ? parseFloat(data.co2_ppm) : null,
        ppfd: data.ppfd ? parseFloat(data.ppfd) : null,
        logged_at: data.logged_at || new Date().toISOString(),
      };

      if (editingLog) {
        // Update existing log
        await environmentApi.update(editingLog.id, environmentData);
        toast.success('Environment data updated successfully');
      } else {
        // Create new log
        await environmentApi.create(environmentData);
        toast.success('Environment data added successfully');
      }
      
      fetchEnvironmentData();
      fetchLatestReading();
      fetchWeeklyData();
      resetForm();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEdit = (log) => {
    setEditingLog(log);
    
    // Format the logged_at date for the datetime-local input
    const formattedDate = format(new Date(log.logged_at), "yyyy-MM-dd'T'HH:mm");
    
    // Populate form with existing data
    reset({
      grow_tent: log.grow_tent || '',
      temperature: log.temperature || '',
      humidity: log.humidity || '',
      ph_level: log.ph_level || '',
      light_hours: log.light_hours || '',
      vpd: log.vpd || '',
      co2_ppm: log.co2_ppm || '',
      ppfd: log.ppfd || '',
      growth_stage: log.growth_stage || '',
      logged_at: formattedDate,
      notes: log.notes || ''
    });
    
    setShowForm(true);
    toast.success('Editing environment log. Make your changes and save.');
  };

  const handleDelete = async (logId) => {
    if (window.confirm('Are you sure you want to delete this environment log?')) {
      try {
        await environmentApi.delete(logId);
        toast.success('Environment log deleted successfully');
        fetchEnvironmentData();
        fetchLatestReading();
        fetchWeeklyData();
      } catch (error) {
        toast.error('Failed to delete environment log');
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingLog(null);
    reset();
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    return format(now, "yyyy-MM-dd'T'HH:mm");
  };

  const getInferredGrowthStage = () => {
    // If editing, use the existing growth stage
    if (editingLog && editingLog.growth_stage) {
      return editingLog.growth_stage;
    }

    // If a tent is selected, try to infer from plants in that tent
    if (selectedTent) {
      const plantsInTent = plants.filter(p => p.grow_tent === selectedTent);
      if (plantsInTent.length > 0) {
        // Find the most common stage among plants in this tent
        const stageCounts = plantsInTent.reduce((acc, plant) => {
          acc[plant.stage] = (acc[plant.stage] || 0) + 1;
          return acc;
        }, {});
        
        // Return the most common stage
        const mostCommonStage = Object.entries(stageCounts)
          .sort(([,a], [,b]) => b - a)[0]?.[0];
        
        if (mostCommonStage) {
          toast.info(`Auto-selected ${mostCommonStage} stage based on plants in ${selectedTent}`);
          return mostCommonStage;
        }
      }
    }

    // Default to empty (user must select)
    return '';
  };

  const getImageDateTime = (parsedData) => {
    // Use timestamp from image metadata if available, otherwise use current time
    if (parsedData.timestamp) {
      try {
        const imageDate = new Date(parsedData.timestamp);
        return format(imageDate, "yyyy-MM-dd'T'HH:mm");
      } catch (error) {
        console.error('Error parsing image timestamp:', error);
        return getCurrentDateTime();
      }
    }
    return getCurrentDateTime();
  };

  const handleImageData = (parsedData) => {
    // Convert parsed data to form format and populate form
    const formData = {
      logged_at: getImageDateTime(parsedData),
      grow_tent: selectedTent || '', // Use selected tent or leave empty
    };

    // Map parsed values to form fields (convert Celsius to Fahrenheit if needed)
    if (parsedData.temperature !== null) {
      // Assume parsed temperature is in Celsius, convert to Fahrenheit
      formData.temperature = ((parsedData.temperature * 9/5) + 32).toFixed(1);
    }
    if (parsedData.humidity !== null) {
      formData.humidity = parsedData.humidity.toString();
    }
    if (parsedData.ph !== null) {
      formData.ph_level = parsedData.ph.toString();
    }
    if (parsedData.vpd !== null) {
      formData.vpd = parsedData.vpd.toString();
    }
    if (parsedData.co2 !== null) {
      formData.co2_ppm = parsedData.co2.toString();
    }
    if (parsedData.ppfd !== null) {
      formData.ppfd = parsedData.ppfd.toString();
    }

    // Reset form with the parsed data
    reset(formData);
    setShowForm(true);
    
    const timeSource = parsedData.timestamp ? 'photo timestamp' : 'current time';
    toast.success(`Data from image has been loaded into the form using ${timeSource}. Please review and submit.`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="loading"></div>
      </div>
    );
  }

  const openDetailModal = (metric, title) => {
    setDetailModal({ isOpen: true, metric, title });
  };

  const closeDetailModal = () => {
    setDetailModal({ isOpen: false, metric: null, title: '' });
  };

  const getMetricIcon = (metric) => {
    const icons = {
      temperature: <Thermometer className="w-5 h-5" />,
      humidity: <Droplets className="w-5 h-5" />,
      vpd: <Wind className="w-5 h-5" />,
      co2_ppm: <Beaker className="w-5 h-5" />,
      ppfd: <Sun className="w-5 h-5" />,
      ph_level: <TestTube className="w-5 h-5" />,
    };
    return icons[metric] || <TrendingUp className="w-5 h-5" />;
  };

  const getMetricColor = (metric) => {
    const colors = {
      temperature: '#ef4444',
      humidity: '#3b82f6',
      vpd: '#06b6d4',
      co2_ppm: '#10b981',
      ppfd: '#f59e0b',
      ph_level: '#84cc16',
    };
    return colors[metric] || '#4ade80';
  };

  const exportToCSV = () => {
    if (environmentLogs.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = [
      'Date',
      'Time',
      'Grow Tent',
      'Growth Stage',
      'Temperature (°F)',
      'Humidity (%)',
      'pH Level',
      'Light Hours',
      'VPD (kPa)',
      'CO₂ (ppm)',
      'PPFD (μmol)',
      'Notes'
    ];

    const csvData = environmentLogs.map(log => [
      format(new Date(log.logged_at), 'yyyy-MM-dd'),
      format(new Date(log.logged_at), 'HH:mm'),
      log.grow_tent || '',
      log.growth_stage || '',
      log.temperature || '',
      log.humidity || '',
      log.ph_level || '',
      log.light_hours || '',
      log.vpd || '',
      log.co2_ppm || '',
      log.ppfd || '',
      (log.notes || '').replace(/,/g, ';') // Replace commas to avoid CSV issues
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `environment-data-${selectedTent || 'all-tents'}-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Environment data exported to CSV');
  };

  const saveEnvironmentSession = async (sessionName, associatedPlants) => {
    try {
      // This would be a new API endpoint to save environment sessions
      const sessionData = {
        name: sessionName,
        grow_tent: selectedTent,
        plant_ids: associatedPlants,
        environment_logs: environmentLogs.map(log => log.id),
        created_at: new Date().toISOString()
      };

      // TODO: Implement backend endpoint for environment sessions
      // await environmentApi.createSession(sessionData);
      console.log('Session data to be saved:', sessionData); // For now, log the data
      
      toast.success(`Environment session "${sessionName}" saved successfully!`);
      setShowEnvironmentSaveModal(false);
    } catch (error) {
      toast.error('Failed to save environment session');
    }
  };

  const startNewEnvironment = async () => {
    if (window.confirm('Are you sure you want to start a new environment? This will archive current readings.')) {
      try {
        // TODO: Implement backend endpoint to archive current environment
        // await environmentApi.archiveCurrentEnvironment(selectedTent);
        
        setEnvironmentLogs([]);
        setLatestReading({});
        toast.success('New environment started! Previous data has been archived.');
      } catch (error) {
        toast.error('Failed to start new environment');
      }
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="header-text">
              <h1 className="dashboard-title">🌡️ Environment Control</h1>
              <p className="dashboard-subtitle">
                Monitor & log your grow environment conditions
                {selectedTent && ` for ${selectedTent}`}
              </p>
            </div>
            <div className="header-actions">
              <div className="flex items-center gap-3">
                <label htmlFor="tent-select" className="text-sm font-medium text-gray-400">
                  Filter by tent:
                </label>
                <select
                  id="tent-select"
                  value={selectedTent}
                  onChange={(e) => setSelectedTent(e.target.value)}
                  className="select tent-select-compact"
                >
                  <option value="">All Tents</option>
                  {growTents.map((tent) => (
                    <option key={tent.grow_tent} value={tent.grow_tent}>
                      {tent.grow_tent} ({tent.plant_count} plants)
                    </option>
                  ))}
                </select>
                {selectedTent && (
                  <button
                    onClick={() => setSelectedTent('')}
                    className="btn btn-outline btn-sm"
                    type="button"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowWeekly(!showWeekly)}
                className={`btn ${showWeekly ? 'btn-secondary' : 'btn-outline'}`}
                type="button"
              >
                <TrendingUp className="w-4 h-4" />
                {showWeekly ? 'Show Logs' : 'Weekly Stats'}
              </button>
              <button
                onClick={() => setShowImageUpload(true)}
                className="btn btn-accent"
                type="button"
              >
                <Camera className="w-4 h-4" />
                From Screenshot
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="btn btn-primary"
                type="button"
              >
                <Plus className="w-4 h-4" />
                Manual Entry
              </button>
            </div>
          </div>
        </div>

        {/* Latest Reading Cards */}
        {latestReading.id && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-info">
                  <div className="stat-label">Temperature</div>
                  <div className="stat-value">
                    {latestReading.temperature ? `${latestReading.temperature}°F` : 'N/A'}
                  </div>
                </div>
                <div className="stat-icon">
                  <Thermometer className="w-6 h-6" />
                </div>
              </div>
              <div className="stat-visual"></div>
            </div>
            
            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-info">
                  <div className="stat-label">Humidity</div>
                  <div className="stat-value">
                    {latestReading.humidity ? `${latestReading.humidity}%` : 'N/A'}
                  </div>
                </div>
                <div className="stat-icon">
                  <Droplets className="w-6 h-6" />
                </div>
              </div>
              <div className="stat-visual"></div>
            </div>
            
            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-info">
                  <div className="stat-label">VPD</div>
                  <div className="stat-value">
                    {latestReading.vpd ? `${latestReading.vpd} kPa` : 'N/A'}
                  </div>
                </div>
                <div className="stat-icon">
                  <Wind className="w-6 h-6" />
                </div>
              </div>
              <div className="stat-visual"></div>
            </div>
            
            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-info">
                  <div className="stat-label">CO₂</div>
                  <div className="stat-value">
                    {latestReading.co2_ppm ? `${latestReading.co2_ppm} ppm` : 'N/A'}
                  </div>
                </div>
                <div className="stat-icon">
                  <Beaker className="w-6 h-6" />
                </div>
              </div>
              <div className="stat-visual"></div>
            </div>
            
            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-info">
                  <div className="stat-label">PPFD</div>
                  <div className="stat-value">
                    {latestReading.ppfd ? `${latestReading.ppfd} μmol` : 'N/A'}
                  </div>
                </div>
                <div className="stat-icon">
                  <Sun className="w-6 h-6" />
                </div>
              </div>
              <div className="stat-visual"></div>
            </div>
            
            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-info">
                  <div className="stat-label">pH Level</div>
                  <div className="stat-value">
                    {latestReading.ph_level ? latestReading.ph_level.toFixed(1) : 'N/A'}
                  </div>
                </div>
                <div className="stat-icon">
                  <TestTube className="w-6 h-6" />
                </div>
              </div>
              <div className="stat-visual"></div>
            </div>
          </div>
        )}

        {/* Add Form */}
        {showForm && (
          <div className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">📊 {editingLog ? 'Edit Environment Reading' : 'Add Environment Reading'}</h2>
              <button
                onClick={resetForm}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>

            <div className="section-content">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-3 gap-4">
                  <div className="form-group">
                    <label className="label">Grow Tent</label>
                    <input
                      type="text"
                      className="input"
                      {...register('grow_tent')}
                      placeholder="e.g., Tent 1, Main Room"
                      list="grow-tent-options"
                      defaultValue={selectedTent}
                    />
                    <datalist id="grow-tent-options">
                      {growTents.map((tent) => (
                        <option key={tent.grow_tent} value={tent.grow_tent} />
                      ))}
                    </datalist>
                  </div>

                  <div className="form-group">
                    <label className="label">Temperature (°F)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input"
                      {...register('temperature')}
                      placeholder="e.g., 75.5"
                    />

                  </div>

                  <div className="form-group">
                    <label className="label">Humidity (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input"
                      {...register('humidity')}
                      placeholder="e.g., 65.0"
                    />

                  </div>

                  <div className="form-group">
                    <label className="label">VPD (kPa)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input"
                      {...register('vpd')}
                      placeholder="e.g., 1.2"
                    />

                  </div>

                  <div className="form-group">
                    <label className="label">CO₂ (ppm)</label>
                    <input
                      type="number"
                      className="input"
                      {...register('co2_ppm')}
                      placeholder="e.g., 1200"
                    />

                  </div>

                  <div className="form-group">
                    <label className="label">PPFD (μmol/m²/s)</label>
                    <input
                      type="number"
                      className="input"
                      {...register('ppfd')}
                      placeholder="e.g., 800"
                    />

                  </div>

                  <div className="form-group">
                    <label className="label">pH Level</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input"
                      {...register('ph_level')}
                      placeholder="e.g., 6.5"
                    />

                  </div>

                  <div className="form-group">
                    <label className="label">Light Hours</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input"
                      {...register('light_hours')}
                      placeholder="e.g., 18.0"
                    />

                  </div>

                  <div className="form-group">
                    <label className="label">Date & Time</label>
                    <input
                      type="datetime-local"
                      className="input"
                      {...register('logged_at')}
                      defaultValue={getCurrentDateTime()}
                    />
                  </div>

                  <div className="form-group">
                    <label className="label">Growth Stage</label>
                    <select
                      className="select"
                      {...register('growth_stage')}
                      defaultValue={getInferredGrowthStage()}
                    >
                      <option value="">Select stage</option>
                      <option value="seedling">🌱 Seedling</option>
                      <option value="vegetative">🌿 Vegetative</option>
                      <option value="flowering">🌸 Flowering</option>
                      <option value="harvest">🌾 Harvest</option>
                      <option value="cured">📦 Cured</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Stage at time of reading
                    </p>
                  </div>
                </div>

              <div className="form-group">
                <label className="label">Notes</label>
                <textarea
                  className="input textarea"
                  {...register('notes')}
                  placeholder="Any observations about environmental conditions..."
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
                  {editingLog ? 'Update Reading' : 'Add Reading'}
                </button>
              </div>
            </form>
            </div>
          </div>
        )}

        {/* Weekly Stats View */}
        {showWeekly ? (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Weekly Averages</h2>
            {weeklyData.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No weekly data available</p>
            ) : (
              <div className="space-y-4">
                {weeklyData.map((week, index) => (
                  <div key={week.week} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">
                        Week of {format(new Date(week.week_start), 'MMM dd, yyyy')}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {week.reading_count} readings
                      </span>
                    </div>
                    <div className="grid grid-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-medium text-red-600">
                          {week.avg_temperature ? `${week.avg_temperature.toFixed(1)}°F` : 'N/A'}
                        </div>
                        <div className="text-gray-500">Avg Temp</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-blue-600">
                          {week.avg_humidity ? `${week.avg_humidity.toFixed(1)}%` : 'N/A'}
                        </div>
                        <div className="text-gray-500">Avg Humidity</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-green-600">
                          {week.avg_ph_level ? week.avg_ph_level.toFixed(1) : 'N/A'}
                        </div>
                        <div className="text-gray-500">Avg pH</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-yellow-600">
                          {week.avg_light_hours ? `${week.avg_light_hours.toFixed(1)}h` : 'N/A'}
                        </div>
                        <div className="text-gray-500">Avg Light</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="card">
            {/* Environment Logs */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Readings</h2>
              <div className="flex items-center gap-2">
                {environmentLogs.length > 0 && (
                  <>
                    <button
                      onClick={startNewEnvironment}
                      className="btn btn-outline btn-sm"
                      title="Start New Environment"
                    >
                      <RotateCcw className="w-4 h-4" />
                      New Environment
                    </button>
                    <button
                      onClick={exportToCSV}
                      className="btn btn-accent btn-sm"
                      title="Export to CSV"
                    >
                      <Download className="w-4 h-4" />
                      Export CSV
                    </button>
                  </>
                )}
              </div>
            </div>

            {environmentLogs.length === 0 ? (
              <div className="text-center py-12">
                <Thermometer className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No environment data yet</h3>
                <p className="text-gray-500 mb-4">Start tracking your grow environment conditions</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="btn btn-primary"
                >
                  <Plus className="w-4 h-4" />
                  Add First Reading
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2 font-medium text-gray-700">Date/Time</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-700">Tent</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-700">Stage</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-700">Temp</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-700">Humidity</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-700">pH</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-700">Light</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-700">VPD</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-700">CO₂</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-700">PPFD</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-700">Notes</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {environmentLogs.map((log) => (
                      <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 px-2">
                          <div className="text-xs">
                            <div className="font-medium">{format(new Date(log.logged_at), 'MMM dd')}</div>
                            <div className="text-gray-500">{format(new Date(log.logged_at), 'HH:mm')}</div>
                          </div>
                        </td>
                        <td className="py-2 px-2 text-xs">{log.grow_tent || '-'}</td>
                        <td className="py-2 px-2 text-xs">
                          {log.growth_stage && (
                            <span className={`stage-badge stage-${log.growth_stage}`}>{log.growth_stage === 'seedling' && '🌱'}{log.growth_stage === 'vegetative' && '🌿'}{log.growth_stage === 'flowering' && '🌸'}{log.growth_stage === 'harvest' && '🌾'}{log.growth_stage === 'cured' && '📦'}</span>
                          )}
                          {!log.growth_stage && '-'}
                        </td>
                        <td className="py-2 px-2 text-xs">{log.temperature ? `${log.temperature}°F` : '-'}</td>
                        <td className="py-2 px-2 text-xs">{log.humidity ? `${log.humidity}%` : '-'}</td>
                        <td className="py-2 px-2 text-xs">{log.ph_level ? log.ph_level : '-'}</td>
                        <td className="py-2 px-2 text-xs">{log.light_hours ? `${log.light_hours}h` : '-'}</td>
                        <td className="py-2 px-2 text-xs">{log.vpd ? `${log.vpd}kPa` : '-'}</td>
                        <td className="py-2 px-2 text-xs">{log.co2_ppm ? `${log.co2_ppm}ppm` : '-'}</td>
                        <td className="py-2 px-2 text-xs">{log.ppfd ? `${log.ppfd}μmol` : '-'}</td>
                        <td className="py-2 px-2 text-xs max-w-32 truncate" title={log.notes}>{log.notes || '-'}</td>
                        <td className="py-2 px-2">
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEdit(log)}
                              className="btn btn-secondary btn-xs h-6 w-6 p-0 flex items-center justify-center"
                              title="Edit Reading"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDelete(log.id)}
                              className="btn btn-danger btn-xs h-6 w-6 p-0 flex items-center justify-center"
                              title="Delete Reading"
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
            )}
          </div>
        )}

        {/* Historical Graphs Section */}
        <div className="card mt-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">📊 Historical Trends</h2>
              <p className="text-gray-500 text-sm">Click any chart for detailed analysis</p>
            </div>
          </div>
          <div className="grid grid-2 gap-6">
                  {['temperature', 'humidity', 'vpd', 'co2_ppm', 'ppfd', 'ph_level'].map((metric) => {
          // Prepare data for the chart (always use daily data)
          const logs = environmentLogs;
          const labels = logs.map(log => 
            log.logged_at ? format(new Date(log.logged_at), 'MMM dd') : ''
          );
            const dataPoints = logs.map(log => log[metric] !== undefined && log[metric] !== null ? Number(log[metric]) : null);
            const metricNames = {
              temperature: 'Temperature (°F)',
              humidity: 'Humidity (%)',
              vpd: 'VPD (kPa)',
              co2_ppm: 'CO₂ (ppm)',
              ppfd: 'PPFD (μmol)',
              ph_level: 'pH Level',
            };
            const metricColor = getMetricColor(metric);
            
            return (
              <div 
                key={metric} 
                className="card cursor-pointer group relative overflow-hidden"
                onClick={() => openDetailModal(metric, metricNames[metric])}
              >
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <div className="bg-gray-800 text-white p-2 rounded-lg text-xs flex items-center gap-2">
                    <ZoomIn className="w-3 h-3" />
                    Click for detailed view
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div style={{ color: metricColor }}>
                    {getMetricIcon(metric)}
                  </div>
                  <h3 className="text-lg font-semibold">{metricNames[metric]}</h3>
                </div>
                <div className="pointer-events-none">
                  <Line
                    data={{
                      labels,
                      datasets: [
                        {
                          label: metricNames[metric],
                          data: dataPoints,
                          fill: false,
                          borderColor: metricColor,
                          backgroundColor: metricColor,
                          tension: 0.3,
                          pointRadius: 2,
                          pointHoverRadius: 4,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        title: { display: false },
                        tooltip: { enabled: false },
                      },
                      scales: {
                        x: { 
                          grid: { display: false },
                          ticks: { display: false }
                        },
                        y: { 
                          grid: { color: 'rgba(148,163,184,0.1)' },
                          ticks: { 
                            font: { size: 10 },
                            color: 'rgba(148,163,184,0.7)'
                          }
                        },
                      },
                      elements: {
                        point: { hoverRadius: 0 }
                      },
                      interaction: { intersect: false, mode: 'index' }
                    }}
                    height={140}
                  />
                </div>
              </div>
            );
          })}
          </div>
        </div>
      </div>

      {/* MODALS MOVED OUTSIDE of the main wrapping div to fix z-index issues */}
      
      {/* Environment Save Modal */}
      {showEnvironmentSaveModal && (
        <div className="modal-backdrop" onClick={() => setShowEnvironmentSaveModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Save Environment Session</h3>
              <button
                onClick={() => setShowEnvironmentSaveModal(false)}
                className="modal-close"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const sessionName = formData.get('sessionName');
                const selectedPlantIds = Array.from(formData.getAll('plants'));
                saveEnvironmentSession(sessionName, selectedPlantIds);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="label">Session Name</label>
                    <input
                      name="sessionName"
                      type="text"
                      className="input"
                      placeholder="e.g., 'Northern Lights - Veg Week 4'"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Give this environment session a descriptive name
                    </p>
                  </div>
                  
                  <div>
                    <label className="label">Associate with Plants</label>
                    <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded p-3">
                      {plants
                        .filter(plant => !selectedTent || plant.grow_tent === selectedTent)
                        .map(plant => (
                          <label key={plant.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              name="plants"
                              value={plant.id}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm">
                              {plant.strain_name} 
                              {plant.grow_tent && <span className="text-gray-500">({plant.grow_tent})</span>}
                            </span>
                          </label>
                        ))}
                      {plants.filter(plant => !selectedTent || plant.grow_tent === selectedTent).length === 0 && (
                        <p className="text-gray-500 text-sm">No plants found for this tent</p>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Select plants that were grown under these environment conditions
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <h4 className="font-medium text-blue-900 mb-2">Session Summary</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• {environmentLogs.length} environment readings</li>
                      <li>• {selectedTent ? `Tent: ${selectedTent}` : 'All tents'}</li>
                      <li>• Date range: {environmentLogs.length > 0 && 
                        `${format(new Date(environmentLogs[0].logged_at), 'MMM dd')} - ${format(new Date(environmentLogs[environmentLogs.length - 1].logged_at), 'MMM dd')}`}
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button
                    type="button"
                    onClick={() => setShowEnvironmentSaveModal(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    <Save className="w-4 h-4" />
                    Save Session
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Image Upload Modal */}
      {showImageUpload && (
        <ImageUpload
          onDataParsed={handleImageData}
          onClose={() => setShowImageUpload(false)}
        />
      )}

      {/* Detailed Chart Modal */}
      {detailModal.isOpen && (
        <div className="modal-backdrop" onClick={closeDetailModal}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-3">
                <div style={{ color: getMetricColor(detailModal.metric) }}>
                  {getMetricIcon(detailModal.metric)}
                </div>
                <h3>{detailModal.title} - Detailed View</h3>
              </div>
              <button
                onClick={closeDetailModal}
                className="modal-close"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="modal-body">
              <div className="chart-container-large">
                {(() => {
                  const logs = environmentLogs;
                  const labels = logs.map(log => 
                    log.logged_at ? format(new Date(log.logged_at), 'MMM dd HH:mm') : ''
                  );
                  const dataPoints = logs.map(log => log[detailModal.metric] !== undefined && log[detailModal.metric] !== null ? Number(log[detailModal.metric]) : null);
                  const metricColor = getMetricColor(detailModal.metric);
                  
                  // Calculate statistics
                  const validData = dataPoints.filter(point => point !== null && !isNaN(point));
                  const average = validData.length > 0 ? (validData.reduce((sum, val) => sum + val, 0) / validData.length).toFixed(2) : 'N/A';
                  const maximum = validData.length > 0 ? Math.max(...validData).toFixed(2) : 'N/A';
                  const minimum = validData.length > 0 ? Math.min(...validData).toFixed(2) : 'N/A';
                  
                  return (
                    <>
                      <div className="chart-stats mb-6">
                        <div className="grid grid-3 gap-4">
                          <div className="stat-item">
                            <div className="stat-label">Average</div>
                            <div className="stat-value" style={{ color: metricColor }}>{average}</div>
                          </div>
                          <div className="stat-item">
                            <div className="stat-label">Maximum</div>
                            <div className="stat-value" style={{ color: metricColor }}>{maximum}</div>
                          </div>
                          <div className="stat-item">
                            <div className="stat-label">Minimum</div>
                            <div className="stat-value" style={{ color: metricColor }}>{minimum}</div>
                          </div>
                        </div>
                      </div>
                      <div style={{ height: '400px' }}>
                        <Line
                          data={{
                            labels,
                            datasets: [
                              {
                                label: detailModal.title,
                                data: dataPoints,
                                fill: true,
                                borderColor: metricColor,
                                backgroundColor: `${metricColor}15`,
                                tension: 0.3,
                                pointRadius: 4,
                                pointHoverRadius: 6,
                                pointBackgroundColor: metricColor,
                                pointBorderColor: '#ffffff',
                                pointBorderWidth: 2,
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { 
                                display: true,
                                position: 'top',
                                labels: {
                                  usePointStyle: true,
                                  color: 'rgba(148,163,184,0.9)'
                                }
                              },
                              tooltip: {
                                enabled: true,
                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                titleColor: '#ffffff',
                                bodyColor: '#ffffff',
                                borderColor: metricColor,
                                borderWidth: 1,
                                callbacks: {
                                  title: (context) => `Time: ${context[0].label}`,
                                  label: (context) => `${detailModal.title}: ${context.parsed.y}`
                                }
                              },
                            },
                            scales: {
                              x: { 
                                grid: { 
                                  color: 'rgba(148,163,184,0.1)',
                                  display: true 
                                },
                                ticks: {
                                  color: 'rgba(148,163,184,0.7)',
                                  maxTicksLimit: 10
                                }
                              },
                              y: { 
                                grid: { 
                                  color: 'rgba(148,163,184,0.1)',
                                  display: true 
                                },
                                ticks: {
                                  color: 'rgba(148,163,184,0.7)'
                                }
                              },
                            },
                            elements: {
                              point: { 
                                hoverRadius: 8,
                                hoverBorderWidth: 3
                              }
                            },
                            interaction: { 
                              intersect: false, 
                              mode: 'index' 
                            }
                          }}
                        />
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Environment;