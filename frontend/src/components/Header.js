import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sprout, Calculator, Thermometer, ClipboardList, Archive } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const navItems = [
  { path: '/', label: 'Plants', shortLabel: 'Plants', icon: Sprout, match: 'plants' },
  { path: '/logs', label: 'Logs', shortLabel: 'Logs', icon: ClipboardList },
  { path: '/environment', label: 'Environment', shortLabel: 'Env', icon: Thermometer },
  { path: '/archived', label: 'Archive', shortLabel: 'Archive', icon: Archive },
  { path: '/calculator', label: 'Calculator', shortLabel: 'Calc', icon: Calculator },
];

const Header = () => {
  const location = useLocation();
  const { temperatureUnit, toggleTemperatureUnit } = useSettings();

  const isActive = (item) => {
    if (item.match === 'plants') {
      return location.pathname === '/' || location.pathname.startsWith('/plants');
    }
    return location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
  };

  return (
    <>
      <header className="navbar">
        <div className="container">
          <div className="navbar-content">
            <Link to="/" className="navbar-brand">
              <div className="brand-icon">
                <Sprout className="w-6 h-6" />
              </div>
              <div className="brand-text">
                <h1 className="brand-title">Emerald Plant Tracker</h1>
                <p className="brand-subtitle">Cannabis Cultivation Tracker</p>
              </div>
            </Link>

            <button
              type="button"
              className="unit-toggle-btn"
              onClick={toggleTemperatureUnit}
              aria-label="Toggle temperature unit"
              title={`Switch to °${temperatureUnit === 'F' ? 'C' : 'F'}`}
            >
              °{temperatureUnit}
            </button>

            <nav className="navbar-nav" aria-label="Main">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`nav-item ${active ? 'nav-item-active' : ''}`}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon className="nav-icon" />
                    <span className="nav-label">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      <nav className="bottom-nav" aria-label="Primary">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`bottom-nav-item ${active ? 'bottom-nav-item-active' : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="bottom-nav-icon" aria-hidden />
              <span className="bottom-nav-label">{item.shortLabel}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default Header;
