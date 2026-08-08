import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sprout, Calculator, Thermometer, Activity, Archive } from 'lucide-react';

const Header = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Plants', icon: Sprout, match: 'plants' },
    { path: '/logs', label: 'Logs', icon: Activity },
    { path: '/environment', label: 'Environment', icon: Thermometer },
    { path: '/archived', label: 'Archive', icon: Archive },
    { path: '/calculator', label: 'Calculator', icon: Calculator },
  ];

  const isActive = (item) => {
    if (item.match === 'plants') {
      return location.pathname === '/' || location.pathname.startsWith('/plants');
    }
    return location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
  };

  return (
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

          <nav className="navbar-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-item ${isActive(item) ? 'nav-item-active' : ''}`}
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
  );
};

export default Header;
