import React, { useState } from 'react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CalendarPicker = ({ selectedDate, onSelectDate, minDate, maxDate }) => {
  // Parse currently selected date or default to today/tomorrow
  const initialDate = selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date();
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);

    }
  };

  // Calculate calendar grid days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const minDateObj = minDate ? new Date(minDate + 'T00:00:00') : new Date();
  minDateObj.setHours(0, 0, 0, 0);

  const maxDateObj = maxDate ? new Date(maxDate + 'T00:00:00') : null;
  if (maxDateObj) {
    maxDateObj.setHours(23, 59, 59, 999);
  }

  const cells = [];

  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    cells.push({
      day: daysInPrevMonth - i,
      month: currentMonth - 1,
      year: currentMonth === 0 ? currentYear - 1 : currentYear,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({
      day: i,
      month: currentMonth,
      year: currentYear,
      isCurrentMonth: true,
    });
  }

  // Next month leading days to complete grid (42 cells = 6 rows)
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) {
    cells.push({
      day: i,
      month: currentMonth + 1,
      year: currentMonth === 11 ? currentYear + 1 : currentYear,
      isCurrentMonth: false,
    });
  }

  const formatDateStr = (y, m, d) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  return (
    <div className="calendar-widget">
      {/* Calendar Header with Navigation */}
      <div className="cal-header">
        <button
          type="button"
          onClick={prevMonth}
          className="cal-nav-btn"
          aria-label="Previous Month"
        >
          ‹
        </button>
        <div className="cal-month-title">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </div>
        <button
          type="button"
          onClick={nextMonth}
          className="cal-nav-btn"
          aria-label="Next Month"
        >
          ›
        </button>
      </div>

      {/* Weekday Labels */}
      <div className="cal-weekdays">
        {DAY_NAMES.map((d) => (
          <span key={d} className="cal-weekday">
            {d}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="cal-days-grid">
        {cells.map((cell, idx) => {
          let adjustedMonth = cell.month;
          let adjustedYear = cell.year;
          if (adjustedMonth < 0) {
            adjustedMonth = 11;
            adjustedYear--;
          } else if (adjustedMonth > 11) {
            adjustedMonth = 0;
            adjustedYear++;
          }

          const dateStr = formatDateStr(adjustedYear, adjustedMonth, cell.day);
          const cellDateObj = new Date(adjustedYear, adjustedMonth, cell.day);
          cellDateObj.setHours(0, 0, 0, 0);

          const isPast = cellDateObj < minDateObj;
          const isFutureBeyondMax = maxDateObj ? cellDateObj > maxDateObj : false;
          const isDisabled = isPast || isFutureBeyondMax || !cell.isCurrentMonth;
          const isSelected = selectedDate === dateStr;

          return (
            <button
              type="button"
              key={idx}
              disabled={isDisabled}
              onClick={() => cell.isCurrentMonth && !isPast && !isFutureBeyondMax && onSelectDate(dateStr)}
              className={`cal-day-cell ${!cell.isCurrentMonth ? 'other-month' : ''
                } ${isSelected ? 'selected' : ''} ${isPast || isFutureBeyondMax ? 'past' : ''}`}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
};
