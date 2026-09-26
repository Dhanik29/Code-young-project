import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';

export const HomePage = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getMentors()
      .then((res) => {
        setMentors(res.data || []);
      })
      .catch((err) => {
        console.error('Failed to fetch mentors:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="page-wrapper">
      <section className="hero-section">
        <div className="hero-badge">🌟 Codeyoung Official Trial Class Booking</div>
        <h1 className="hero-title">
          Book a Free 1:1 Live Coding Trial Class for Your Child
        </h1>
        <p className="hero-description">
          Experience world-class STEM and coding education tailored to your child's age.
          Choose a convenient time in your local timezone, and our smart system will automatically
          assign an expert mentor with guaranteed focused attention.
        </p>
        <div className="hero-actions">
          <Link to="/book" className="btn btn-primary btn-large">
            Book Trial Class Now →
          </Link>
          <Link to="/bookings" className="btn btn-outline btn-large">
            View Live Dashboard
          </Link>
        </div>
      </section>

      {/* Feature highlights */}
      <section className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">🕒</div>
          <h3>Seamless Timezone Precision</h3>
          <p>
            Whether you are in New York (EDT), Chicago (CDT), London (BST), or anywhere globally,
            our Luxon-powered engine automatically converts timings and handles Daylight Saving shifts.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">👨‍🏫</div>
          <h3>Dedicated 10-Mentor Team</h3>
          <p>
            Each mentor takes a maximum of 2 classes per day to ensure high energy, zero burnout,
            and 100% personalized attention for every student.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">⚖️</div>
          <h3>Smart Balanced Assignment</h3>
          <p>
            Our deterministic load-balancing algorithm automatically allocates the best available mentor
            and creates an instant secure meeting link.
          </p>
        </div>
      </section>

      {/* Mentors preview */}
      <section className="mentors-section">
        <div className="section-header">
          <h2>Meet Our Certified Mentors ({mentors.length || 10})</h2>
          <p>All mentors are based in India (Asia/Kolkata) with strict limits of 2 classes/day.</p>
        </div>

        <div className="mentors-grid">
          {mentors.map((mentor) => (
            <div key={mentor.id} className="mentor-chip">
              <div className="mentor-avatar">
                {mentor.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div className="mentor-info">
                <h4>{mentor.name}</h4>
                <p className="mentor-meta">
                  {mentor.timezone} · Max {mentor.dailyLimit} classes/day
                </p>
                <span className="mentor-tag">
                  {mentor.totalBookings} total booked
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
