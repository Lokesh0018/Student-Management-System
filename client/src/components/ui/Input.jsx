import React from 'react';
import './css/Input.css';

export const Input = ({ label, id, className = '', ...props }) => {
  return (
    <div className={`input-group ${className}`}>
      <input id={id} className="input-field" placeholder=" " {...props} />
      {label && <label htmlFor={id} className="input-label">{label}</label>}
    </div>
  );
};
