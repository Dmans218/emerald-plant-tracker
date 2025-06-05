import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sprout, TrendingUp, Plus, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

import { plantsApi } from '../utils/api';

const STAGE_CONFIG = {
  seedling: { emoji: '🌱', label: 'Seedling' },
  vegetative: { emoji: '🌿', label: 'Vegetative' },
  flowering: { emoji: '🌸', label: 'Flowering' },
  harvest: { emoji: '🌾', label: 'Harvest' },
  cured: { emoji: '📦', label: 'Cured' }
};

const Dashboard = () => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlants();
  }, []);

  const fetchPlants = async () => {
    try {
      setLoading(true);
      const plantsData = await plantsApi.getAll();
      setPlants(plantsData);
    } catch (error) {
      toast.error('Failed to load plants');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStageConfig = (stage) => {
    return STAGE_CONFIG[stage] || STAGE_CONFIG.seedling;
  };

  const stats = {
    totalPlants: plants.length,
    activeStages: plants.reduce((acc, plant) => {
      acc[plant.stage] = (acc[plant.stage] || 0) + 1;
      return acc;
    }, {})
  };

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
            <p className="dashboard-subtitle">Monitor your cannabis cultivation journey</p>
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

      <section className="stats-grid">
        <div className="stat-card stat-plants">
          <div className="stat-content">
            <div className="stat-info">
              <p className="stat-label">Active Plants</p>
              <p className="stat-value">{stats.totalPlants}</p>
              <p className="stat-description">Growing strong</p>
            </div>
            <div className="stat-icon">
              <Sprout className="w-8 h-8" />
            </div>
          </div>
          <div className="stat-visual"></div>
        </div>

        <div className="stat-card stat-stages">
          <div className="stat-content">
            <div className="stat-info">
              <p className="stat-label">Growth Stages</p>
              <p className="stat-value">{Object.keys(stats.activeStages).length}</p>
              <p className="stat-description">Different phases</p>
            </div>
            <div className="stat-icon">
              <TrendingUp className="w-8 h-8" />
            </div>
          </div>
          <div className="stat-visual"></div>
        </div>

        <div className="stat-card stat-activity">
          <div className="stat-content">
            <div className="stat-info">
              <p className="stat-label">Nutrient Calculator</p>
              <p className="stat-value">Ready</p>
              <p className="stat-description">
                <Link to="/logs" className="text-accent">Calculate nutrients →</Link>
              </p>
            </div>
            <div className="stat-icon">
              <Calendar className="w-8 h-8" />
            </div>
          </div>
          <div className="stat-visual"></div>
        </div>
      </section>

      <section className="dashboard-section">
        <header className="section-header">
          <h2 className="section-title">🌱 Your Plants</h2>
          <Link to="/plants" className="section-link">
            View All <span className="ml-1">→</span>
          </Link>
        </header>

        <div className="section-content">
          {plants.length === 0 ? (
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
            <div className="plants-grid">
              {plants.slice(0, 4).map((plant) => {
                const stageConfig = getStageConfig(plant.stage);
                return (
                  <Link
                    key={plant.id}
                    to={`/plants/${plant.id}`}
                    className="plant-preview-card"
                  >
                    <header className="plant-preview-header">
                      <h3 className="plant-preview-name">{plant.name}</h3>
                      <span className={`stage-badge stage-${plant.stage}`}>
                        {stageConfig.emoji} {stageConfig.label}
                      </span>
                    </header>
                    <p className="plant-preview-strain">{plant.strain || 'Unknown strain'}</p>
                    {plant.grow_tent && (
                      <p className="plant-preview-tent">📍 {plant.grow_tent}</p>
                    )}
                    <footer className="plant-preview-stats">
                      <span className="plant-stat">
                        📊 {plant.log_count || 0} logs
                      </span>
                      {plant.planted_date && (
                        <span className="plant-stat">
                          🗓️ {formatDistanceToNow(new Date(plant.planted_date))} old
                        </span>
                      )}
                    </footer>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard; 