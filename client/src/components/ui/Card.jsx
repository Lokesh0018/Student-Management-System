import React from 'react';
import './Card.css';

export const Card = ({ children, className = '', condensed = false, ...props }) => {
  return (
    <div className={`card ${condensed ? 'card-condensed' : ''} ${className}`} {...props}>
      {children}
    </div>
  );
};
