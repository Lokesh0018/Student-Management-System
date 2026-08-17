import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/admin/dashboard/stats');
                setStats(response.data.data);
            } catch (err) {
                setError('Failed to load dashboard statistics.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <Layout><div className="loading-state">Loading dashboard...</div></Layout>;
    if (error) return <Layout><div className="error-state">{error}</div></Layout>;

    return (
        <Layout>
            <div className="dashboard-container">
                {/* Stats Grid */}
                <div className="stats-grid">
                    <div className="stat-card primary-gradient">
                        <div className="stat-icon">👨‍🎓</div>
                        <div className="stat-info">
                            <h3>Total Students</h3>
                            <p className="stat-value">{stats?.totalStudents || 0}</p>
                        </div>
                    </div>
                    <div className="stat-card success-gradient">
                        <div className="stat-icon">👨‍🏫</div>
                        <div className="stat-info">
                            <h3>Total Teachers</h3>
                            <p className="stat-value">{stats?.totalTeachers || 0}</p>
                        </div>
                    </div>
                    <div className="stat-card warning-gradient">
                        <div className="stat-icon">👨‍👩‍👧</div>
                        <div className="stat-info">
                            <h3>Total Parents</h3>
                            <p className="stat-value">{stats?.totalParents || 0}</p>
                        </div>
                    </div>
                    <div className="stat-card info-gradient">
                        <div className="stat-icon">🏫</div>
                        <div className="stat-info">
                            <h3>Total Classes</h3>
                            <p className="stat-value">{stats?.totalClasses || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="dashboard-row">
                    {/* Performance Overview */}
                    <div className="dashboard-panel chart-panel">
                        <h3 className="panel-title">School Performance</h3>
                        <div className="performance-stats">
                            <div className="perf-item">
                                <span className="perf-label">Average Score</span>
                                <span className="perf-val">{stats?.averagePerformance}%</span>
                            </div>
                            <div className="perf-item">
                                <span className="perf-label">Attendance Rate</span>
                                <span className="perf-val">{stats?.attendanceRate}%</span>
                            </div>
                        </div>
                        {/* Placeholder for chart */}
                        <div className="chart-placeholder">
                            <div className="bar" style={{height: '60%'}}></div>
                            <div className="bar" style={{height: '80%'}}></div>
                            <div className="bar" style={{height: '75%'}}></div>
                            <div className="bar" style={{height: '90%'}}></div>
                            <div className="bar" style={{height: '85%'}}></div>
                        </div>
                    </div>

                    {/* Recent Remarks */}
                    <div className="dashboard-panel">
                        <h3 className="panel-title">Recent Remarks</h3>
                        <div className="remarks-list">
                            {stats?.recentRemarks?.map(remark => (
                                <div key={remark.id} className="remark-item">
                                    <div className="remark-header">
                                        <h4>{remark.title}</h4>
                                        <span className="remark-date">{remark.date}</span>
                                    </div>
                                    <p>{remark.message}</p>
                                </div>
                            ))}
                            {(!stats?.recentRemarks || stats.recentRemarks.length === 0) && (
                                <p className="empty-state">No recent remarks.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AdminDashboard;
