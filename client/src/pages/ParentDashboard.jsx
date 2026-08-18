import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import './css/AdminDashboard.css'; // Reusing dashboard styles

const ParentDashboard = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/parent/dashboard/stats');
                setStats(res.data.data);
            } catch (error) {
                console.error("Error fetching parent dashboard stats", error);
            }
        };
        fetchStats();
    }, []);

    if (!stats) return <Layout><div className="dashboard-container">Loading...</div></Layout>;

    return (
        <Layout>
            <div className="dashboard-container">
                <header className="dashboard-header">
                    <h1>Parent Dashboard</h1>
                    <p>Welcome! Here is the latest academic update for your children.</p>
                </header>

                {stats.children && stats.children.length > 0 ? (
                    <>
                        <div className="stats-grid">
                            {stats.children.map(child => {
                                const att = stats.attendance.find(a => a.student_id === child.id);
                                const present = att ? Number(att.present_days) : 0;
                                const absent = att ? Number(att.absent_days) : 0;
                                const total = present + absent;
                                const percent = total > 0 ? Math.round((present / total) * 100) : 0;
                                
                                return (
                                    <div key={child.id} className="stat-card" style={{flexDirection: 'column', alignItems: 'flex-start'}}>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem'}}>
                                            <div className="stat-icon" style={{background: 'linear-gradient(135deg, #6366F1, #4F46E5)'}}>👦</div>
                                            <div>
                                                <h3 style={{margin: 0, fontSize: '1.25rem'}}>{child.first_name} {child.last_name}</h3>
                                                <p style={{margin: 0, color: '#64748B'}}>Class {child.class_name}-{child.section}</p>
                                            </div>
                                        </div>
                                        <div style={{width: '100%', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '0.75rem'}}>
                                            <span style={{fontSize: '0.875rem', color: '#64748B'}}>Attendance</span>
                                            <strong style={{color: percent >= 75 ? '#10B981' : '#EF4444'}}>{percent}%</strong>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="dashboard-content" style={{marginTop: '2rem'}}>
                            <div className="recent-remarks">
                                <h2>Recent Scorecards</h2>
                                {stats.marks && stats.marks.length > 0 ? (
                                    <ul className="remark-list">
                                        {stats.marks.map((mark, idx) => (
                                            <li key={idx} className="remark-item">
                                                <div className="remark-header">
                                                    <strong>{mark.exam_name} - {mark.subject_name}</strong>
                                                    <span className="remark-date">Student ID: {mark.student_id}</span>
                                                </div>
                                                <p className="remark-body">
                                                    Score: {mark.marks_obtained}/{mark.max_marks} (Grade: {mark.grade}) 
                                                    {mark.remarks && <span style={{display: 'block', marginTop: '0.25rem', color: '#64748B', fontStyle: 'italic'}}>Note: {mark.remarks}</span>}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="empty-state">No recent scores available.</p>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="list-panel" style={{marginTop: '2rem'}}>
                        <p className="empty-state">No children currently linked to your profile. Please contact the administrator.</p>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default ParentDashboard;
