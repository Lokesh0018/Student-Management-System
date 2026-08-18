import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { FaSearch, FaBell } from 'react-icons/fa';
import './Layout.css';

export const Layout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "New student registration pending", time: "5m ago" },
    { id: 2, text: "System maintenance scheduled", time: "1h ago" }
  ]);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const getAvatarLetter = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'A';
      case 'teacher': return 'T';
      case 'parent': return 'P';
      default: return 'U';
    }
  };

  const getRoleClass = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'admin';
      case 'teacher': return 'teacher';
      case 'parent': return 'parent';
      default: return '';
    }
  };

  const handleProfileClick = () => {
    navigate(`/${user?.role?.toLowerCase() || 'admin'}/settings`);
  };

  return (
    <div className="app-layout">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="main-content">
        <header className="top-header">
          <div className="header-left">
            <button className="menu-btn mobile-only" onClick={() => setSidebarOpen(true)}>
              ☰
            </button>
            <div className="search-bar">
                <FaSearch className="search-icon" />
                <input type="text" placeholder="Search anything..." />
            </div>
          </div>
          <div className="header-right">
            <div className="notification-wrapper" style={{ position: 'relative' }}>
              <button 
                className="icon-btn header-bell" 
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <FaBell />
                {notifications.length > 0 && <span className="bell-dot"></span>}
              </button>
              
              {showNotifications && (
                <div className="notification-dropdown">
                  <div className="notif-header">
                    <h4>Notifications</h4>
                    {notifications.length > 0 && (
                      <button className="clear-btn" onClick={() => setNotifications([])}>Clear All</button>
                    )}
                  </div>
                  <div className="notif-body">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div key={n.id} className="notif-item">
                          <p>{n.text}</p>
                          <span>{n.time}</span>
                        </div>
                      ))
                    ) : (
                      <div className="notif-empty">No new notifications</div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="user-profile" onClick={handleProfileClick}>
              <div className={`avatar ${getRoleClass(user?.role)}`}>
                {getAvatarLetter(user?.role)}
              </div>
              <div className="user-info">
                  <span className="user-name">{user?.name || 'User'}</span>
                  <span className="user-role" style={{textTransform: 'capitalize'}}>{user?.role || 'Role'}</span>
              </div>
            </div>
          </div>
        </header>
        <div className="container">
          {children}
        </div>
      </main>
    </div>
  );
};
