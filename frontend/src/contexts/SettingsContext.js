import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [temperatureUnit, setTemperatureUnit] = useState(() => {
    // Initialize from localStorage or default to 'F'
    return localStorage.getItem('temperatureUnit') || 'F';
  });

  useEffect(() => {
    // Save to localStorage whenever temperature unit changes
    localStorage.setItem('temperatureUnit', temperatureUnit);
  }, [temperatureUnit]);

  const toggleTemperatureUnit = () => {
    setTemperatureUnit(prev => prev === 'F' ? 'C' : 'F');
  };

  const setTemperature = (unit) => {
    if (unit === 'F' || unit === 'C') {
      setTemperatureUnit(unit);
    }
  };

  const value = {
    temperatureUnit,
    toggleTemperatureUnit,
    setTemperature,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
