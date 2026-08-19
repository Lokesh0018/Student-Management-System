import React from 'react';

const PlaceholderPage = ({ title }) => {
  return (
    <div className="page-container">
      <div className="dashboard-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{title}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>This page is under construction.</p>
      </div>
    </div>
  );
};

export default PlaceholderPage;
