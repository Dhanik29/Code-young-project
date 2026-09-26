import React from 'react';
import { Spinner } from './Spinner.jsx';
import { Alert } from './Alert.jsx';

export const SlotPicker = ({ slots, selectedTime, onSelectTime, loading, error, date }) => {
  if (!date) {
    return (
      <div className="slot-placeholder">
        <p>Please select a date above to check mentor availability.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="slot-loading">
        <Spinner size="small" text="Checking mentor schedules in real-time..." />
      </div>
    );
  }

  if (error) {
    return <Alert type="error" message={error} />;
  }

  if (!slots || slots.length === 0) {
    return (
      <div className="slot-placeholder">
        <p>No slots found for this date. Please try another date.</p>
      </div>
    );
  }

  return (
    <div className="slot-picker-container">
      <div className="slot-picker-header">
        <label className="form-label">Available Time Slots (in your selected timezone)</label>
        <span className="slot-hint">60 min class · 1:1 Live Coding</span>
      </div>

      <div className="slot-grid">
        {slots.map((slot) => {
          const isSelected = selectedTime === slot.time;
          const isAvailable = slot.isAvailable;

          return (
            <button
              type="button"
              key={slot.time}
              disabled={!isAvailable}
              onClick={() => isAvailable && onSelectTime(slot.time)}
              className={`slot-card ${isSelected ? 'selected' : ''} ${
                !isAvailable ? 'disabled' : 'available'
              }`}
              title={slot.reason || `${slot.availableMentorsCount} mentor(s) ready`}
            >
              <span className="slot-time">{slot.label}</span>
              <span className="slot-badge">
                {isAvailable
                  ? `${slot.availableMentorsCount} free`
                  : slot.reason?.includes('past')
                  ? 'Past'
                  : 'Full'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
