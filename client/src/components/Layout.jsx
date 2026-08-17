import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import './Layout.css';

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getNavItems = () => {
        if (!user) return [];
        if (user.role === 'ADMIN') {
            return [
                { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
                { path: '/admin/students', label: 'Students', icon: '👨‍🎓' },
                { path: '/admin/teachers', label: 'Teachers', icon: '👨‍🏫' },
                { path: '/admin/parents', label: 'Parents', icon: '👨‍👩‍👧' },
                { path: '/admin/classes', label: 'Classes', icon: '🏫' },
                { path: '/admin/subjects', label: 'Subjects', icon: '📚' },
                { path: '/admin/exams', label: 'Examinations', icon: '📝' },
                { path: '/admin/marks', label: 'Marks', icon: '💯' },
                { path: '/admin/performance', label: 'Performance', icon: '📈' },
                { path: '/admin/remarks', label: 'Remarks', icon: '💬' },
                { path: '/admin/academic-years', label: 'Academic Years', icon: '📅' },
                { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
            ];
        }
        if (user.role === 'CLASS_TEACHER') {
            return [
                { path: '/teacher/dashboard', label: 'Dashboard', icon: '📊' },
                { path: '/teacher/students', label: 'My Class', icon: '👨‍🎓' },
                { path: '/teacher/marks', label: 'Marks', icon: '💯' },
                { path: '/teacher/remarks', label: 'Remarks', icon: '💬' },
            ];
        }
        if (user.role === 'PARENT') {
            return [
                { path: '/parent/dashboard', label: 'Dashboard', icon: '📊' },
                { path: '/parent/children', label: 'My Children', icon: '👨‍👧' },
                { path: '/parent/scorecards', label: 'Scorecards', icon: '💯' },
                { path: '/parent/remarks', label: 'Remarks', icon: '💬' },
            ];
        }
        return [];
    };

    const navItems = getNavItems();

    return (
        <div className="layout-container">
            {/* Mobile overlay */}
            {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}
            
            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h2>EduCore</h2>
                    <button className="close-sidebar" onClick={() => setSidebarOpen(false)}>✕</button>
                </div>
                
                <nav className="sidebar-nav">
                    <ul>
                        {navItems.map((item) => (
                            <li key={item.path}>
                                <Link 
                                    to={item.path} 
                                    className={location.pathname === item.path ? 'active' : ''}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <span className="nav-icon">{item.icon}</span>
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                {/* Navbar */}
                <header className="top-navbar">
                    <div className="navbar-left">
                        <button className="menu-toggle" onClick={() => setSidebarOpen(true)}>
                            ☰
                        </button>
                        <h2 className="page-title">
                            {navItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
                        </h2>
                    </div>
                    
                    <div className="navbar-right">
                        <div className="user-profile">
                            <div className="avatar">{user?.name?.charAt(0)}</div>
                            <div className="user-info">
                                <span className="user-name">{user?.name}</span>
                                <span className="user-role">{user?.role}</span>
                            </div>
                        </div>
                        <button className="logout-button" onClick={handleLogout}>Logout</button>
                    </div>
                </header>

                {/* Page Content */}
                <div className="page-content">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
