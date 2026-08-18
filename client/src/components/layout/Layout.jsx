import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { FaSearch, FaBell } from 'react-icons/fa';
import './css/Layout.css';

export const Layout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
      try {
          const res = await fetch('/api/notifications', {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          const data = await res.json();
          if (data.success) {
              setNotifications(data.data);
          }
      } catch (error) {
          console.error('Error fetching notifications:', error);
      }
  };

  const handleClearAll = async () => {
      try {
          await fetch('/api/notifications/clear', {
              method: 'PUT',
              headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          setNotifications([]);
      } catch (error) {
          console.error('Error clearing notifications:', error);
      }
  };

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
                      <button className="clear-btn" onClick={handleClearAll}>Clear All</button>
                    )}
                  </div>
                  <div className="notif-body">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div key={n.id} className={`notif-item ${!n.is_read ? 'unread' : ''}`}>
                          <strong>{n.title}</strong>
                          <p>{n.message}</p>
                          <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                              {new Date(n.created_at).toLocaleString()}
                          </span>
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
