import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { FaUserCircle, FaExclamationCircle, FaCheckCircle, FaCalendarCheck, FaCommentDots } from 'react-icons/fa';
import api from '../utils/api';
import StudentImage from '../components/StudentImage';
import './css/AdminDashboard.css';

const ParentDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/parent/dashboard/stats');
                setStats(res.data.data);
            } catch (error) {
                console.error("Error fetching parent dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <div className="spinner">Loading Dashboard...</div>
            </div>
        );
    }

    if (!stats || !stats.children || stats.children.length === 0) {
        return (
            <div className="page-container">
                <div className="dashboard-container" style={{ gap: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <header className="dashboard-header" style={{ marginBottom: '0.5rem', borderBottom: 'none', paddingBottom: 0 }}>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            Welcome, {user?.name || 'Parent'}! 👋
                        </h1>
                    </header>
                    <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <h2>No Children Found</h2>
                        <p>You currently do not have any children linked to your profile.</p>
                    </div>
                </div>
            </div>
        );
    }

    // Calculations for dynamic data
    let totalPresent = 0;
    let totalDays = 0;
    let totalMarksObtained = 0;
    let totalMaxMarks = 0;

    const childrenData = stats.children.map((child, index) => {
        // Attendance
        const att = stats.attendance.find(a => a.student_id === child.id);
        const present = att ? Number(att.present_days) : 0;
        const absent = att ? Number(att.absent_days) : 0;
        const cTotalDays = present + absent;
        const attPercent = cTotalDays > 0 ? Math.round((present / cTotalDays) * 100) : 0;
        
        totalPresent += present;
        totalDays += cTotalDays;

        // Marks
        const cMarks = stats.marks.filter(m => m.student_id === child.id);
        const cObtained = cMarks.reduce((sum, m) => sum + Number(m.marks_obtained), 0);
        const cMax = cMarks.reduce((sum, m) => sum + Number(m.max_marks), 0);
        const scorePercent = cMax > 0 ? Math.round((cObtained / cMax) * 100) : 0;

        totalMarksObtained += cObtained;
        totalMaxMarks += cMax;

        return {
            ...child,
            attPercent,
            scorePercent
        };
    });

    const overallAttendance = totalDays > 0 ? Math.round((totalPresent / totalDays) * 100) : 0;
    const overallScore = totalMaxMarks > 0 ? Math.round((totalMarksObtained / totalMaxMarks) * 100) : 0;

    // Derive recent updates from marks
    const recentUpdates = stats.marks.slice(0, 3).map((m, idx) => ({
        id: idx,
        title: `New mark added for ${m.subject_name}`,
        time: 'Recently',
        icon: <FaCheckCircle style={{ color: '#3B82F6' }} />
    }));

    const recentRemarks = stats.marks.filter(m => m.remarks).slice(0, 3).map((m, idx) => ({
        id: idx,
        text: m.remarks,
        sender: `${m.subject_name} Teacher`,
        time: 'Recently',
        img: `https://i.pravatar.cc/150?img=${(idx * 5) + 32}`
    }));

    // Mock mini chart data to make it look active (since we don't have historical trend data yet)
    const miniChartData = [{ val: Math.max(0, overallAttendance - 10) }, { val: Math.max(0, overallAttendance - 5) }, { val: overallAttendance }];
    const miniChartData2 = [{ val: Math.max(0, overallScore - 10) }, { val: Math.max(0, overallScore - 5) }, { val: overallScore }];

    return (
        <div className="page-container">
            <div className="dashboard-container" style={{ gap: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                <header className="dashboard-header" style={{ marginBottom: '0.5rem', borderBottom: 'none', paddingBottom: 0 }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Welcome, {user?.name || 'Parent'}! <span style={{ fontSize: '1.5rem' }}>👋</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        Here's an overview of your children and their progress.
                    </p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1.5rem', alignItems: 'stretch' }}>
                    {/* Left Column: My Children */}
                    <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', background: 'linear-gradient(to bottom right, #ffffff, #f8fafc)' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontWeight: 600 }}>My Children</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            {childrenData.map(child => (
                                <div key={child.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.25rem', display: 'flex', flexDirection: 'column', background: 'var(--surface)', boxShadow: 'var(--shadow-1)' }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <StudentImage studentId={child.id} studentName={`${child.first_name} ${child.last_name}`} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
                                        <div>
                                            <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>{child.first_name} {child.last_name}</h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Class {child.class_name}-{child.section}</span>
                                                <span style={{ fontSize: '0.7rem', background: '#DCFCE7', color: '#166534', padding: '2px 6px', borderRadius: '10px', fontWeight: 500 }}>Active</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                        <div>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Attendance</p>
                                            <p style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: child.attPercent >= 75 ? 'inherit' : '#EF4444' }}>{child.attPercent}%</p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Average Score</p>
                                            <p style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{child.scorePercent}%</p>
                                        </div>
                                    </div>

                                    <button 
                                        className="btn-outline" 
                                        style={{ width: '100%', marginTop: 'auto', padding: '0.5rem', borderRadius: '6px', fontSize: '0.9rem', color: 'var(--primary)', borderColor: 'var(--primary)', background: 'transparent', cursor: 'pointer', transition: 'all 0.2s' }}
                                        onClick={() => navigate('/parent/children')}
                                    >
                                        View Details
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Important Updates */}
                    <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                        <h2 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', fontWeight: 600 }}>Important Updates</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                            {recentUpdates.length > 0 ? recentUpdates.map(update => (
                                <div key={update.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                    <div style={{ padding: '0.5rem', background: 'var(--bg)', borderRadius: '8px' }}>
                                        {update.icon}
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.9rem', fontWeight: 500, margin: 0, color: 'var(--text-primary)' }}>{update.title}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>{update.time}</p>
                                    </div>
                                </div>
                            )) : (
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No recent updates.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Row Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                    
                    <div className="card stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '1.5rem', borderTop: '4px solid #3B82F6' }}>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, fontWeight: 500 }}>Overall Attendance</p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: '0.5rem' }}>
                            <div>
                                <h3 style={{ fontSize: '2rem', margin: 0, fontWeight: 700 }}>{overallAttendance}%</h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>This Month</p>
                            </div>
                            <div style={{ width: '80px', height: '40px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={miniChartData}>
                                        <Line type="monotone" dataKey="val" stroke="#3B82F6" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="card stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '1.5rem', borderTop: '4px solid #10B981' }}>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, fontWeight: 500 }}>Average Score</p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: '0.5rem' }}>
                            <div>
                                <h3 style={{ fontSize: '2rem', margin: 0, fontWeight: 700 }}>{overallScore}%</h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Overall</p>
                            </div>
                            <div style={{ width: '80px', height: '40px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={miniChartData2}>
                                        <Line type="monotone" dataKey="val" stroke="#10B981" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="card stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '1.5rem', borderTop: '4px solid #F59E0B' }}>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, fontWeight: 500 }}>Unread Remarks</p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: '0.5rem' }}>
                            <div>
                                <h3 style={{ fontSize: '2rem', margin: 0, fontWeight: 700 }}>{recentRemarks.length}</h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Messages</p>
                            </div>
                            <div style={{ background: '#FEF3C7', padding: '0.75rem', borderRadius: '12px' }}>
                                <FaCommentDots style={{ color: '#D97706', fontSize: '1.5rem' }} />
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, fontWeight: 500 }}>Recent Remarks</p>
                            <span style={{ fontSize: '0.8rem', color: 'var(--primary)', cursor: 'pointer', fontWeight: 500 }} onClick={() => navigate('/parent/remarks')}>View All</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {recentRemarks.length > 0 ? recentRemarks.map(remark => (
                                <div key={remark.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <img src={remark.img} alt="teacher" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                        <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{remark.text}</p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{remark.sender}</span>
                                            <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{remark.time}</span>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No recent remarks.</p>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ParentDashboard;
