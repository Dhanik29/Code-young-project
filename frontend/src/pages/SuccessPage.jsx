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

  const handleAddToGoogleCalendar = () => {
    try {
      const startDateTime = booking.bookingDateUTC ? new Date(booking.bookingDateUTC) : new Date();
      const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1 hour duration
      const fmtGCal = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const datesParam = `${fmtGCal(startDateTime)}/${fmtGCal(endDateTime)}`;
      const title = encodeURIComponent(`Codeyoung 1:1 Trial Class - ${booking.course || 'Coding'}`);
      const details = encodeURIComponent(
        `1:1 ${booking.course || 'Coding'} Trial Class with Codeyoung.\n\n` +
        `Mentor: ${booking.mentor?.name || 'Assigned Mentor'}\n` +
        `Meeting Link: ${booking.meetingLink || ''}\n` +
        `Booking ID: ${booking.bookingId || ''}\n\n` +
        `Please join 5 minutes early using Google Chrome.`
      );
      const location = encodeURIComponent(booking.meetingLink || '');
      const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${datesParam}&details=${details}&location=${location}`;
      window.open(gcalUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Error creating Google Calendar event URL:', err);
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

        {/* Add Event to Google Calendar Action */}
        <div className="calendar-action-card">
          <button
            type="button"
            onClick={handleAddToGoogleCalendar}
            className="btn btn-gcal"
            id="btn-add-gcal"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4H19ZM19 20H5V10H19V20ZM19 8H5V6H19V8ZM9 14H7V12H9V14ZM13 14H11V12H13V14ZM17 14H15V12H17V14ZM9 18H7V16H9V18ZM13 18H11V16H13V18ZM17 18H15V16H17V18Z" fill="currentColor"/>
            </svg>
            <span>Add Event to Google Calendar</span>
          </button>
          <span className="gcal-hint">Sync this trial class directly to your personal Google Calendar</span>
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
