import React, { useState, useEffect } from 'react';
import { FaUserGraduate, FaChalkboardTeacher, FaUsers, FaBook, FaUserPlus, FaCalendarCheck, FaRegClipboard, FaChartPie, FaPlus } from 'react-icons/fa';
import api from '../utils/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch stats, fallback to mock data if it fails
                const response = await api.get('/admin/dashboard/stats');
                setStats(response.data.data);
            } catch (err) {
                console.warn("Using fallback data for dashboard");
                setStats({
                    totalStudents: 1245,
                    totalTeachers: 68,
                    totalParents: 1080,
                    totalClasses: 32
                });
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="loading-state">Loading dashboard...</div>;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header-main">
                <h1 className="dash-title">Good Morning, Admin! 👋</h1>
                <p className="dash-subtitle">Here's what's happening in your school today.</p>
            </div>
            
            {/* Top Stat Cards */}
            <div className="stats-row">
                <div className="stat-card">
                    <div className="stat-icon-wrap" style={{ backgroundColor: '#eef2ff', color: '#4f46e5' }}>
                        <FaUserGraduate />
                    </div>
                    <div className="stat-data">
                        <span className="stat-label">Students</span>
                        <div className="stat-value-row">
                            <span className="stat-num">{stats?.totalStudents?.toLocaleString() || '1,245'}</span>
                            <span className="stat-trend trend-up">+4.2%</span>
                        </div>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon-wrap" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                        <FaChalkboardTeacher />
                    </div>
                    <div className="stat-data">
                        <span className="stat-label">Teachers</span>
                        <div className="stat-value-row">
                            <span className="stat-num">{stats?.totalTeachers?.toLocaleString() || '68'}</span>
                            <span className="stat-trend trend-up">+2</span>
                        </div>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon-wrap" style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>
                        <FaUsers />
                    </div>
                    <div className="stat-data">
                        <span className="stat-label">Parents</span>
                        <div className="stat-value-row">
                            <span className="stat-num">{stats?.totalParents?.toLocaleString() || '1,080'}</span>
                            <span className="stat-trend trend-up">+5.1%</span>
                        </div>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon-wrap" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                        <FaBook />
                    </div>
                    <div className="stat-data">
                        <span className="stat-label">Classes</span>
                        <div className="stat-value-row">
                            <span className="stat-num">{stats?.totalClasses?.toLocaleString() || '32'}</span>
                            <span className="stat-trend trend-up">+1</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Middle Section */}
            <div className="middle-row">
                {/* Left: Line Chart Mock */}
                <div className="dash-panel panel-chart">
                    <div className="panel-header-split">
                        <h3 className="panel-title">Student Performance Overview</h3>
                        <button className="btn-outline">This Month</button>
                    </div>
                    <div className="line-chart-mock">
                        {/* SVG mock for line chart */}
                        <svg viewBox="0 0 400 200" preserveAspectRatio="none" className="chart-svg">
                            {/* Grid lines */}
                            <line x1="0" y1="50" x2="400" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                            <line x1="0" y1="100" x2="400" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                            <line x1="0" y1="150" x2="400" y2="150" stroke="#f1f5f9" strokeWidth="1" />
                            <line x1="0" y1="200" x2="400" y2="200" stroke="#e2e8f0" strokeWidth="1.5" />
                            
                            {/* Dashed line */}
                            <path d="M 0 180 Q 50 140 100 140 T 200 180 T 300 130 T 400 130" fill="none" stroke="#93c5fd" strokeWidth="2" strokeDasharray="5,5" />
                            
                            {/* Solid line */}
                            <path d="M 0 150 C 50 100, 100 50, 200 150 S 300 -20, 400 50" fill="none" stroke="#233b8f" strokeWidth="3" />
                        </svg>
                        <div className="chart-x-axis">
                            <span>1 May</span><span>8 May</span><span>15 May</span><span>22 May</span><span>29 May</span>
                        </div>
                    </div>
                </div>

                {/* Center: Donut Chart Mock */}
                <div className="dash-panel panel-donut">
                    <h3 className="panel-title">Attendance Overview</h3>
                    <div className="donut-chart-wrap">
                        <div className="donut-chart">
                            <span className="donut-value">94%</span>
                        </div>
                    </div>
                    <div className="donut-legend">
                        <div className="legend-item">
                            <span className="legend-dot" style={{ backgroundColor: '#2f3b89'}}></span>
                            <span className="legend-label">Present</span>
                            <span className="legend-val">94%</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-dot" style={{ backgroundColor: '#dc2626'}}></span>
                            <span className="legend-label">Absent</span>
                            <span className="legend-val">4%</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-dot" style={{ backgroundColor: '#cbd5e1'}}></span>
                            <span className="legend-label">Leave</span>
                            <span className="legend-val">2%</span>
                        </div>
                    </div>
                </div>

                {/* Right: Stacked Cards */}
                <div className="stacked-panels">
                    <div className="dash-panel panel-remarks">
                        <div className="panel-header-split">
                            <h3 className="panel-title">Recent Remarks</h3>
                            <a href="#" className="link-view-all">View All</a>
                        </div>
                        <div className="remark-list">
                            <div className="remark-item">
                                <div className="remark-avatar">
                                    <img src="https://ui-avatars.com/api/?name=Rahul+Kumar&background=e0e7ff&color=4f46e5" alt="Rahul" />
                                </div>
                                <div className="remark-content">
                                    <h4>Rahul Kumar</h4>
                                    <p>Excellent improvement in Mathematics</p>
                                    <span className="remark-meta">By: Class Teacher • 2 hours ago</span>
                                </div>
                            </div>
                            <div className="remark-item">
                                <div className="remark-avatar">
                                    <img src="https://ui-avatars.com/api/?name=Priya+Sharma&background=f3f4f6&color=6b7280" alt="Priya" />
                                </div>
                                <div className="remark-content">
                                    <h4>Priya Sharma</h4>
                                    <p>Good performance in Science</p>
                                    <span className="remark-meta">By: Class Teacher • 5 hours ago</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="dash-panel panel-events">
                        <h3 className="panel-title">Upcoming Events</h3>
                        <div className="event-list">
                            <div className="event-card">
                                <div className="event-icon" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                                    <FaCalendarCheck />
                                </div>
                                <div className="event-info">
                                    <h4>PTM Meeting</h4>
                                    <span>24 May 2024</span>
                                </div>
                            </div>
                            <div className="event-card">
                                <div className="event-icon" style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}>
                                    <FaRegClipboard />
                                </div>
                                <div className="event-info">
                                    <h4>Monthly Examination</h4>
                                    <span>1 Jun 2024</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Quick Actions */}
            <div className="dash-panel panel-actions">
                <h3 className="panel-title">Quick Actions</h3>
                <div className="action-grid">
                    <button className="action-btn">
                        <div className="action-icon" style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}><FaUserGraduate /></div>
                        <span>Add<br/>Student</span>
                    </button>
                    <button className="action-btn">
                        <div className="action-icon" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}><FaChalkboardTeacher /></div>
                        <span>Add<br/>Teacher</span>
                    </button>
                    <button className="action-btn">
                        <div className="action-icon" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}><FaChartPie /></div>
                        <span>Send<br/>Remark</span>
                    </button>
                    <button className="action-btn">
                        <div className="action-icon" style={{ backgroundColor: '#ffedd5', color: '#ea580c' }}><FaBook /></div>
                        <span>Add<br/>Class</span>
                    </button>
                    <button className="action-btn">
                        <div className="action-icon" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}><FaRegClipboard /></div>
                        <span>Generate<br/>Report</span>
                    </button>
                </div>
            </div>

        </div>
    );
};

export default AdminDashboard;
