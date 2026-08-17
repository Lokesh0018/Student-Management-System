import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Card } from '../components/ui/Card';
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

    if (!stats) return <div className="loading-state body-main">Loading...</div>;

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1 className="page-title">Teacher Dashboard</h1>
                <p className="body-secondary">Welcome back! Here's what's happening with your students today.</p>
            </header>

            <div className="stats-grid">
                <Card className="stat-card">
                    <div className="stat-icon-wrapper text-success">👨‍🎓</div>
                    <div className="stat-info">
                        <h3 className="caption">Total Students</h3>
                        <p className="stat-value">{stats.totalStudents}</p>
                    </div>
                </Card>
                <Card className="stat-card">
                    <div className="stat-icon-wrapper text-warning">📝</div>
                    <div className="stat-info">
                        <h3 className="caption">Active Exams</h3>
                        <p className="stat-value">{stats.upcomingExams}</p>
                    </div>
                </Card>
                <Card className="stat-card">
                    <div className="stat-icon-wrapper text-danger">💬</div>
                    <div className="stat-info">
                        <h3 className="caption">Unread Remarks</h3>
                        <p className="stat-value">{stats.unreadRemarks}</p>
                    </div>
                </Card>
            </div>

            <div style={{marginTop: '32px'}}>
                <h2 className="section-title" style={{marginBottom: '16px'}}>Recently Graded</h2>
                {stats.recentMarks && stats.recentMarks.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {stats.recentMarks.map((mark, idx) => (
                            <Card key={idx} condensed>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <strong className="body-main">{mark.first_name} {mark.last_name}</strong>
                                    <span className="caption" style={{ padding: '4px 12px', backgroundColor: 'var(--bg)', borderRadius: '999px' }}>Subject: {mark.subject_name}</span>
                                </div>
                                <p className="body-secondary">
                                    Score: {mark.marks_obtained}/{mark.max_marks} (Grade: {mark.grade})
                                </p>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">No recent grades available.</div>
                )}
            </div>
        </div>
    );
};

export default TeacherDashboard;
