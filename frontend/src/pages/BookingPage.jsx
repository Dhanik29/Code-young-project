import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { useSlots } from '../hooks/useSlots.js';
import { SlotPicker } from '../components/SlotPicker.jsx';
import { Alert } from '../components/Alert.jsx';
import { Spinner } from '../components/Spinner.jsx';
import { TIMEZONES, COUNTRIES, COURSES, DETECTED_TIMEZONE } from '../utils/constants.js';
import { getTomorrowISO } from '../utils/formatters.js';

export const BookingPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    course: '',
    country: 'United States',
    timezone: DETECTED_TIMEZONE,
    date: getTomorrowISO(),
    time: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorDetails, setErrorDetails] = useState([]);

  // Dynamic slot availability hook
  const { slots, loading: slotsLoading, error: slotsError } = useSlots(
    formData.date,
    formData.timezone
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      // If date or timezone changes, reset selected time slot so user re-evaluates
      if (name === 'date' || name === 'timezone') {
        return { ...prev, [name]: value, time: '' };
      }
      return { ...prev, [name]: value };
    });
    setErrorMessage('');
    setErrorDetails([]);
  };

  const handleSelectTime = (selectedTimeSlot) => {
    setFormData((prev) => ({ ...prev, time: selectedTimeSlot }));
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setErrorDetails([]);

    // Client-side quick checks
    if (!formData.name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!formData.course) {
      setErrorMessage('Please select a course for the trial class.');
      return;
    }
    if (!formData.date) {
      setErrorMessage('Please select a booking date.');
      return;
    }
    if (!formData.time) {
      setErrorMessage('Please select an available time slot.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.createBooking({
        name: formData.name.trim(),
        email: formData.email.trim(),
        course: formData.course,
        country: formData.country,
        timezone: formData.timezone,
        date: formData.date,
        time: formData.time,
      });

      // Navigate to success page with booking confirmation data
      navigate('/success', {
        state: { booking: response.data },
        replace: true,
      });
    } catch (err) {
      setErrorMessage(
        err.message || 'Failed to complete booking. Please try again.'
      );
      if (err.details) {
        setErrorDetails(err.details);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="form-card">
        <div className="form-header">
          <h2>Schedule Your Free 1:1 Trial Class</h2>
          <p>
            Fill in your details and select a slot in your local timezone. We will
            instantly match your child with an available mentor.
          </p>
        </div>

        {errorMessage && (
          <Alert type="error" message={errorMessage} details={errorDetails} />
        )}

        <form onSubmit={handleSubmit} className="booking-form" noValidate>
          {/* Row 1: Name and Email */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Parent Full Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="e.g. Sarah Jenkins"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="e.g. sarah.jenkins@example.com"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 2: Course */}
          <div className="form-group">
            <label htmlFor="course" className="form-label">
              Course *
            </label>
            <select
              id="course"
              name="course"
              className="form-select"
              value={formData.course}
              onChange={handleChange}
              required
            >
              <option value="">— Select a course —</option>
              {COURSES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Row 3: Country and Timezone */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="country" className="form-label">
                Country *
              </label>
              <select
                id="country"
                name="country"
                className="form-select"
                value={formData.country}
                onChange={handleChange}
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="timezone" className="form-label">
                Your Local Timezone *
              </label>
              <select
                id="timezone"
                name="timezone"
                className="form-select"
                value={formData.timezone}
                onChange={handleChange}
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Date */}
          <div className="form-group">
            <label htmlFor="date" className="form-label">
              Trial Date *
            </label>
            <input
              id="date"
              name="date"
              type="date"
              required
              min={getTomorrowISO()}
              className="form-input"
              value={formData.date}
              onChange={handleChange}
            />
          </div>

          {/* Time Slot Picker with dynamic availability */}
          <div className="form-group">
            <SlotPicker
              date={formData.date}
              slots={slots}
              selectedTime={formData.time}
              onSelectTime={handleSelectTime}
              loading={slotsLoading}
              error={slotsError}
            />
          </div>

          {/* Submit CTA */}
          <div className="form-actions">
            <button
              type="submit"
              disabled={submitting || !formData.time || !formData.course}
              className="btn btn-primary btn-block btn-large"
            >
              {submitting ? (
                <Spinner size="small" text="Assigning Best Mentor & Booking..." />
              ) : (
                'Confirm 1:1 Trial Booking →'
              )}
            </button>
            <p className="privacy-note">
              🔒 No credit card required. A dummy meeting link will be generated immediately.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
