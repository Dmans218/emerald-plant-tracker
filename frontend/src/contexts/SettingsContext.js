import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'emeraldTemperatureUnit';

const readStoredUnit = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'C' || stored === 'F' ? stored : 'F';
  } catch {
    return 'F';
  }
};

const SettingsContext = createContext(undefined);

export const SettingsProvider = ({ children }) => {
  const [temperatureUnit, setTemperatureUnitState] = useState(readStoredUnit);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, temperatureUnit);
    } catch {
      // ignore write errors (e.g. private browsing / storage disabled)
    }
  }, [temperatureUnit]);

  const setTemperatureUnit = useCallback((unit) => {
    setTemperatureUnitState(unit === 'C' ? 'C' : 'F');
  }, []);

  const toggleTemperatureUnit = useCallback(() => {
    setTemperatureUnitState((prev) => (prev === 'F' ? 'C' : 'F'));
  }, []);

  const value = useMemo(() => ({
    temperatureUnit,
    setTemperatureUnit,
    toggleTemperatureUnit,
  }), [temperatureUnit, setTemperatureUnit, toggleTemperatureUnit]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return ctx;
};
