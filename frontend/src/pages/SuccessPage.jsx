import React, { useState } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import QRCode from 'react-qr-code';

export const SuccessPage = () => {
  const location = useLocation();
  const booking = location.state?.booking;

  const [copied, setCopied] = useState(false);

  // If no booking state exists, redirect to booking page
  if (!booking) {
    return <Navigate to="/book" replace />;
  }

  const handleCopyLink = () => {
    if (booking.meetingLink) {
      navigator.clipboard.writeText(booking.meetingLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="success-card">
        <div className="success-header">
          <div className="success-badge-icon">🎉</div>
          <h2>Trial Class Booked Successfully!</h2>
          <p className="success-subtitle">
            A confirmation has been recorded. Below are the class schedules in your timezone
            and your assigned mentor's timezone.
          </p>
        </div>

        <div className="booking-summary-grid">
          {/* Course Badge */}
          {booking.course && (
            <div className="summary-box course-summary-box">
              <span className="box-badge course-badge">
                📚 Course Booked
              </span>
              <h3 className="course-title">
                {booking.course}
              </h3>
            </div>
          )}

          {/* Parent Time Card */}
          <div className="summary-box parent-box">
            <span className="box-badge">Parent's Schedule</span>
            <h3>{booking.parent?.name}</h3>
            <p className="box-email">{booking.parent?.email}</p>
            <div className="time-highlight">
              <span className="time-label">Local Timing:</span>
              <p className="time-value">{booking.parent?.formattedTime}</p>
            </div>
            <p className="tz-label">Timezone: {booking.parent?.timezone}</p>
          </div>

          {/* Mentor Time Card */}
          <div className="summary-box mentor-box">
            <span className="box-badge mentor-badge">Assigned Mentor</span>
            <h3>{booking.mentor?.name}</h3>
            <p className="box-email">{booking.mentor?.email}</p>
            <div className="time-highlight">
              <span className="time-label">Mentor Local Timing:</span>
              <p className="time-value">{booking.mentor?.formattedTime}</p>
            </div>
            <p className="tz-label">Timezone: {booking.mentor?.timezone}</p>
          </div>
        </div>

        {/* QR Code Card — placed directly above the meeting link section */}
        {booking.meetingLink && (
          <div className="qr-card">
            <p className="qr-heading">📱 Scan QR to Join Trial Class</p>
            <div className="qr-wrapper">
              <QRCode
                value={booking.meetingLink}
                size={200}
                bgColor="#ffffff"
                fgColor="#1e293b"
                level="M"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
            <p className="qr-caption">
              Scan this QR to open the meeting link on another device.
            </p>
          </div>
        )}

        {/* Meeting Link Box */}
        <div className="meeting-link-card">
          <div className="link-info">
            <span className="link-title">Class Meeting Link:</span>
            <a
              href={booking.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="meeting-url"
            >
              {booking.meetingLink}
            </a>
          </div>
          <button
            type="button"
            onClick={handleCopyLink}
            className="btn btn-outline btn-copy"
          >
            {copied ? 'Copied! ✓' : 'Copy Link 📋'}
          </button>
        </div>

        {/* UTC & Reference Metadata */}
        <div className="meta-strip">
          <span>Booking ID: <code>{booking.bookingId}</code></span>
          <span>System UTC: <code>{booking.bookingDateUTC}</code></span>
        </div>

        {/* Navigation CTAs */}
        <div className="success-actions">
          <Link to="/book" className="btn btn-primary">
            Book Another Trial Class
          </Link>
          <Link to="/bookings" className="btn btn-outline">
            View Live Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};
