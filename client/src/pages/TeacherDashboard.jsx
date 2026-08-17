import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import './AdminDashboard.css'; // Reusing dashboard styles

const TeacherDashboard = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/teacher/dashboard/stats');
                setStats(res.data.data);
            } catch (error) {
                console.error("Error fetching teacher dashboard stats", error);
            }
        };
        fetchStats();
    }, []);

    if (!stats) return <Layout><div className="dashboard-container">Loading...</div></Layout>;

    return (
        <Layout>
            <div className="dashboard-container">
                <header className="dashboard-header">
                    <h1>Teacher Dashboard</h1>
                    <p>Welcome back! Here's what's happening with your students today.</p>
                </header>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon" style={{background: 'linear-gradient(135deg, #10B981, #059669)'}}>👨‍🎓</div>
                        <div className="stat-info">
                            <h3>Total Students</h3>
                            <p>{stats.totalStudents}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{background: 'linear-gradient(135deg, #F59E0B, #D97706)'}}>📝</div>
                        <div className="stat-info">
                            <h3>Active Exams</h3>
                            <p>{stats.upcomingExams}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{background: 'linear-gradient(135deg, #EC4899, #BE185D)'}}>💬</div>
                        <div className="stat-info">
                            <h3>Unread Remarks</h3>
                            <p>{stats.unreadRemarks}</p>
                        </div>
                    </div>
                </div>

                <div className="dashboard-content" style={{marginTop: '2rem'}}>
                    <div className="recent-remarks">
                        <h2>Recently Graded</h2>
                        {stats.recentMarks && stats.recentMarks.length > 0 ? (
                            <ul className="remark-list">
                                {stats.recentMarks.map((mark, idx) => (
                                    <li key={idx} className="remark-item">
                                        <div className="remark-header">
                                            <strong>{mark.first_name} {mark.last_name}</strong>
                                            <span className="remark-date">Subject: {mark.subject_name}</span>
                                        </div>
                                        <p className="remark-body">
                                            Score: {mark.marks_obtained}/{mark.max_marks} (Grade: {mark.grade})
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="empty-state">No recent grades available.</p>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default TeacherDashboard;
