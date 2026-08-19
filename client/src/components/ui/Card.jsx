import React from 'react';
import { motion } from 'framer-motion';
import './css/Card.css';

export const Card = ({ children, className = '', condensed = false, glass = false, hover = false, ...props }) => {
  return (
    <motion.div 
      whileHover={hover ? { y: -4, boxShadow: 'var(--shadow-2)' } : {}}
      transition={{ duration: 0.2 }}
      className={`card ${condensed ? 'card-condensed' : ''} ${glass ? 'glass-panel' : ''} ${className}`} 
      {...props}
    >
      {children}
    </motion.div>
  );
};
