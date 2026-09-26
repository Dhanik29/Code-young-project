import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { Spinner } from '../components/Spinner.jsx';
import { Alert } from '../components/Alert.jsx';

export const BookingsListPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookings = () => {
    setLoading(true);
    setError(null);
    api
      .getBookings()
      .then((res) => {
        setBookings(res.data || []);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch bookings.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div className="page-wrapper">
      <div className="dashboard-header">
        <div>
          <h2>Scheduled Trial Classes Dashboard</h2>
          <p>
            Real-time view of all booked parent trials, auto-assigned mentors, and
            dual-timezone representations stored in UTC.
          </p>
        </div>
        <div className="dashboard-actions">
          <button onClick={fetchBookings} className="btn btn-outline" disabled={loading}>
            🔄 Refresh
          </button>
          <Link to="/book" className="btn btn-primary">
            + Book New Trial
          </Link>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      {loading ? (
        <div className="table-loading">
          <Spinner text="Loading bookings from database..." />
        </div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          <p>No bookings found yet.</p>
          <Link to="/book" className="btn btn-primary">
            Be the First to Book a Trial!
          </Link>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Parent & Country</th>
                <th>Parent Local Time</th>
                <th>Assigned Mentor</th>
                <th>Mentor Local Time (IST)</th>
                <th>Meeting Link</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td>
                    <strong>{b.parent?.name}</strong>
                    <div className="sub-text">{b.parent?.email}</div>
                    <div className="sub-badge">{b.parent?.country}</div>
                  </td>
                  <td>
                    <div className="time-cell">{b.parentFormattedTime}</div>
                    <div className="sub-text">{b.parentTimezone}</div>
                  </td>
                  <td>
                    <strong>{b.mentor?.name}</strong>
                    <div className="sub-text">{b.mentor?.email}</div>
                  </td>
                  <td>
                    <div className="time-cell">{b.mentorFormattedTime}</div>
                    <div className="sub-text">{b.mentorTimezone}</div>
                  </td>
                  <td>
                    <a
                      href={b.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="table-link"
                    >
                      Join Meeting ↗
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
