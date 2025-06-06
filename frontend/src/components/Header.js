import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sprout, Calculator, Home, Thermometer } from 'lucide-react';

const Header = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/plants', label: 'Plants', icon: Sprout },
    { path: '/calculator', label: 'Nutrient Calculator', icon: Calculator },
    { path: '/environment', label: 'Environment', icon: Thermometer },
  ];

  return (
    <header className="navbar">
      <div className="container mx-auto">
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
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`nav-item ${location.pathname === path ? 'nav-item-active' : ''}`}
              >
                <Icon className="nav-icon" />
                <span className="nav-label">{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header; 