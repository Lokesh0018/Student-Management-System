import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { SidebarToggle } from './SidebarToggle';
import { CommandPalette } from '../ui/CommandPalette';
import { useAuth } from '../../context/AuthContext';
import { useBreadcrumb } from '../../context/BreadcrumbContext';
import { FaSearch, FaBell, FaMoon, FaSun, FaBars, FaChevronRight, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import debounce from 'lodash.debounce';
import './css/Layout.css';

export const Layout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-state') === 'collapsed';
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  
  const { user } = useAuth();
  const { dynamicCrumbs } = useBreadcrumb();
  const navigate = useNavigate();
  const location = useLocation();
  const notificationRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Close sidebar on page change for smaller devices
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const unreadNotifications = notifications.filter(n => !n.is_read);

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowPalette(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebar-state', isCollapsed ? 'collapsed' : 'expanded');
  }, [isCollapsed]);

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

  const handleNotificationClick = (n) => {
    const title = n.title?.toLowerCase() || '';
    const type = n.type?.toLowerCase() || '';
    const message = n.message?.toLowerCase() || '';
    
    if (title.includes('remark') || type.includes('remark') || message.includes('remark')) {
      if (user?.role === 'CLASS_TEACHER' || user?.role === 'ADMIN') {
        navigate('/admin/remarks');
      } else if (user?.role === 'PARENT') {
        navigate('/parent/remarks');
      }
    } 
    else if (title.includes('attendance') || type.includes('attendance') || message.includes('attendance')) {
      if (user?.role === 'CLASS_TEACHER' || user?.role === 'ADMIN') {
        navigate('/admin/attendance');
      } else if (user?.role === 'PARENT') {
        navigate('/parent/attendance');
      }
    }

    setShowNotifications(false);
  };

  const getAvatarLetter = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'A';
      case 'teacher': 
      case 'class_teacher': return 'T';
      case 'parent': return 'P';
      default: return 'U';
    }
  };

  const getRoleClass = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'admin';
      case 'teacher': 
      case 'class_teacher': return 'teacher';
      case 'parent': return 'parent';
      default: return '';
    }
  };

  const handleProfileClick = () => {
    const roleBasePath = user?.role === 'ADMIN' ? 'admin' : user?.role === 'CLASS_TEACHER' ? 'teacher' : 'parent';
    navigate(`/${roleBasePath}/settings`);
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
      const formattedPath = dynamicCrumbs[path] || (path.charAt(0).toUpperCase() + path.slice(1));
      
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
      <SidebarToggle 
        isCollapsed={isCollapsed} 
        onToggle={() => setIsCollapsed(!isCollapsed)} 
      />
      <Sidebar isOpen={isSidebarOpen} isCollapsed={isCollapsed} onClose={() => setSidebarOpen(false)} />
      <main className="main-content">
        <header className="top-header">
          <div className="header-left">
            <button 
              className="menu-btn mobile-only" 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
              aria-expanded={isSidebarOpen}
            >
              <motion.div
                initial={false}
                animate={{ rotate: isSidebarOpen ? 180 : 0 }}
                transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
              >
                {isSidebarOpen ? <FaTimes /> : <FaBars />}
              </motion.div>
            </button>
            <div className="search-bar" onClick={() => setShowPalette(true)} style={{ cursor: 'pointer', marginLeft: isCollapsed ? '72px' : '0', transition: 'margin-left var(--sidebar-transition-duration) var(--sidebar-transition-ease)' }}>
                <FaSearch className="search-icon" />
                <div className="search-trigger">Search or jump to... (Ctrl+K)</div>
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
            <div className="notification-wrapper" style={{ position: 'relative' }} ref={notificationRef}>
              <button 
                className="icon-btn header-bell" 
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <FaBell />
                {unreadNotifications.length > 0 && <span className="bell-dot"></span>}
              </button>
              
              {showNotifications && (
                <div className="notification-dropdown">
                  <div className="notif-header">
                    <h4>Notifications</h4>
                    {unreadNotifications.length > 0 && (
                      <button className="clear-btn" onClick={handleClearAll}>Clear All</button>
                    )}
                  </div>
                  <div className="notif-body">
                    {unreadNotifications.length > 0 ? (
                      unreadNotifications.map(n => (
                        <div key={n.id} className={`notif-item unread`} onClick={() => handleNotificationClick(n)} style={{ cursor: 'pointer' }}>
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
      <CommandPalette isOpen={showPalette} onClose={() => setShowPalette(false)} />
    </div>
  );
};
