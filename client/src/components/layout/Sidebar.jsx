import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
    FaSignOutAlt, FaTachometerAlt, FaUserGraduate, FaChalkboardTeacher, 
    FaUsers, FaBook, FaCalendarCheck, FaClipboardList, FaChartLine, 
    FaRegFileAlt, FaCog, FaBookOpen
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './css/Sidebar.css';

export const Sidebar = ({ isOpen, onClose }) => {
  const { logout, user } = useAuth();

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-icon-small">
            <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
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
          <NavLink to="/admin/classes" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <FaBook className="sidebar-icon" /> Classes
          </NavLink>

          <NavLink to="/admin/exams" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <FaClipboardList className="sidebar-icon" /> Examinations
          </NavLink>
          <NavLink to="/admin/subjects" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <FaBookOpen className="sidebar-icon" /> Subjects
          </NavLink>
          <NavLink to="/admin/marks" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <FaRegFileAlt className="sidebar-icon" /> Marks
          </NavLink>
          <NavLink to="/admin/attendance" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <FaCalendarCheck className="sidebar-icon" /> Attendance
          </NavLink>
          <NavLink to="/admin/remarks" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <FaRegFileAlt className="sidebar-icon" /> Remarks
          </NavLink>

          <NavLink to="/admin/reports" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <FaChartLine className="sidebar-icon" /> Reports
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={logout}>
            <FaSignOutAlt className="sidebar-icon text-red" style={{ color: '#ef4444' }} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
};
