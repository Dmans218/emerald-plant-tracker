import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Thermometer, Droplets, TestTube, Sun, Trash2, TrendingUp, Camera, Wind, Beaker, Edit, Sprout, Upload } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { environmentApi, plantsApi } from '../utils/api';
import ImageUpload from '../components/ImageUpload';
import { getStageColor } from '../utils/stageColors';



// Add CSS animations inline with ultra-modern enhancements
const modalStyles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes modalSlideIn {
    from { 
      opacity: 0;
      transform: scale(0.95) translateY(-10px);
    }
    to { 
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
  
  @keyframes chartHover {
    from { transform: translateY(0px); }
    to { transform: translateY(-2px); }
  }

  @keyframes gradientShift {
    0% { 
      background-position: 0% 50%;
      transform: scale(1) rotate(0deg);
    }
    25% { 
      background-position: 25% 75%;
      transform: scale(1.05) rotate(0.5deg);
    }
    50% { 
      background-position: 100% 50%;
      transform: scale(1.1) rotate(0deg);
    }
    75% { 
      background-position: 75% 25%;
      transform: scale(1.05) rotate(-0.5deg);
    }
    100% { 
      background-position: 0% 50%;
      transform: scale(1) rotate(0deg);
    }
  }

  @keyframes floatingParticles {
    0% { 
      transform: translateY(0px) translateX(0px) scale(1);
      opacity: 0.7;
    }
    25% { 
      transform: translateY(-20px) translateX(10px) scale(1.1);
      opacity: 1;
    }
    50% { 
      transform: translateY(-30px) translateX(-5px) scale(0.9);
      opacity: 0.8;
    }
    75% { 
      transform: translateY(-10px) translateX(-15px) scale(1.05);
      opacity: 0.9;
    }
    100% { 
      transform: translateY(0px) translateX(0px) scale(1);
      opacity: 0.7;
    }
  }

  @keyframes slideUp {
    from { 
      opacity: 0;
      transform: translateY(60px) scale(0.9);
    }
    to { 
      opacity: 1;
      transform: translateY(0px) scale(1);
    }
  }

  @keyframes iconPulse {
    0%, 100% { 
      transform: scale(1);
      box-shadow: 0 15px 30px -10px rgba(0,0,0,0.3);
    }
    50% { 
      transform: scale(1.05);
      box-shadow: 0 20px 40px -10px rgba(0,0,0,0.4);
    }
  }

  @keyframes iconGlow {
    0% { 
      opacity: 0.3;
      transform: scale(1);
    }
    100% { 
      opacity: 0.6;
      transform: scale(1.2);
    }
  }

  @keyframes chartGlow {
    0% { 
      opacity: 0.6;
      transform: scale(1);
    }
    100% { 
      opacity: 1;
      transform: scale(1.02);
    }
  }

  @keyframes activeDotPulse {
    0%, 100% { 
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
    }
    50% { 
      transform: scale(1.2);
      box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
    }
  }

  @keyframes shimmer {
    0% { 
      background-position: -200% 0;
    }
    100% { 
      background-position: 200% 0;
    }
  }

  @keyframes textGlow {
    0%, 100% { 
      text-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
    }
    50% { 
      text-shadow: 0 0 20px rgba(255, 255, 255, 0.8), 0 0 30px rgba(255, 255, 255, 0.4);
    }
  }

  .gradient-text {
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 1) 0%,
      rgba(255, 255, 255, 0.8) 25%,
      rgba(255, 255, 255, 1) 50%,
      rgba(255, 255, 255, 0.8) 75%,
      rgba(255, 255, 255, 1) 100%
    );
    background-size: 200% 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 3s ease-in-out infinite;
  }
`;

// Inject styles safely
// Add modal styles to document head
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = modalStyles; // Use textContent instead of innerHTML for security
  if (!document.head.querySelector('style[data-modal-styles]')) {
    styleElement.setAttribute('data-modal-styles', 'true');
    document.head.appendChild(styleElement);
  }
}

const Environment = () => {
  const [environmentLogs, setEnvironmentLogs] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showWeekly, setShowWeekly] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [growTents, setGrowTents] = useState([]);
  const [selectedTent, setSelectedTent] = useState('');
  const [editingLog, setEditingLog] = useState(null);
  const [selectedChart, setSelectedChart] = useState(null);
  const [importing, setImporting] = useState(false);
  
  const fileInputRef = useRef(null);

  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();

  const fetchEnvironmentData = useCallback(async () => {
    try {
      setLoading(true);
      const params = { limit: 50 };
      if (selectedTent) {
        params.grow_tent = selectedTent;
      }
      const data = await environmentApi.getAll(params);
      setEnvironmentLogs(data);
    } catch {
      toast.error('Failed to load environment data');
    } finally {
      setLoading(false);
    }
  }, [selectedTent]);

  const fetchLatestReading = useCallback(async () => {
    try {
      const params = {};
      if (selectedTent) {
        params.grow_tent = selectedTent;
      }
      await environmentApi.getLatest(params);
      // Latest reading data could be used for dashboard stats if needed
    } catch {
      // Latest reading fetch failed
    }
  }, [selectedTent]);

  const fetchWeeklyData = useCallback(async () => {
    try {
      const params = { weeks: 8 };
      if (selectedTent) {
        params.grow_tent = selectedTent;
      }
      const data = await environmentApi.getWeekly(params);
      setWeeklyData(data);
    } catch {
      // Weekly data fetch failed
    }
  }, [selectedTent]);

  const fetchGrowTents = useCallback(async () => {
    try {
      const data = await plantsApi.getGrowTents();
      setGrowTents(data);
      
      // If no tent is currently selected and there are tents available, select the first one
      if (!selectedTent && data.length > 0) {
        setSelectedTent(data[0].grow_tent);
      }
    } catch {
      // Grow tents fetch failed
    }
  }, [selectedTent]);

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
    try {
      const confirmed = window.confirm('Are you sure you want to delete this environment log?');
      
      if (confirmed) {
        await environmentApi.delete(logId);
        
        toast.success('Environment log deleted successfully');
        
        // Refresh the data
        await Promise.all([
          fetchEnvironmentData(),
          fetchLatestReading(),
          fetchWeeklyData()
        ]);
      }
    } catch (error) {
      toast.error(`Failed to delete environment log: ${error.message}`);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingLog(null);
    reset();
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    // Check if tent is selected
    const targetTent = selectedTent || 'Main Tent';
    const confirmed = window.confirm(
      `Import SpiderFarmer GGS data to "${targetTent}" tent?\n\n` +
      `File: ${file.name}\n` +
      `This will add environment readings to the selected tent.`
    );
    
    if (!confirmed) {
      // Clear file input if user cancels
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setImporting(true);
    toast(`🔄 Importing ${file.name} to ${targetTent}...`, { icon: '📊' });
    
    try {
      const formData = new FormData();
      formData.append('csvFile', file);
      formData.append('grow_tent', targetTent);

      const response = await fetch('/api/environment/import-csv', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Import failed');
      }

      // Show detailed import success message
      const deviceInfo = result.deviceInfo ? 
        `\nDevice: ${result.deviceInfo.deviceSerial}\nData: ${result.deviceInfo.dateRange.start} to ${result.deviceInfo.dateRange.end}` : '';
      
      toast.success(
        `🎉 SpiderFarmer GGS Import Complete!\n` +
        `📊 ${result.stats.imported} records imported to "${targetTent}"\n` +
        `⚠️ ${result.stats.duplicates} duplicates skipped${deviceInfo}`,
        { duration: 8000 }
      );

      if (result.errors.length > 0) {
        console.warn('Import warnings:', result.errors);
        toast('Some rows had issues. Check console for details.', { 
          icon: '⚠️',
          duration: 4000 
        });
      }
      
      // Show which fields were imported
      if (result.fieldsImported && result.fieldsImported.length > 0) {
        toast(`📱 Fields imported: ${result.fieldsImported.join(', ')}`, { 
          icon: '📈',
          duration: 5000 
        });
      }

      // Refresh data after successful import
      await Promise.all([
        fetchEnvironmentData(),
        fetchLatestReading(),
        fetchWeeklyData()
      ]);

    } catch (error) {
      console.error('CSV import error:', error);
      toast.error(`Import failed: ${error.message}`);
    } finally {
      setImporting(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
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
      } catch {
        return getCurrentDateTime();
      }
    }
    return getCurrentDateTime();
  };

  const handleImageData = (parsedData) => {
    // Convert parsed data to form format and populate form
    const formData = {
      logged_at: getImageDateTime(parsedData),
      grow_tent: selectedTent, // Use the currently selected tent
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

  // Sort logs by date ascending for graphs
  const sortedLogsForGraphs = [...environmentLogs].sort((a, b) => new Date(a.logged_at) - new Date(b.logged_at));

  // Handle keyboard events for chart modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && selectedChart) {
        setSelectedChart(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedChart]);

  // Initial data load
  useEffect(() => {
    fetchEnvironmentData();
    fetchLatestReading();
    fetchWeeklyData();
    fetchGrowTents();
  }, [fetchEnvironmentData, fetchLatestReading, fetchWeeklyData, fetchGrowTents]);

  // Refresh grow tents when window gains focus (user might have added tents in another tab/page)
  useEffect(() => {
    const handleFocus = () => {
      fetchGrowTents();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchGrowTents]);

  // Refresh data when tent selection changes
  useEffect(() => {
    fetchEnvironmentData();
    fetchLatestReading();
    fetchWeeklyData();
  }, [selectedTent, fetchEnvironmentData, fetchLatestReading, fetchWeeklyData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="loading"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Header */}
      <header className="dashboard-header" style={{ animation: 'fadeInUp 0.6s ease-out' }}>
        <div className="header-content">
          <div className="header-text">
            <h1 className="dashboard-title">
              <Thermometer className="w-8 h-8" style={{ display: 'inline-block', marginRight: '0.75rem', verticalAlign: 'middle' }} />
              Environment Control
            </h1>
            <p className="dashboard-subtitle">Monitor & log your grow environment conditions</p>
          </div>
          
          <div className="header-actions">
            <select
              value={selectedTent}
              onChange={(e) => setSelectedTent(e.target.value)}
              className="btn btn-outline"
              style={{ minWidth: '180px' }}
            >
              {growTents.map((tent) => (
                <option key={tent.grow_tent} value={tent.grow_tent}>
                  {tent.grow_tent} ({tent.plant_count} plants)
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowWeekly(!showWeekly)}
              className={`btn ${showWeekly ? 'btn-primary' : 'btn-outline'}`}
            >
              <TrendingUp className="w-5 h-5" />
              Weekly Stats
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv"
              style={{ display: 'none' }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-outline"
              disabled={importing}
            >
              {importing ? (
                <div className="loading" style={{ width: '16px', height: '16px' }} />
              ) : (
                <Upload className="w-5 h-5" />
              )}
              Import CSV
            </button>
          </div>
        </div>
      </header>

      {/* Add Form */}
      {showForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'var(--surface)',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            padding: '1.5rem',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            animation: 'modalSlideIn 0.3s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>
                📊 {editingLog ? 'Edit Environment Reading' : 'Add Environment Reading'}
              </h2>
              <button
                onClick={resetForm}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                <div style={{ gridColumn: 'span 3' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Grow Tent</label>
                  <select
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      background: 'var(--surface)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem'
                    }}
                    {...register('grow_tent', { required: 'Please select a grow tent' })}
                    defaultValue={selectedTent}
                  >
                    {growTents.map((tent) => (
                      <option key={tent.grow_tent} value={tent.grow_tent}>
                        {tent.grow_tent}
                      </option>
                    ))}
                  </select>
                  {errors.grow_tent && (
                    <span style={{color: 'var(--error)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block'}}>
                      {errors.grow_tent.message}
                    </span>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Temp (°F)</label>
                  <input
                    type="number"
                    step="0.1"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      background: 'var(--surface)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem'
                    }}
                    {...register('temperature')}
                    placeholder="75.5"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Humidity (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      background: 'var(--surface)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem'
                    }}
                    {...register('humidity')}
                    placeholder="65.0"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>VPD (kPa)</label>
                  <input
                    type="number"
                    step="0.01"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      background: 'var(--surface)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem'
                    }}
                    {...register('vpd')}
                    placeholder="1.2"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>CO₂ (ppm)</label>
                  <input
                    type="number"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      background: 'var(--surface)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem'
                    }}
                    {...register('co2_ppm')}
                    placeholder="1200"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>PPFD</label>
                  <input
                    type="number"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      background: 'var(--surface)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem'
                    }}
                    {...register('ppfd')}
                    placeholder="800"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>pH Level</label>
                  <input
                    type="number"
                    step="0.1"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      background: 'var(--surface)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem'
                    }}
                    {...register('ph_level')}
                    placeholder="6.5"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Light Hours</label>
                  <input
                    type="number"
                    step="0.1"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      background: 'var(--surface)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem'
                    }}
                    {...register('light_hours')}
                    placeholder="18.0"
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Date & Time</label>
                  <input
                    type="datetime-local"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      background: 'var(--surface)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem'
                    }}
                    {...register('logged_at')}
                    defaultValue={getCurrentDateTime()}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Notes</label>
                <textarea
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    background: 'var(--surface)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    resize: 'vertical',
                    minHeight: '60px'
                  }}
                  {...register('notes')}
                  placeholder="Any observations about environmental conditions..."
                  rows={2}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
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
        <div style={{
          background: 'var(--surface)',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          padding: '2rem',
          animation: 'fadeInUp 0.8s ease-out 0.2s both'
        }}>
          <h2 style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Weekly Averages</h2>
          {weeklyData.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0' }}>No weekly data available</p>
          ) : (
            <div className="space-y-4">
              {weeklyData.map((week, _index) => (
                <div 
                  key={week.week} 
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '1.5rem',
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
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = 'var(--border)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                      Week of {format(new Date(week.week_start), 'MMM dd, yyyy')}
                    </h3>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      {week.reading_count} readings
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div style={{ fontWeight: '600', color: '#ef4444' }}>
                        {week.avg_temperature ? `${week.avg_temperature.toFixed(1)}°F` : 'N/A'}
                      </div>
                      <div style={{ color: 'var(--text-secondary)' }}>Avg Temp</div>
                    </div>
                    <div className="text-center">
                      <div style={{ fontWeight: '600', color: '#3b82f6' }}>
                        {week.avg_humidity ? `${week.avg_humidity.toFixed(1)}%` : 'N/A'}
                      </div>
                      <div style={{ color: 'var(--text-secondary)' }}>Avg Humidity</div>
                    </div>
                    <div className="text-center">
                      <div style={{ fontWeight: '600', color: 'var(--primary-color)' }}>
                        {week.avg_ph_level ? week.avg_ph_level.toFixed(1) : 'N/A'}
                      </div>
                      <div style={{ color: 'var(--text-secondary)' }}>Avg pH</div>
                    </div>
                    <div className="text-center">
                      <div style={{ fontWeight: '600', color: '#fbbf24' }}>
                        {week.avg_light_hours ? `${week.avg_light_hours.toFixed(1)}h` : 'N/A'}
                      </div>
                      <div style={{ color: 'var(--text-secondary)' }}>Avg Light</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div 
          style={{
            background: 'var(--surface)',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            padding: '2rem',
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
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = 'var(--border)';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h2 style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 'bold', margin: 0, marginBottom: '0.5rem' }}>
                📋 Recent Readings
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                Latest environment measurements and data
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowImageUpload(true);
                }}
                className="btn btn-outline"
                style={{borderColor: '#ffb347', color: '#ffb347'}}
              >
                <Camera className="w-5 h-5" />
                From Screenshot
              </button>
              <button
                onClick={() => {
                  fetchGrowTents(); // Refresh tents before showing form
                  setShowForm(true);
                }}
                className="btn btn-primary"
              >
                <Plus className="w-5 h-5" />
                Manual Entry
              </button>
              <button
                className="btn btn-outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                style={{borderColor: '#ffffff', color: '#ffffff'}}
              >
                {importing ? (
                  <div className="loading" style={{ width: '16px', height: '16px' }} />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
                Import CSV
              </button>
            </div>
          </div>
          {sortedLogsForGraphs.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '4rem 2rem',
              background: 'var(--surface-elevated)',
              borderRadius: '12px',
              border: '1px solid var(--border)'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                opacity: 0.8
              }}>
                <Thermometer className="w-10 h-10 text-white" />
              </div>
              <h3 style={{ 
                color: 'var(--text-primary)', 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                marginBottom: '0.75rem',
                letterSpacing: '-0.025em'
              }}>
                No environment data yet
              </h3>
              <p style={{ 
                color: 'var(--text-secondary)', 
                marginBottom: '2rem',
                fontSize: '0.95rem',
                lineHeight: '1.5'
              }}>
                Start tracking your grow environment conditions to monitor temperature, humidity, pH levels, and more.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    fetchGrowTents(); // Refresh tents before showing form
                    setShowForm(true);
                  }}
                  className="btn btn-primary"
                  style={{ padding: '0.75rem 1.5rem' }}
                >
                  <Plus className="w-4 h-4" />
                  Add First Reading
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowImageUpload(true);
                  }}
                  className="btn btn-outline"
                  style={{ borderColor: '#ffb347', color: '#ffb347', padding: '0.75rem 1.5rem' }}
                >
                  <Camera className="w-4 h-4" />
                  From Screenshot
                </button>
              </div>
            </div>
          ) : (
            <div 
              style={{
                background: 'rgba(30, 41, 59, 0.6)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderRadius: '16px',
                border: '1px solid rgba(100, 116, 139, 0.2)',
                overflow: 'hidden',
                boxShadow: '0 8px 20px -6px rgba(0, 0, 0, 0.3)',
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
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', fontSize: '0.875rem', textAlign: 'left', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                  <colgroup>
                    <col style={{ width: '13%' }} />
                    <col style={{ width: '11%' }} />
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '8%' }} />
                    <col style={{ width: '8%' }} />
                    <col style={{ width: '6%' }} />
                    <col style={{ width: '8%' }} />
                    <col style={{ width: '7%' }} />
                    <col style={{ width: '8%' }} />
                    <col style={{ width: '8%' }} />
                    <col style={{ width: '13%' }} />
                  </colgroup>
                  <thead>
                    <tr style={{ 
                      background: 'rgba(15, 23, 42, 0.8)', 
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      borderBottom: '1px solid rgba(100, 116, 139, 0.3)' 
                    }}>
                      <th style={{ 
                        padding: '1rem 1.25rem', 
                        fontWeight: '600', 
                        color: '#e2e8f0',
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        textAlign: 'left'
                      }}>Date/Time</th>
                      <th style={{ 
                        padding: '1rem 1.25rem', 
                        fontWeight: '600', 
                        color: '#e2e8f0',
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        textAlign: 'center'
                      }}>Tent</th>
                      <th style={{ 
                        padding: '1rem 1.25rem', 
                        fontWeight: '600', 
                        color: '#e2e8f0',
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        textAlign: 'center'
                      }}>Stage</th>
                      <th style={{ 
                        padding: '1rem 1.25rem', 
                        fontWeight: '600', 
                        color: '#e2e8f0',
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        textAlign: 'center'
                      }}>Temp</th>
                      <th style={{ 
                        padding: '1rem 1.25rem', 
                        fontWeight: '600', 
                        color: '#e2e8f0',
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        textAlign: 'center'
                      }}>Humidity</th>
                      <th style={{ 
                        padding: '1rem 1.25rem', 
                        fontWeight: '600', 
                        color: '#e2e8f0',
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        textAlign: 'center'
                      }}>pH</th>
                      <th style={{ 
                        padding: '1rem 1.25rem', 
                        fontWeight: '600', 
                        color: '#e2e8f0',
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        textAlign: 'center'
                      }}>Light</th>
                      <th style={{ 
                        padding: '1rem 1.25rem', 
                        fontWeight: '600', 
                        color: '#e2e8f0',
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        textAlign: 'center'
                      }}>CO₂</th>
                      <th style={{ 
                        padding: '1rem 1.25rem', 
                        fontWeight: '600', 
                        color: '#e2e8f0',
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        textAlign: 'center'
                      }}>PPFD</th>
                      <th style={{ 
                        padding: '1rem 1.25rem', 
                        fontWeight: '600', 
                        color: '#e2e8f0',
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        textAlign: 'center'
                      }}>VPD</th>
                      <th style={{ 
                        padding: '1rem 1.25rem', 
                        fontWeight: '600', 
                        color: '#e2e8f0',
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        textAlign: 'center'
                      }}>Soil°F</th>
                      <th style={{ 
                        padding: '1rem 1.25rem', 
                        fontWeight: '600', 
                        color: '#e2e8f0',
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        textAlign: 'center'
                      }}>Power</th>
                      <th style={{ 
                        padding: '1rem 1.25rem', 
                        fontWeight: '600', 
                        color: '#e2e8f0',
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        textAlign: 'center'
                      }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedLogsForGraphs.slice(-10).reverse().map((log, index) => (
                      <tr 
                        key={log.id} 
                        style={{ 
                          borderBottom: index < 9 ? '1px solid rgba(100, 116, 139, 0.2)' : 'none',
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
                        <td style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap', textAlign: 'left' }}>
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
                          padding: '1rem 1.25rem', 
                          whiteSpace: 'nowrap', 
                          textAlign: 'center',
                          verticalAlign: 'middle'
                        }}>
                          <span style={{ 
                            color: '#f8fafc',
                            background: 'rgba(100, 116, 139, 0.2)',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                            padding: '0.375rem 0.75rem',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            border: '1px solid rgba(100, 116, 139, 0.3)',
                            display: 'inline-block'
                          }}>
                            {log.grow_tent || 'General'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '100px',
                            fontSize: '0.625rem',
                            fontWeight: '700',
                            background: getStageColor(log.stage).bg,
                            color: getStageColor(log.stage).color,
                            border: `1px solid ${getStageColor(log.stage).border}`,
                            gap: '0.2rem',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.015em',
                            whiteSpace: 'nowrap',
                            maxWidth: '100%',
                            overflow: 'hidden',
                            textAlign: 'center',
                            minWidth: 'fit-content'
                          }}>
                            <Sprout className="w-2 h-2" />
                            {log.stage || 'N/A'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                          <span style={{ 
                            color: log.temperature ? '#f87171' : '#64748b', 
                            fontWeight: '600',
                            fontSize: '0.875rem'
                          }}>
                            {log.temperature ? `${log.temperature}°F` : '-'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                          <span style={{ 
                            color: log.humidity ? '#60a5fa' : '#64748b', 
                            fontWeight: '600',
                            fontSize: '0.875rem'
                          }}>
                            {log.humidity ? `${log.humidity}%` : '-'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                          <span style={{ 
                            color: log.ph_level ? '#bef264' : '#64748b', 
                            fontWeight: '600',
                            fontSize: '0.875rem'
                          }}>
                            {log.ph_level ?? '-'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                          <span style={{ 
                            color: log.light_hours ? '#fbbf24' : '#64748b', 
                            fontWeight: '600',
                            fontSize: '0.875rem'
                          }}>
                            {log.light_hours ? `${log.light_hours}h` : '-'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                          <span style={{ 
                            color: log.co2_level ? '#fbbf24' : '#64748b', 
                            fontWeight: '600',
                            fontSize: '0.875rem'
                          }}>
                            {log.co2_level ? `${log.co2_level}ppm` : '-'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                          <span style={{ 
                            color: log.ppfd ? '#a78bfa' : '#64748b', 
                            fontWeight: '600',
                            fontSize: '0.875rem'
                          }}>
                            {log.ppfd ? `${log.ppfd}μmol` : '-'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                          <span style={{ 
                            color: log.vpd ? '#22d3ee' : '#64748b', 
                            fontWeight: '600',
                            fontSize: '0.875rem'
                          }}>
                            {log.vpd ? `${log.vpd}kPa` : '-'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                          <span style={{ 
                            color: log.soil_temperature_f ? '#f59e0b' : '#64748b', 
                            fontWeight: '600',
                            fontSize: '0.875rem'
                          }}>
                            {log.soil_temperature_f ? `${log.soil_temperature_f}°F` : '-'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                          <span style={{ 
                            color: log.power_consumption ? '#8b5cf6' : '#64748b', 
                            fontWeight: '600',
                            fontSize: '0.875rem'
                          }}>
                            {log.power_consumption ? `${log.power_consumption}W` : '-'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            <button
                              onClick={() => handleEdit(log)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(59, 130, 246, 0.2)',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                borderRadius: '8px',
                                padding: '0.5rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                              title="Edit Reading"
                            >
                              <Edit className="w-4 h-4" style={{ color: '#60a5fa' }} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDelete(log.id);
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(239, 68, 68, 0.2)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '8px',
                                padding: '0.5rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                              title="Delete Reading"
                            >
                              <Trash2 className="w-4 h-4" style={{ color: '#f87171' }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {sortedLogsForGraphs.length > 10 && (
                <div style={{ 
                  padding: '1.25rem', 
                  borderTop: '1px solid rgba(100, 116, 139, 0.2)', 
                  background: 'rgba(15, 23, 42, 0.5)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  textAlign: 'center'
                }}>
                  <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0, fontWeight: '500' }}>
                    Showing latest 10 readings of {sortedLogsForGraphs.length} total
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Charts Section - 2x2 Grid */}
      {sortedLogsForGraphs.length > 0 && (
        <div 
          style={{
            background: 'rgba(30, 41, 59, 0.7)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: '16px',
            border: '1px solid rgba(100, 116, 139, 0.2)',
            padding: '1.5rem',
            boxShadow: '0 8px 20px -6px rgba(0, 0, 0, 0.3)',
            marginTop: '2rem',
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ 
              color: '#f8fafc', 
              fontSize: '1.5rem', 
              fontWeight: '700', 
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Environment Analytics
            </h2>
          </div>
          
          {/* 3x2 Grid Layout */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '1rem'
          }}>
            {/* Temperature Chart */}
            <div 
              style={{ 
                background: 'rgba(15, 23, 42, 0.6)', 
                borderRadius: '12px', 
                border: '1px solid rgba(100, 116, 139, 0.2)',
                padding: '1rem',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onClick={() => setSelectedChart('temperature')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
                e.currentTarget.style.borderColor = 'rgba(248, 113, 113, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.2)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Thermometer className="w-4 h-4" style={{ color: '#f87171' }} />
                <h3 style={{ color: '#f8fafc', fontSize: '0.875rem', fontWeight: '600', margin: 0 }}>
                  Temperature
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={sortedLogsForGraphs} margin={{ top: 5, right: 5, left: 5, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.1)" />
                  <XAxis 
                    dataKey="logged_at"
                    tick={{ fill: '#94a3b8', fontSize: 9 }}
                    axisLine={{ stroke: 'rgba(100, 116, 139, 0.2)' }}
                    tickFormatter={(value) => format(new Date(value), 'MM/dd HH:mm')}
                    angle={-45}
                    textAnchor="end"
                    height={50}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    tick={{ fill: '#94a3b8', fontSize: 10 }} 
                    domain={[60, 90]}
                    axisLine={{ stroke: 'rgba(100, 116, 139, 0.2)' }}
                    width={30}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(15, 23, 42, 0.95)', 
                      border: '1px solid rgba(100, 116, 139, 0.3)', 
                      borderRadius: '6px',
                      color: '#f8fafc',
                      fontSize: '0.75rem'
                    }}
                    labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy HH:mm')}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="temperature" 
                    stroke="#f87171" 
                    strokeWidth={2} 
                    dot={false}
                    activeDot={{ r: 3, fill: '#ef4444' }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* Humidity Chart */}
            <div 
              style={{ 
                background: 'rgba(15, 23, 42, 0.6)', 
                borderRadius: '12px', 
                border: '1px solid rgba(100, 116, 139, 0.2)',
                padding: '1rem',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onClick={() => setSelectedChart('humidity')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.2)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Droplets className="w-4 h-4" style={{ color: '#60a5fa' }} />
                <h3 style={{ color: '#f8fafc', fontSize: '0.875rem', fontWeight: '600', margin: 0 }}>
                  Humidity
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={sortedLogsForGraphs} margin={{ top: 5, right: 5, left: 5, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.1)" />
                  <XAxis 
                    dataKey="logged_at"
                    tick={{ fill: '#94a3b8', fontSize: 9 }}
                    axisLine={{ stroke: 'rgba(100, 116, 139, 0.2)' }}
                    tickFormatter={(value) => format(new Date(value), 'MM/dd HH:mm')}
                    angle={-45}
                    textAnchor="end"
                    height={50}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    tick={{ fill: '#94a3b8', fontSize: 10 }} 
                    domain={[0, 100]}
                    axisLine={{ stroke: 'rgba(100, 116, 139, 0.2)' }}
                    width={30}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(15, 23, 42, 0.95)', 
                      border: '1px solid rgba(100, 116, 139, 0.3)', 
                      borderRadius: '6px',
                      color: '#f8fafc',
                      fontSize: '0.75rem'
                    }}
                    labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy HH:mm')}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="humidity" 
                    stroke="#60a5fa" 
                    strokeWidth={2} 
                    dot={false}
                    activeDot={{ r: 3, fill: '#3b82f6' }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* VPD Chart */}
            <div 
              style={{ 
                background: 'rgba(15, 23, 42, 0.6)', 
                borderRadius: '12px', 
                border: '1px solid rgba(100, 116, 139, 0.2)',
                padding: '1rem',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onClick={() => setSelectedChart('vpd')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
                e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.2)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Wind className="w-4 h-4" style={{ color: '#22d3ee' }} />
                <h3 style={{ color: '#f8fafc', fontSize: '0.875rem', fontWeight: '600', margin: 0 }}>
                  VPD
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={sortedLogsForGraphs} margin={{ top: 5, right: 5, left: 5, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.1)" />
                  <XAxis 
                    dataKey="logged_at"
                    tick={{ fill: '#94a3b8', fontSize: 9 }}
                    axisLine={{ stroke: 'rgba(100, 116, 139, 0.2)' }}
                    tickFormatter={(value) => format(new Date(value), 'MM/dd HH:mm')}
                    angle={-45}
                    textAnchor="end"
                    height={50}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    tick={{ fill: '#94a3b8', fontSize: 10 }} 
                    domain={[0, 3]}
                    axisLine={{ stroke: 'rgba(100, 116, 139, 0.2)' }}
                    width={30}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(15, 23, 42, 0.95)', 
                      border: '1px solid rgba(100, 116, 139, 0.3)', 
                      borderRadius: '6px',
                      color: '#f8fafc',
                      fontSize: '0.75rem'
                    }}
                    labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy HH:mm')}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="vpd" 
                    stroke="#22d3ee" 
                    strokeWidth={2} 
                    dot={false}
                    activeDot={{ r: 3, fill: '#06b6d4' }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* pH Level Chart */}
            <div 
              style={{ 
                background: 'rgba(15, 23, 42, 0.6)', 
                borderRadius: '12px', 
                border: '1px solid rgba(100, 116, 139, 0.2)',
                padding: '1rem',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onClick={() => setSelectedChart('ph')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
                e.currentTarget.style.borderColor = 'rgba(190, 242, 100, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.2)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <TestTube className="w-4 h-4" style={{ color: '#bef264' }} />
                <h3 style={{ color: '#f8fafc', fontSize: '0.875rem', fontWeight: '600', margin: 0 }}>
                  pH Level
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={sortedLogsForGraphs} margin={{ top: 5, right: 5, left: 5, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.1)" />
                  <XAxis 
                    dataKey="logged_at"
                    tick={{ fill: '#94a3b8', fontSize: 9 }}
                    axisLine={{ stroke: 'rgba(100, 116, 139, 0.2)' }}
                    tickFormatter={(value) => format(new Date(value), 'MM/dd HH:mm')}
                    angle={-45}
                    textAnchor="end"
                    height={50}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    tick={{ fill: '#94a3b8', fontSize: 10 }} 
                    domain={[4, 9]}
                    axisLine={{ stroke: 'rgba(100, 116, 139, 0.2)' }}
                    width={30}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(15, 23, 42, 0.95)', 
                      border: '1px solid rgba(100, 116, 139, 0.3)', 
                      borderRadius: '6px',
                      color: '#f8fafc',
                      fontSize: '0.75rem'
                    }}
                    labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy HH:mm')}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ph_level" 
                    stroke="#bef264" 
                    strokeWidth={2} 
                    dot={false}
                    activeDot={{ r: 3, fill: '#84cc16' }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* CO2 Chart */}
            <div 
              style={{ 
                background: 'rgba(15, 23, 42, 0.6)', 
                borderRadius: '12px', 
                border: '1px solid rgba(100, 116, 139, 0.2)',
                padding: '1rem',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onClick={() => setSelectedChart('co2')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
                e.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.2)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Wind className="w-4 h-4" style={{ color: '#fbbf24' }} />
                <h3 style={{ color: '#f8fafc', fontSize: '0.875rem', fontWeight: '600', margin: 0 }}>
                  CO₂ Level
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={sortedLogsForGraphs} margin={{ top: 5, right: 5, left: 5, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.1)" />
                  <XAxis 
                    dataKey="logged_at"
                    tick={{ fill: '#94a3b8', fontSize: 9 }}
                    axisLine={{ stroke: 'rgba(100, 116, 139, 0.2)' }}
                    tickFormatter={(value) => format(new Date(value), 'MM/dd HH:mm')}
                    angle={-45}
                    textAnchor="end"
                    height={50}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    tick={{ fill: '#94a3b8', fontSize: 10 }} 
                    domain={[300, 1500]}
                    axisLine={{ stroke: 'rgba(100, 116, 139, 0.2)' }}
                    width={30}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(15, 23, 42, 0.95)', 
                      border: '1px solid rgba(100, 116, 139, 0.3)', 
                      borderRadius: '6px',
                      color: '#f8fafc',
                      fontSize: '0.75rem'
                    }}
                    labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy HH:mm')}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="co2_level" 
                    stroke="#fbbf24" 
                    strokeWidth={2} 
                    dot={false}
                    activeDot={{ r: 3, fill: '#f59e0b' }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* PPFD Chart */}
            <div 
              style={{ 
                background: 'rgba(15, 23, 42, 0.6)', 
                borderRadius: '12px', 
                border: '1px solid rgba(100, 116, 139, 0.2)',
                padding: '1rem',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onClick={() => setSelectedChart('ppfd')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
                e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.2)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Sun className="w-4 h-4" style={{ color: '#a78bfa' }} />
                <h3 style={{ color: '#f8fafc', fontSize: '0.875rem', fontWeight: '600', margin: 0 }}>
                  PPFD
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={sortedLogsForGraphs} margin={{ top: 5, right: 5, left: 5, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.1)" />
                  <XAxis 
                    dataKey="logged_at"
                    tick={{ fill: '#94a3b8', fontSize: 9 }}
                    axisLine={{ stroke: 'rgba(100, 116, 139, 0.2)' }}
                    tickFormatter={(value) => format(new Date(value), 'MM/dd HH:mm')}
                    angle={-45}
                    textAnchor="end"
                    height={50}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    tick={{ fill: '#94a3b8', fontSize: 10 }} 
                    domain={[0, 2000]}
                    axisLine={{ stroke: 'rgba(100, 116, 139, 0.2)' }}
                    width={30}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(15, 23, 42, 0.95)', 
                      border: '1px solid rgba(100, 116, 139, 0.3)', 
                      borderRadius: '6px',
                      color: '#f8fafc',
                      fontSize: '0.75rem'
                    }}
                    labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy HH:mm')}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ppfd" 
                    stroke="#a78bfa" 
                    strokeWidth={2} 
                    dot={false}
                    activeDot={{ r: 3, fill: '#8b5cf6' }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Simplified Detailed Chart Modal */}
      {selectedChart && (
        <div 
          onClick={(e) => {
            // Close modal when clicking on backdrop
            if (e.target === e.currentTarget) {
              setSelectedChart(null);
            }
          }}
          style={{
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
            padding: '2rem',
            animation: 'fadeIn 0.3s ease-out',
            cursor: 'pointer'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
            style={{
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '16px',
              border: '1px solid rgba(100, 116, 139, 0.3)',
              boxShadow: '0 20px 40px -8px rgba(0, 0, 0, 0.6)',
              padding: '2rem',
              width: '100%',
              maxWidth: '900px',
              maxHeight: '80vh',
              overflowY: 'auto',
              position: 'relative',
              animation: 'slideUp 0.4s ease-out',
              cursor: 'default'
            }}
          >
            {/* Simplified modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  background: selectedChart === 'temperature' ? 'rgba(239, 68, 68, 0.2)' :
                            selectedChart === 'humidity' ? 'rgba(59, 130, 246, 0.2)' :
                            selectedChart === 'vpd' ? 'rgba(6, 182, 212, 0.2)' :
                            selectedChart === 'ph' ? 'rgba(132, 204, 22, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {selectedChart === 'temperature' && <Thermometer className="w-6 h-6" style={{ color: '#f87171' }} />}
                  {selectedChart === 'humidity' && <Droplets className="w-6 h-6" style={{ color: '#60a5fa' }} />}
                  {selectedChart === 'vpd' && <Wind className="w-6 h-6" style={{ color: '#22d3ee' }} />}
                  {selectedChart === 'ph' && <Beaker className="w-6 h-6" style={{ color: '#bef264' }} />}
                </div>
                <div>
                  <h2 style={{
                    color: '#f8fafc',
                    fontSize: '1.8rem',
                    fontWeight: '700',
                    margin: 0,
                    letterSpacing: '-0.02em'
                  }}>
                    {selectedChart.charAt(0).toUpperCase() + selectedChart.slice(1)} Analytics
                  </h2>
                  <p style={{ color: '#94a3b8', fontSize: '1rem', margin: 0, marginTop: '0.25rem' }}>
                    Detailed performance analysis
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedChart(null)}
                style={{
                  background: 'rgba(100, 116, 139, 0.2)',
                  border: '1px solid rgba(100, 116, 139, 0.3)',
                  borderRadius: '8px',
                  color: '#94a3b8',
                  padding: '0.75rem',
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(248, 113, 113, 0.2)';
                  e.target.style.borderColor = 'rgba(248, 113, 113, 0.4)';
                  e.target.style.color = '#f87171';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(100, 116, 139, 0.2)';
                  e.target.style.borderColor = 'rgba(100, 116, 139, 0.3)';
                  e.target.style.color = '#94a3b8';
                }}
              >
                ×
              </button>
            </div>
            
            {/* Simplified chart container */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.3)',
              borderRadius: '12px',
              padding: '1.5rem',
              border: '1px solid rgba(100, 116, 139, 0.2)'
            }}>
              <div style={{ height: '400px', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sortedLogsForGraphs} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="rgba(100, 116, 139, 0.2)" 
                    />
                    <XAxis 
                      dataKey="logged_at"
                      tick={{ fill: '#e2e8f0', fontSize: 12 }} 
                      axisLine={{ stroke: 'rgba(100, 116, 139, 0.3)' }}
                      tickLine={{ stroke: 'rgba(100, 116, 139, 0.3)' }}
                      tickFormatter={(value) => format(new Date(value), 'MM/dd HH:mm')}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      tick={{ fill: '#e2e8f0', fontSize: 12 }} 
                      axisLine={{ stroke: 'rgba(100, 116, 139, 0.3)' }}
                      tickLine={{ stroke: 'rgba(100, 116, 139, 0.3)' }}
                      domain={['dataMin - 2', 'dataMax + 2']}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'rgba(15, 23, 42, 0.95)', 
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        border: '1px solid rgba(100, 116, 139, 0.3)', 
                        borderRadius: '8px',
                        color: '#f1f5f9',
                        padding: '0.75rem 1rem',
                        boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.4)'
                      }}
                      labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy HH:mm')}
                      labelStyle={{ 
                        color: '#cbd5e1',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}
                      formatter={(value, _name) => [
                        <span key="value" style={{ 
                          color: selectedChart === 'temperature' ? '#f87171' :
                                 selectedChart === 'humidity' ? '#60a5fa' :
                                 selectedChart === 'vpd' ? '#22d3ee' :
                                 selectedChart === 'ph' ? '#bef264' : '#f87171',
                          fontWeight: '600'
                        }}>
                          {value}{
                            selectedChart === 'temperature' ? '°F' : 
                            selectedChart === 'humidity' ? '%' : 
                            selectedChart === 'vpd' ? ' kPa' : ''
                          }
                        </span>,
                        selectedChart.charAt(0).toUpperCase() + selectedChart.slice(1)
                      ]}
                    />
                    
                    {/* Simplified line */}
                    <Line 
                      type="monotone" 
                      dataKey={
                        selectedChart === 'temperature' ? 'temperature' :
                        selectedChart === 'humidity' ? 'humidity' :
                        selectedChart === 'vpd' ? 'vpd' :
                        selectedChart === 'ph' ? 'ph_level' :
                        selectedChart === 'co2' ? 'co2_level' :
                        selectedChart === 'ppfd' ? 'ppfd_level' : 'temperature'
                      }
                      stroke={selectedChart === 'temperature' ? '#f87171' :
                             selectedChart === 'humidity' ? '#60a5fa' :
                             selectedChart === 'vpd' ? '#22d3ee' :
                             selectedChart === 'ph' ? '#bef264' :
                             selectedChart === 'co2' ? '#fbbf24' :
                             selectedChart === 'ppfd' ? '#a78bfa' : '#f87171'}
                      strokeWidth={3} 
                      dot={{ 
                        r: 4, 
                        fill: selectedChart === 'temperature' ? '#f87171' :
                              selectedChart === 'humidity' ? '#60a5fa' :
                              selectedChart === 'vpd' ? '#22d3ee' :
                              selectedChart === 'ph' ? '#bef264' : '#f87171',
                        strokeWidth: 0
                      }} 
                      activeDot={{ 
                        r: 6, 
                        fill: selectedChart === 'temperature' ? '#ef4444' :
                              selectedChart === 'humidity' ? '#3b82f6' :
                              selectedChart === 'vpd' ? '#06b6d4' :
                              selectedChart === 'ph' ? '#84cc16' : '#ef4444',
                        stroke: '#f8fafc',
                        strokeWidth: 2
                      }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading Animation */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="loading-container">
            <div className="quantum-loader">
              <div className="quantum-core"></div>
              <div className="quantum-ring quantum-ring-1"></div>
              <div className="quantum-ring quantum-ring-2"></div>
              <div className="quantum-ring quantum-ring-3"></div>
              <div className="quantum-particles">
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
              </div>
            </div>
            <div className="loading-text">
              Loading environment data...
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

      {/* Chart Modal */}
      {selectedChart && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            animation: 'fadeIn 0.3s ease-out'
          }}
          onClick={() => setSelectedChart(null)}
        >
          <div 
            style={{
              background: 'rgba(15, 23, 42, 0.95)',
              borderRadius: '20px',
              border: '1px solid rgba(100, 116, 139, 0.3)',
              padding: '2rem',
              width: '95%',
              maxWidth: '1200px',
              height: '85%',
              maxHeight: '800px',
              minHeight: '500px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              animation: 'modalSlideIn 0.3s ease-out',
              '@media (max-width: 768px)': {
                width: '98%',
                height: '90%',
                padding: '1.5rem',
                borderRadius: '16px'
              }
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '1.5rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid rgba(100, 116, 139, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {selectedChart === 'temperature' && (
                  <>
                    <Thermometer className="w-6 h-6" style={{ color: '#f87171' }} />
                    <h2 style={{ color: '#f8fafc', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                      Temperature Analytics
                    </h2>
                  </>
                )}
                {selectedChart === 'humidity' && (
                  <>
                    <Droplets className="w-6 h-6" style={{ color: '#60a5fa' }} />
                    <h2 style={{ color: '#f8fafc', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                      Humidity Analytics
                    </h2>
                  </>
                )}
                {selectedChart === 'vpd' && (
                  <>
                    <Beaker className="w-6 h-6" style={{ color: '#22d3ee' }} />
                    <h2 style={{ color: '#f8fafc', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                      VPD Analytics
                    </h2>
                  </>
                )}
                {selectedChart === 'ph' && (
                  <>
                    <TestTube className="w-6 h-6" style={{ color: '#bef264' }} />
                    <h2 style={{ color: '#f8fafc', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                      pH Level Analytics
                    </h2>
                  </>
                )}
                {selectedChart === 'co2' && (
                  <>
                    <Wind className="w-6 h-6" style={{ color: '#fbbf24' }} />
                    <h2 style={{ color: '#f8fafc', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                      CO₂ Level Analytics
                    </h2>
                  </>
                )}
                {selectedChart === 'ppfd' && (
                  <>
                    <Sun className="w-6 h-6" style={{ color: '#a78bfa' }} />
                    <h2 style={{ color: '#f8fafc', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                      PPFD Analytics
                    </h2>
                  </>
                )}
              </div>
              <button
                onClick={() => setSelectedChart(null)}
                style={{
                  background: 'rgba(100, 116, 139, 0.2)',
                  border: '1px solid rgba(100, 116, 139, 0.3)',
                  borderRadius: '8px',
                  color: '#94a3b8',
                  padding: '0.75rem',
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(248, 113, 113, 0.2)';
                  e.target.style.borderColor = 'rgba(248, 113, 113, 0.4)';
                  e.target.style.color = '#f87171';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(100, 116, 139, 0.2)';
                  e.target.style.borderColor = 'rgba(100, 116, 139, 0.3)';
                  e.target.style.color = '#94a3b8';
                }}
              >
                ✕
              </button>
            </div>

            {/* Chart Container */}
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sortedLogsForGraphs} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" />
                  <XAxis 
                    dataKey="logged_at"
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    axisLine={{ stroke: 'rgba(100, 116, 139, 0.3)' }}
                    tickFormatter={(value) => format(new Date(value), 'MM/dd HH:mm')}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    tick={{ fill: '#94a3b8', fontSize: 12 }} 
                    domain={
                      selectedChart === 'temperature' ? [60, 90] :
                      selectedChart === 'humidity' ? [0, 100] :
                      selectedChart === 'vpd' ? [0, 3] :
                      selectedChart === 'ph' ? [4, 9] :
                      selectedChart === 'co2' ? [300, 1500] :
                      selectedChart === 'ppfd' ? [0, 2000] : ['auto', 'auto']
                    }
                    axisLine={{ stroke: 'rgba(100, 116, 139, 0.3)' }}
                    width={60}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(15, 23, 42, 0.95)', 
                      border: '1px solid rgba(100, 116, 139, 0.3)', 
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '0.875rem'
                    }}
                    labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy HH:mm')}
                  />
                  <Line 
                    type="monotone" 
                    dataKey={
                      selectedChart === 'temperature' ? 'temperature' :
                      selectedChart === 'humidity' ? 'humidity' :
                      selectedChart === 'vpd' ? 'vpd' :
                      selectedChart === 'ph' ? 'ph_level' :
                      selectedChart === 'co2' ? 'co2_level' :
                      selectedChart === 'ppfd' ? 'ppfd_level' : 'temperature'
                    }
                    stroke={selectedChart === 'temperature' ? '#f87171' :
                           selectedChart === 'humidity' ? '#60a5fa' :
                           selectedChart === 'vpd' ? '#22d3ee' :
                           selectedChart === 'ph' ? '#bef264' :
                           selectedChart === 'co2' ? '#fbbf24' :
                           selectedChart === 'ppfd' ? '#a78bfa' : '#f87171'}
                    strokeWidth={3} 
                    dot={{ fill: 'currentColor', strokeWidth: 2, r: 4 }}
                    activeDot={{ 
                      r: 6, 
                      fill: 'currentColor',
                      stroke: '#fff',
                      strokeWidth: 2
                    }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Modal Footer */}
            <div style={{
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(100, 116, 139, 0.2)',
              color: '#94a3b8',
              fontSize: '0.875rem',
              textAlign: 'center'
            }}>
              Click anywhere outside this chart to close • {sortedLogsForGraphs.length} data points
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Environment;