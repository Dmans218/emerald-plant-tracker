import { Archive, BarChart, Home, Leaf, Menu, Sun, Thermometer, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './MobileNavigation.css';

const MobileNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const drawerRef = useRef(null);
  const triggerRef = useRef(null);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);

  const location = useLocation();

  // Close drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Close drawer on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target) &&
        !triggerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  const handleTouchStart = (e) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX && touchEndX) {
      const distance = touchStartX - touchEndX;
      if (distance > 50) { // Swiped left
        setIsOpen(false);
      }
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <Home size={20} /> },
    { path: '/plants', label: 'Plants', icon: <Leaf size={20} /> },
    { path: '/environment', label: 'Environment', icon: <Thermometer size={20} /> },
    { path: '/logs', label: 'Logs', icon: <BarChart size={20} /> },
    { path: '/calculator', label: 'Calculator', icon: <Sun size={20} /> },
    { path: '/archived', label: 'Archived', icon: <Archive size={20} /> }
  ];

  return (
    <>
      <button
        ref={triggerRef}
        className="mobile-nav-trigger"
        onClick={toggleDrawer}
        aria-label="Open navigation"
        aria-expanded={isOpen}
      >
        <Menu size={28} />
      </button>

      <div className={`mobile-nav-overlay ${isOpen ? 'is-open' : ''}`} onClick={toggleDrawer} data-testid="mobile-nav-overlay"></div>

      {/*
        Accessibility Note: For a production-ready component, consider a focus-trapping library
        (like 'focus-trap-react') to prevent keyboard navigation outside the open drawer.
        The main content of the app should also have `aria-hidden="true"` or `inert` when the drawer is open.
      */}
      <nav
        ref={drawerRef}
        className={`mobile-nav-drawer ${isOpen ? 'is-open' : ''}`}
        aria-hidden={!isOpen}
        data-testid="mobile-nav-drawer"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="mobile-nav-header">
          <h3>Navigation</h3>
          <button onClick={toggleDrawer} aria-label="Close navigation">
            <X size={28} />
          </button>
        </div>
        <ul>
          {navItems.map(item => (
            <li key={item.path}>
              <Link to={item.path} className={location.pathname === item.path ? 'active' : ''}>
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

export default MobileNavigation;

// TODO: Task 2.1 - Enhance CSS grid system for mobile-first approach. Update main layout/container CSS in index.css for mobile-first grid.
