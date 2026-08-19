import React from 'react';
import { FaBars, FaChevronLeft } from 'react-icons/fa';

export const SidebarToggle = ({ isCollapsed, onToggle }) => {
  return (
    <button
      className={`sidebar-toggle-wrapper ${isCollapsed ? 'collapsed' : 'expanded'}`}
      onClick={onToggle}
      aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      aria-expanded={!isCollapsed}
    >
      <div className="toggle-content-container">
        {/* Brand Logo (Visible only when collapsed) */}
        <div className="toggle-logo">
          <img src="/logo.png" alt="SMS Logo" />
        </div>
        
        {/* Expand Icon (Visible on hover when collapsed) */}
        <div className="toggle-expand-icon">
          <FaBars />
        </div>

        {/* Collapse Icon (Visible when expanded) */}
        <div className="toggle-collapse-icon">
          <FaChevronLeft />
        </div>
      </div>
    </button>
  );
};
