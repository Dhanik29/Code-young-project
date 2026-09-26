import React from 'react';

export const Spinner = ({ size = 'medium', text = 'Loading...' }) => {
  return (
    <div className={`spinner-wrapper spinner-${size}`}>
      <div className="spinner-circle" aria-hidden="true"></div>
      {text && <span className="spinner-text">{text}</span>}
    </div>
  );
};
