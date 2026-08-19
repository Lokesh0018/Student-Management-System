import React from 'react';
import { motion } from 'framer-motion';
import './css/Button.css';

export const Button = ({ variant = 'primary', className = '', isLoading = false, children, ...props }) => {
  return (
    <motion.button 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`btn btn-${variant} ${className} ${isLoading ? 'btn-loading' : ''}`} 
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? <span className="btn-spinner"></span> : null}
      <span className={isLoading ? 'opacity-0' : ''}>{children}</span>
    </motion.button>
  );
};
