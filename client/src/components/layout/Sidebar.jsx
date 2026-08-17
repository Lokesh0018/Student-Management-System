import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaSignOutAlt, FaTachometerAlt, FaUserGraduate, FaChalkboardTeacher, FaUsers, FaBook, FaCalendarCheck, FaClipboardList, FaChartLine, FaRegFileAlt, FaCog } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

export const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-icon-small">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22S4 17.5 4 11V5l8-3 8 3v6c0 6.5-8 11-8 11z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 8l1.5 3h3.5l-2.5 2.5 1 3.5-3.5-2-3.5 2 1-3.5-2.5-2.5h3.5L12 8z" fill="white"/>
            </svg>
          </div>
          <div className="brand-text">
            <h2 className="sidebar-logo">SMS</h2>
            <p className="sidebar-sub">School Management System</p>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to="/admin/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <FaTachometerAlt className="sidebar-icon" /> Dashboard
          </NavLink>
          <NavLink to="/admin/students" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <FaUserGraduate className="sidebar-icon" /> Students
          </NavLink>
          <NavLink to="/admin/teachers" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <FaChalkboardTeacher className="sidebar-icon" /> Teachers
          </NavLink>
          <NavLink to="/admin/parents" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <FaUsers className="sidebar-icon" /> Parents
          </NavLink>
          <NavLink to="/exams" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <FaClipboardList className="sidebar-icon" /> Exams
          </NavLink>
          <NavLink to="/admin/attendance" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <FaCalendarCheck className="sidebar-icon" /> Attendance
          </NavLink>
          <NavLink to="/admin/remarks" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <FaRegFileAlt className="sidebar-icon" /> Remarks
          </NavLink>
          <NavLink to="/admin/performance" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <FaChartLine className="sidebar-icon" /> Performance
          </NavLink>
          <NavLink to="/admin/reports" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <FaChartLine className="sidebar-icon" /> Reports
          </NavLink>
          <NavLink to="/admin/settings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <FaCog className="sidebar-icon" /> Settings
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={logout}>
            <FaSignOutAlt className="sidebar-icon" /> Logout
          </button>
        </div>
      </aside>
    </>
  );
};
