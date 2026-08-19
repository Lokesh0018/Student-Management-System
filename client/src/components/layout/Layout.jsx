import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { FaSearch, FaBell, FaMoon, FaSun, FaBars, FaChevronRight, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import debounce from 'lodash.debounce';
import './css/Layout.css';

export const Layout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
      try {
          const res = await api.get('/notifications');
          if (res.data.success) {
              setNotifications(res.data.data);
          }
      } catch (error) {
          console.error('Error fetching notifications:', error);
      }
  };

  const handleClearAll = async () => {
      try {
          await api.put('/notifications/clear');
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

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark-mode');
  };

  const handleSearch = React.useCallback(
    debounce((query) => {
      // Future API call for global search
      console.log('Debounced search query:', query);
    }, 500),
    []
  );

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(p => p);
    let currentPath = '';
    return paths.map((path, index) => {
      currentPath += `/${path}`;
      const isLast = index === paths.length - 1;
      const formattedPath = path.charAt(0).toUpperCase() + path.slice(1);
      
      let linkTarget = currentPath;
      if (currentPath === '/admin') linkTarget = '/admin/dashboard';
      if (currentPath === '/teacher') linkTarget = '/teacher/dashboard';
      if (currentPath === '/parent') linkTarget = '/parent/dashboard';
      
      return (
        <React.Fragment key={path}>
          {index > 0 && <FaChevronRight className="breadcrumb-separator" />}
          {isLast ? (
            <span className="breadcrumb-item active">{formattedPath}</span>
          ) : (
            <Link to={linkTarget} className="breadcrumb-item breadcrumb-link" style={{ textDecoration: 'none' }}>
              {formattedPath}
            </Link>
          )}
        </React.Fragment>
      );
    });
  };

  return (
    <div className={`app-layout ${isCollapsed ? 'layout-collapsed' : ''}`}>
      <Sidebar isOpen={isSidebarOpen} isCollapsed={isCollapsed} onClose={() => setSidebarOpen(false)} />
      <main className="main-content">
        <header className="top-header">
          <div className="header-left">
            <button className="menu-btn mobile-only" onClick={() => setSidebarOpen(!isSidebarOpen)}>
              <motion.div
                initial={false}
                animate={{ rotate: isSidebarOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isSidebarOpen ? <FaTimes /> : <FaBars />}
              </motion.div>
            </button>
            <button className="menu-btn desktop-only" onClick={() => setIsCollapsed(!isCollapsed)}>
              <motion.div
                initial={false}
                animate={{ rotate: isCollapsed ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isCollapsed ? <FaTimes /> : <FaBars />}
              </motion.div>
            </button>
            <div className="search-bar">
                <FaSearch className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search anything..." 
                  onChange={(e) => handleSearch(e.target.value)}
                />
            </div>
          </div>
          <div className="header-right">
            <button 
              className="icon-btn" 
              onClick={toggleDarkMode}
              title="Toggle Dark Mode"
            >
              {isDarkMode ? <FaSun /> : <FaMoon />}
            </button>
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
        <div className="container fade-in">
          <div className="breadcrumbs">
            {getBreadcrumbs()}
          </div>
          {children}
        </div>
      </main>
    </div>
  );
};
