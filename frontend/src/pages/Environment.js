import React, { useState, useEffect } from 'react';
import { Plus, Thermometer, Droplets, TestTube, Sun, Trash2, TrendingUp, Camera, Wind, Beaker, Edit } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

import { environmentApi, plantsApi } from '../utils/api';
import ImageUpload from '../components/ImageUpload';

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

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  useEffect(() => {
    fetchEnvironmentData();
    fetchLatestReading();
    fetchWeeklyData();
    fetchGrowTents();
  }, []);

  useEffect(() => {
    fetchEnvironmentData();
    fetchLatestReading();
    fetchWeeklyData();
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

  return (
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
          <div className="header-actions control-group">
            <select
              value={selectedTent}
              onChange={(e) => setSelectedTent(e.target.value)}
              className="select control-group-item"
              aria-label="Select grow tent"
            >
              <option value="">All Tents</option>
              {growTents.map((tent) => (
                <option key={tent.grow_tent} value={tent.grow_tent}>
                  {tent.grow_tent} ({tent.plant_count} plants)
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowWeekly(!showWeekly)}
              className={`btn btn-outline control-group-item${showWeekly ? ' active' : ''}`}
              type="button"
            >
              <TrendingUp className="w-4 h-4" />
              {showWeekly ? 'Show Logs' : 'Weekly Stats'}
            </button>
            <button
              onClick={() => setShowImageUpload(true)}
              className="btn btn-primary control-group-item"
              type="button"
            >
              <Camera className="w-4 h-4" />
              From Screenshot
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-secondary control-group-item"
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
          <h2 className="text-xl font-semibold mb-4">Recent Readings</h2>
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
            <div className="space-y-4">
              {environmentLogs.map((log) => (
                <div key={log.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(log.logged_at))} ago
                        </span>
                        <span className="text-xs text-gray-400">
                          {format(new Date(log.logged_at), 'MMM dd, yyyy HH:mm')}
                        </span>
                      </div>
                      
                      <div className="grid grid-4 gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <Thermometer className="w-4 h-4 text-red-500" />
                          <span className="text-sm">
                            {log.temperature ? `${log.temperature}°F` : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Droplets className="w-4 h-4 text-blue-500" />
                          <span className="text-sm">
                            {log.humidity ? `${log.humidity}%` : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TestTube className="w-4 h-4 text-green-500" />
                          <span className="text-sm">
                            {log.ph_level ? `pH ${log.ph_level}` : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Sun className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm">
                            {log.light_hours ? `${log.light_hours}h` : 'N/A'}
                          </span>
                        </div>
                      </div>
                      
                      {log.notes && (
                        <p className="text-gray-600 text-sm">{log.notes}</p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(log)}
                        className="btn btn-secondary btn-sm"
                        title="Edit Reading"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(log.id)}
                        className="btn btn-danger btn-sm"
                        title="Delete Reading"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Image Upload Modal */}
      {showImageUpload && (
        <ImageUpload
          onDataParsed={handleImageData}
          onClose={() => setShowImageUpload(false)}
        />
      )}
    </div>
  );
};

export default Environment;