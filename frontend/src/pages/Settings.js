import React from 'react';
import { Settings as SettingsIcon, Thermometer, Save } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import toast from 'react-hot-toast';

const Settings = () => {
  const { temperatureUnit, setTemperature } = useSettings();

  const handleTemperatureChange = (unit) => {
    setTemperature(unit);
    toast.success(`Temperature unit changed to ${unit === 'F' ? 'Fahrenheit' : 'Celsius'}`);
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div className="settings-header-icon">
          <SettingsIcon className="w-8 h-8" />
        </div>
        <div>
          <h1 className="settings-title">Settings</h1>
          <p className="settings-subtitle">Customize your experience</p>
        </div>
      </div>

      <div className="settings-container">
        <div className="settings-section">
          <div className="settings-section-header">
            <Thermometer className="w-5 h-5" />
            <h2 className="settings-section-title">Temperature Units</h2>
          </div>
          
          <div className="settings-description">
            Choose your preferred temperature unit for displaying temperature values throughout the application.
          </div>

          <div className="temperature-unit-toggle">
            <button
              className={`temperature-option ${temperatureUnit === 'F' ? 'active' : ''}`}
              onClick={() => handleTemperatureChange('F')}
            >
              <div className="temperature-option-icon">🌡️</div>
              <div className="temperature-option-content">
                <div className="temperature-option-title">Fahrenheit</div>
                <div className="temperature-option-subtitle">°F</div>
              </div>
              {temperatureUnit === 'F' && (
                <div className="temperature-option-check">
                  <Save className="w-5 h-5" />
                </div>
              )}
            </button>

            <button
              className={`temperature-option ${temperatureUnit === 'C' ? 'active' : ''}`}
              onClick={() => handleTemperatureChange('C')}
            >
              <div className="temperature-option-icon">🌡️</div>
              <div className="temperature-option-content">
                <div className="temperature-option-title">Celsius</div>
                <div className="temperature-option-subtitle">°C</div>
              </div>
              {temperatureUnit === 'C' && (
                <div className="temperature-option-check">
                  <Save className="w-5 h-5" />
                </div>
              )}
            </button>
          </div>
        </div>

        <div className="settings-info">
          <p className="settings-info-text">
            Your settings are saved automatically and will be remembered for future visits.
          </p>
        </div>
      </div>

      <style jsx>{`
        .settings-page {
          max-width: 800px;
          margin: 0 auto;
        }

        .settings-header {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--border);
        }

        .settings-header-icon {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, var(--primary), var(--primary-light));
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .settings-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        .settings-subtitle {
          color: var(--text-secondary);
          margin: 0.25rem 0 0 0;
          font-size: 1rem;
        }

        .settings-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .settings-section {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 2rem;
        }

        .settings-section-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
          color: var(--primary);
        }

        .settings-section-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .settings-description {
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }

        .temperature-unit-toggle {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .temperature-option {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
          border: 2px solid var(--border);
          border-radius: 12px;
          background: var(--bg);
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .temperature-option:hover {
          border-color: var(--primary-light);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .temperature-option.active {
          border-color: var(--primary);
          background: linear-gradient(135deg, var(--primary), var(--primary-light));
        }

        .temperature-option.active .temperature-option-title,
        .temperature-option.active .temperature-option-subtitle {
          color: white;
        }

        .temperature-option-icon {
          font-size: 2rem;
        }

        .temperature-option-content {
          flex: 1;
        }

        .temperature-option-title {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.125rem;
        }

        .temperature-option-subtitle {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .temperature-option-check {
          color: white;
        }

        .settings-info {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
        }

        .settings-info-text {
          color: var(--text-secondary);
          margin: 0;
          font-size: 0.95rem;
        }
      `}</style>
    </div>
  );
};

export default Settings;
