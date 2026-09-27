
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Navbar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar">
      <div className="nav-container">
        <Link to="/" className="brand">
          <span className="brand-logo-icon">&lt;&gt;</span>
          <span className="brand-text">Codeyoung</span>
        </Link>
        <nav className="nav-links">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            Programs
          </Link>
          <a href="/#curriculum" className="nav-link">
            How it Works
          </a>
          <a href="/#features" className="nav-link">
            For Parents
          </a>
          <Link to="/bookings" className={`nav-link ${isActive('/bookings') ? 'active' : ''}`}>
            Dashboard
          </Link>
        </nav>
        <div className="nav-actions">
          <Link to="/bookings" className="nav-login-link">
            Log in
          </Link>
          <Link to="/book" className="btn btn-nav-cta" id="nav-book-trial-btn">
            Book a Free Trial
          </Link>
        </div>
      </div>
    </header>
  );
};

