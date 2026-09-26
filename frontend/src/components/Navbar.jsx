import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle.jsx';

export const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar">
      <div className="container nav-container">
        <Link to="/" className="brand">
          <span className="brand-badge">CY</span>
          <span className="brand-text">Codeyoung</span>
          <span className="brand-tag">Trial Booking</span>
        </Link>
        <div className="nav-right">
          <nav className="nav-links">
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
              Home
            </Link>
            <Link to="/book" className={`nav-link ${isActive('/book') ? 'active' : ''}`}>
              Book Class
            </Link>
            <Link to="/bookings" className={`nav-link ${isActive('/bookings') ? 'active' : ''}`}>
              Dashboard
            </Link>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
