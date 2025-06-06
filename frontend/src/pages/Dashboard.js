import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Plus, Calendar, Home, Thermometer, Droplets, TestTube, Wind } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

import { plantsApi, environmentApi } from '../utils/api';

const STAGE_CONFIG = {
  seedling: { emoji: '🌱', label: 'Seedling' },
  vegetative: { emoji: '🌿', label: 'Vegetative' },
  flowering: { emoji: '🌸', label: 'Flowering' },
  harvest: { emoji: '🌾', label: 'Harvest' },
  cured: { emoji: '📦', label: 'Cured' }
};

const Dashboard = () => {
  const [plants, setPlants] = useState([]);
  const [environmentData, setEnvironmentData] = useState({});
  const [growTents, setGrowTents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [plantsData, growTentsData] = await Promise.all([
        plantsApi.getAll(),
        plantsApi.getGrowTents()
      ]);
      
      setPlants(plantsData);
      setGrowTents(growTentsData);

      // Fetch latest environment data for each tent
      const envData = {};
      for (const tent of growTentsData) {
        try {
          const latestReading = await environmentApi.getLatest({ grow_tent: tent.grow_tent });
          if (latestReading.id) {
            envData[tent.grow_tent] = latestReading;
          }
        } catch (error) {
          console.error(`Error fetching environment data for ${tent.grow_tent}:`, error);
        }
      }
      
      // Also fetch latest reading for unassigned tent plants
      try {
        const unassignedReading = await environmentApi.getLatest();
        if (unassignedReading.id && !unassignedReading.grow_tent) {
          envData['Unassigned'] = unassignedReading;
        }
      } catch (error) {
        console.error('Error fetching unassigned environment data:', error);
      }
      
      setEnvironmentData(envData);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStageConfig = (stage) => {
    return STAGE_CONFIG[stage] || STAGE_CONFIG.seedling;
  };

  const getEnvironmentStatus = (reading) => {
    if (!reading) return { status: 'no-data', text: 'No Data' };
    
    const now = new Date();
    const readingTime = new Date(reading.logged_at);
    const hoursSince = (now - readingTime) / (1000 * 60 * 60);
    
    if (hoursSince > 24) return { status: 'stale', text: 'Stale Data' };
    if (hoursSince > 12) return { status: 'old', text: 'Old Data' };
    return { status: 'fresh', text: 'Fresh Data' };
  };

  // Group plants by tent
  const groupedPlants = plants.reduce((groups, plant) => {
    const tent = plant.grow_tent || 'Unassigned';
    if (!groups[tent]) {
      groups[tent] = [];
    }
    groups[tent].push(plant);
    return groups;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="loading"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="dashboard-title">🌿 Grow Dashboard</h1>
            <p className="dashboard-subtitle">Monitor your cannabis cultivation by grow environment</p>
          </div>
          <div className="header-actions">
            <Link to="/environment" className="btn btn-accent">
              Add Environment Data
            </Link>
            <Link to="/plants" className="btn btn-primary">
              <Plus className="w-4 h-4" />
              Add Plant
            </Link>
          </div>
        </div>
      </header>

      {/* Environment Overview by Tent */}
      {growTents.length > 0 && (
        <section className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">🌡️ Environment Status by Tent</h2>
            <Link to="/environment" className="section-link">
              View Environment Dashboard <span className="ml-1">→</span>
            </Link>
          </div>
          <div className="section-content">
            <div className="grid grid-2 gap-6">
              {growTents.map((tent) => {
                const reading = environmentData[tent.grow_tent];
                const status = getEnvironmentStatus(reading);
                
                return (
                  <div key={tent.grow_tent} className="card">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Home className="w-5 h-5 text-blue-400" />
                        <h3 className="text-lg font-semibold">{tent.grow_tent}</h3>
                        <span className="grow-tent-count">
                          {tent.plant_count} plant{tent.plant_count !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <span className={`environment-status environment-status-${status.status}`}>
                        {status.text}
                      </span>
                    </div>
                    
                    {reading ? (
                      <div className="grid grid-4 gap-4">
                        <div className="env-stat">
                          <div className="env-stat-icon">
                            <Thermometer className="w-4 h-4 text-red-500" />
                          </div>
                          <div className="env-stat-value">
                            {reading.temperature ? `${reading.temperature}°F` : 'N/A'}
                          </div>
                          <div className="env-stat-label">Temperature</div>
                        </div>
                        <div className="env-stat">
                          <div className="env-stat-icon">
                            <Droplets className="w-4 h-4 text-blue-500" />
                          </div>
                          <div className="env-stat-value">
                            {reading.humidity ? `${reading.humidity}%` : 'N/A'}
                          </div>
                          <div className="env-stat-label">Humidity</div>
                        </div>
                        <div className="env-stat">
                          <div className="env-stat-icon">
                            <Wind className="w-4 h-4 text-cyan-500" />
                          </div>
                          <div className="env-stat-value">
                            {reading.vpd ? `${reading.vpd}kPa` : 'N/A'}
                          </div>
                          <div className="env-stat-label">VPD</div>
                        </div>
                        <div className="env-stat">
                          <div className="env-stat-icon">
                            <TestTube className="w-4 h-4 text-green-500" />
                          </div>
                          <div className="env-stat-value">
                            {reading.ph_level ? reading.ph_level.toFixed(1) : 'N/A'}
                          </div>
                          <div className="env-stat-label">pH Level</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Thermometer className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No environment data yet</p>
                        <Link to="/environment" className="text-blue-400 hover:text-blue-300 text-sm">
                          Add reading →
                        </Link>
                      </div>
                    )}
                    
                    {reading && (
                      <div className="mt-4 pt-4 border-t border-gray-700/50">
                        <p className="text-xs text-gray-500">
                          Last reading {formatDistanceToNow(new Date(reading.logged_at))} ago
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Plants by Tent */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">🌱 Plants by Grow Tent</h2>
          <Link to="/plants" className="section-link">
            View All Plants <span className="ml-1">→</span>
          </Link>
        </div>
        <div className="section-content">
          {Object.keys(groupedPlants).length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <Sprout className="w-16 h-16" />
              </div>
              <h3 className="empty-title">No plants yet</h3>
              <p className="empty-description">Start your cultivation journey by adding your first plant</p>
              <Link to="/plants" className="btn btn-primary">
                <Plus className="w-4 h-4" />
                Add Your First Plant
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedPlants).map(([tentName, tentPlants]) => (
                <div key={tentName} className="grow-tent-group">
                  <div className="grow-tent-header">
                    <div className="flex items-center gap-3">
                      <Home className="w-5 h-5" />
                      <h3 className="text-xl font-bold">{tentName}</h3>
                      <span className="grow-tent-count">
                        {tentPlants.length} plant{tentPlants.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-2 gap-6">
                    {tentPlants.slice(0, 4).map((plant) => {
                      const stageConfig = getStageConfig(plant.stage);
                      return (
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
                            </div>
                            <span className={`stage-badge stage-${plant.stage}`}>
                              {stageConfig.emoji} {stageConfig.label}
                            </span>
                          </div>
                          <div className="plant-meta">
                            {plant.planted_date && (
                              <div className="plant-meta-item">
                                <Calendar className="w-4 h-4" />
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
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {tentPlants.length > 4 && (
                    <div className="text-center mt-4">
                      <Link 
                        to={`/plants?tent=${encodeURIComponent(tentName)}`} 
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        View all {tentPlants.length} plants in {tentName} →
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard; 