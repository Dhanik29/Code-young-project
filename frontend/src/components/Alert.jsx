import React from 'react';

export const Alert = ({ type = 'info', message, details = [] }) => {
  if (!message) return null;

  const typeStyles = {
    info: 'alert-info',
    success: 'alert-success',
    warning: 'alert-warning',
    error: 'alert-error',
  };

  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
  };

  return (
    <div className={`alert ${typeStyles[type] || 'alert-info'}`} role="alert">
      <div className="alert-content">
        <span className="alert-icon">{icons[type]}</span>
        <div className="alert-message">
          <p className="alert-text">{message}</p>
          {details && details.length > 0 && (
            <ul className="alert-details">
              {details.map((item, idx) => (
                <li key={idx}>
                  <strong>{item.field ? `${item.field}: ` : ''}</strong>
                  {item.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
