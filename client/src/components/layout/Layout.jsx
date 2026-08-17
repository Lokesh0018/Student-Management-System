import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { FaSearch, FaBell } from 'react-icons/fa';
import './Layout.css';

export const Layout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

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
            <button className="icon-btn header-bell">
              <FaBell />
              <span className="bell-dot"></span>
            </button>
            <div className="user-profile">
              <div className="avatar">
                <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Admin" />
              </div>
              <div className="user-info">
                  <span className="user-name">Admin</span>
                  <span className="user-role">Super Admin</span>
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
