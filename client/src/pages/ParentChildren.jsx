import React, { useState, useEffect } from 'react';
import { FaDownload, FaArrowUp, FaArrowDown, FaUserGraduate } from 'react-icons/fa';
import api from '../utils/api';
import StudentImage from '../components/StudentImage';
import './css/AdminDashboard.css';

const ParentChildren = () => {
    const [activeTab, setActiveTab] = useState('Overview');
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [printingChildId, setPrintingChildId] = useState(null);

    const handlePrint = (childId) => {
        setPrintingChildId(childId);
        setTimeout(() => {
            window.print();
        }, 500); // Give React time to render all hidden tabs
    };

    useEffect(() => {
        const handleAfterPrint = () => setPrintingChildId(null);
        window.addEventListener('afterprint', handleAfterPrint);
        return () => window.removeEventListener('afterprint', handleAfterPrint);
    }, []);
    const [scorecardModal, setScorecardModal] = useState(null);

    const tabs = ['Overview', 'Scorecard', 'Attendance', 'Performance', 'Remarks'];

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/parent/dashboard/stats');
                setStats(res.data.data);
            } catch (error) {
                console.error("Error fetching children stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ width: '50px', height: '50px', border: '4px solid var(--border, #e2e8f0)', borderTopColor: 'var(--primary, #3b82f6)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <p style={{ color: 'var(--text-secondary, #64748b)', fontWeight: 500 }}>Loading Children Data...</p>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!stats || !stats.children || stats.children.length === 0) {
        return (
            <div className="page-container">
                <div className="dashboard-container" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <h2>No Children Found</h2>
                    <p>You currently do not have any children linked to your profile.</p>
                </div>
            </div>
        );
    }

    const calculateAge = (dobString) => {
        if (!dobString) return 'N/A';
        const dob = new Date(dobString);
        if (isNaN(dob)) return 'N/A';
        const diff_ms = Date.now() - dob.getTime();
        const age_dt = new Date(diff_ms);
        return Math.abs(age_dt.getUTCFullYear() - 1970) + ' Years';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        if (isNaN(date)) return 'N/A';
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <div className="page-container">
            <div className="dashboard-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Header */}
                <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>My Children</h1>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                            View details, performance and attendance of all your children.
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="no-print" style={{ borderBottom: '1px solid var(--border)', display: 'flex', gap: '2rem' }}>
                    {tabs.map(tab => (
                        <div 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{ 
                                padding: '0.75rem 0', 
                                cursor: 'pointer', 
                                fontWeight: activeTab === tab ? 600 : 500,
                                color: activeTab === tab ? 'var(--primary)' : 'var(--text-secondary)',
                                borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab}
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                    {stats.children.map((child, index) => {
                        const isPrinting = printingChildId === child.id;
                        if (printingChildId && !isPrinting) return null; // Hide others when printing

                        // Compute metrics for this child
                        const att = stats.attendance.find(a => a.student_id === child.id);
                        const present = att ? Number(att.present_days) : 0;
                        const absent = att ? Number(att.absent_days) : 0;
                        const cTotalDays = present + absent;
                        const attendancePercent = cTotalDays > 0 ? Math.round((present / cTotalDays) * 100) : 0;

                        const childMarks = stats.marks.filter(m => m.student_id === child.id);
                        const cObtained = childMarks.reduce((sum, m) => sum + Number(m.marks_obtained), 0);
                        const cMax = childMarks.reduce((sum, m) => sum + Number(m.max_marks), 0);
                        const averageScore = cMax > 0 ? Math.round((cObtained / cMax) * 100) : 0;

                        const uniqueSubjects = new Set(childMarks.map(m => m.subject_id)).size;

                        // Group marks by subject for overview table
                        const subjectMap = {};
                        childMarks.forEach(m => {
                            if (!subjectMap[m.subject_name]) {
                                subjectMap[m.subject_name] = { name: m.subject_name, obtained: 0, max: 0, count: 0 };
                            }
                            subjectMap[m.subject_name].obtained += Number(m.marks_obtained);
                            subjectMap[m.subject_name].max += Number(m.max_marks);
                            subjectMap[m.subject_name].count += 1;
                        });

                        const subjectsOverview = Object.values(subjectMap).map(sub => {
                            const score = sub.max > 0 ? Math.round((sub.obtained / sub.max) * 100) : 0;
                            let grade = 'F';
                            if (score >= 90) grade = 'A+';
                            else if (score >= 80) grade = 'A';
                            else if (score >= 70) grade = 'B+';
                            else if (score >= 60) grade = 'B';
                            else if (score >= 50) grade = 'C';
                            else if (score >= 40) grade = 'D';

                            return {
                                name: sub.name,
                                score: `${score}%`,
                                grade: grade,
                                trend: score >= 60 ? 'up' : 'down',
                                trend_val: ''
                            };
                        });

                        const showOverview = isPrinting || activeTab === 'Overview';
                        const showScorecard = isPrinting || activeTab === 'Scorecard';
                        const showAttendance = isPrinting || activeTab === 'Attendance';
                        const showPerformance = isPrinting || activeTab === 'Performance';
                        const showRemarks = isPrinting || activeTab === 'Remarks';

                        return (
                            <div key={child.id} className={isPrinting ? 'print-only-child' : ''} style={{ display: isPrinting ? 'block' : 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '1.5rem', alignItems: 'start', paddingBottom: index < stats.children.length - 1 ? '3rem' : '0', borderBottom: index < stats.children.length - 1 ? '1px dashed var(--border)' : 'none' }}>
                                {/* Profile Card */}
                                <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: isPrinting ? '2rem' : '0' }}>
                                    <StudentImage studentId={child.id} studentName={`${child.first_name} ${child.last_name}`} style={{ width: '120px', height: '120px', borderRadius: '12px', objectFit: 'cover', marginBottom: '1.5rem' }} />
                                    
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem 0', textAlign: 'center' }}>{child.first_name} {child.last_name}</h2>
                                    <span style={{ fontSize: '0.7rem', background: '#DCFCE7', color: '#166534', padding: '4px 8px', borderRadius: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '1rem' }}>{child.status || 'ACTIVE'}</span>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 1.5rem 0', textAlign: 'center' }}>
                                        Class {child.class_name}-{child.section} <br/>
                                        Roll No: {child.roll_number || 'N/A'}
                                    </p>

                                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Date of Birth</span><span style={{ fontWeight: 500 }}>{formatDate(child.dob)}</span></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Age</span><span style={{ fontWeight: 500 }}>{calculateAge(child.dob)}</span></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Blood Group</span><span style={{ fontWeight: 500 }}>{child.blood_group || 'N/A'}</span></div>
                                    </div>
                                    <button 
                                        className="btn-primary no-print" 
                                        style={{ width: '100%', marginTop: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '6px' }}
                                        onClick={() => handlePrint(child.id)}
                                    >
                                        <FaDownload /> Profile
                                    </button>
                                </div>

                                {/* Right Content */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {showOverview && (
                                        <>
                                            {/* Metrics Grid */}
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                                                <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
                                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>Attendance</p>
                                                    <h3 style={{ fontSize: '1.75rem', margin: '0 0 0.25rem 0' }}>{attendancePercent}%</h3>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Overall</p>
                                                </div>
                                                <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
                                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>Average Score</p>
                                                    <h3 style={{ fontSize: '1.75rem', margin: '0 0 0.25rem 0' }}>{averageScore}%</h3>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Overall</p>
                                                </div>
                                                <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
                                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>Rank</p>
                                                    <h3 style={{ fontSize: '1.75rem', margin: '0 0 0.25rem 0' }}>{child.rank !== 'N/A' ? `${child.rank} / ${child.class_size}` : 'N/A'}</h3>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>In Class</p>
                                                </div>
                                                <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
                                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>Total Subjects</p>
                                                    <h3 style={{ fontSize: '1.75rem', margin: '0 0 0.25rem 0' }}>{uniqueSubjects}</h3>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Subjects Evaluated</p>
                                                </div>
                                            </div>

                                            {/* Subject Overview Table */}
                                            <div className="card" style={{ padding: '1.5rem' }}>
                                                <h2 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', fontWeight: 600 }}>Subject Overview</h2>
                                                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                    <thead>
                                                        <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                                                            <th style={{ padding: '0.75rem 0', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.85rem' }}>Subject</th>
                                                            <th style={{ padding: '0.75rem 0', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.85rem' }}>Average Score</th>
                                                            <th style={{ padding: '0.75rem 0', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.85rem' }}>Grade</th>
                                                            <th style={{ padding: '0.75rem 0', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.85rem' }}>Trend</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {subjectsOverview.length > 0 ? subjectsOverview.map((sub, idx) => (
                                                            <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                                                                <td style={{ padding: '1rem 0', fontSize: '0.9rem', fontWeight: 500 }}>{sub.name}</td>
                                                                <td style={{ padding: '1rem 0', fontSize: '0.9rem', fontWeight: 600 }}>{sub.score}</td>
                                                                <td style={{ padding: '1rem 0', fontSize: '0.9rem', fontWeight: 500 }}>{sub.grade}</td>
                                                                <td style={{ padding: '1rem 0', fontSize: '0.9rem' }}>
                                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: sub.trend === 'up' ? '#10B981' : '#EF4444' }}>
                                                                        {sub.trend === 'up' ? <FaArrowUp size={10} /> : <FaArrowDown size={10} />}
                                                                        {sub.trend_val}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        )) : (
                                                            <tr>
                                                                <td colSpan="4" style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-secondary)' }}>
                                                                    No subject data available.
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                                {subjectsOverview.length > 0 && !isPrinting && (
                                                    <div className="no-print" style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                                                        <span 
                                                            style={{ color: 'var(--primary)', fontWeight: 500, cursor: 'pointer', fontSize: '0.9rem' }}
                                                            onClick={() => setActiveTab('Scorecard')}
                                                        >
                                                            View Full Scorecard →
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}

                                    {showScorecard && (
                                        <div className="card" style={{ padding: '1.5rem' }}>
                                            <h2 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', fontWeight: 600 }}>Detailed Scorecard</h2>
                                            {childMarks.length > 0 ? (
                                                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                    <thead>
                                                        <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                                                            <th style={{ padding: '0.75rem 0', color: 'var(--text-secondary)' }}>Exam</th>
                                                            <th style={{ padding: '0.75rem 0', color: 'var(--text-secondary)' }}>Subject</th>
                                                            <th style={{ padding: '0.75rem 0', color: 'var(--text-secondary)' }}>Score</th>
                                                            <th style={{ padding: '0.75rem 0', color: 'var(--text-secondary)' }}>Grade</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {childMarks.map((m, idx) => (
                                                            <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                                                                <td style={{ padding: '1rem 0', fontSize: '0.9rem' }}>{m.exam_name}</td>
                                                                <td style={{ padding: '1rem 0', fontSize: '0.9rem' }}>{m.subject_name}</td>
                                                                <td style={{ padding: '1rem 0', fontSize: '0.9rem', fontWeight: 500 }}>{m.marks_obtained} / {m.max_marks}</td>
                                                                <td style={{ padding: '1rem 0', fontSize: '0.9rem' }}>{m.grade}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            ) : <p style={{ color: 'var(--text-secondary)' }}>No scores available.</p>}
                                        </div>
                                    )}

                                    {showAttendance && (
                                        <div className="card" style={{ padding: '1.5rem' }}>
                                            <h2 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', fontWeight: 600 }}>Attendance Summary</h2>
                                            <div style={{ display: 'flex', gap: '2rem' }}>
                                                <div style={{ flex: 1, padding: '1rem', background: '#F1F5F9', borderRadius: '8px', textAlign: 'center' }}>
                                                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Total Present Days</p>
                                                    <h3 style={{ margin: '0.5rem 0 0 0', color: '#10B981', fontSize: '1.5rem' }}>{present}</h3>
                                                </div>
                                                <div style={{ flex: 1, padding: '1rem', background: '#F1F5F9', borderRadius: '8px', textAlign: 'center' }}>
                                                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Total Absent Days</p>
                                                    <h3 style={{ margin: '0.5rem 0 0 0', color: '#EF4444', fontSize: '1.5rem' }}>{absent}</h3>
                                                </div>
                                                <div style={{ flex: 1, padding: '1rem', background: '#F1F5F9', borderRadius: '8px', textAlign: 'center' }}>
                                                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Attendance %</p>
                                                    <h3 style={{ margin: '0.5rem 0 0 0', color: 'var(--primary)', fontSize: '1.5rem' }}>{attendancePercent}%</h3>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {showPerformance && (
                                        <div className="card" style={{ padding: '1.5rem' }}>
                                            <h2 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', fontWeight: 600 }}>Performance Analysis</h2>
                                            <p style={{ color: 'var(--text-secondary)' }}>
                                                {averageScore >= 80 ? 'Excellent overall performance. Keep it up!' :
                                                 averageScore >= 60 ? 'Good performance. There is room for improvement in specific subjects.' :
                                                 averageScore > 0 ? 'Needs attention. Please review subject-wise scores and consult teachers.' : 'No data available yet.'}
                                            </p>
                                            <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#F8FAFC', borderRadius: '8px' }}>
                                                <strong>Rank in Class:</strong> {child.rank !== 'N/A' ? `${child.rank} out of ${child.class_size}` : 'N/A'}
                                            </div>
                                        </div>
                                    )}

                                    {showRemarks && (
                                        <div className="card" style={{ padding: '1.5rem' }}>
                                            <h2 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', fontWeight: 600 }}>Teacher Remarks</h2>
                                            {stats.remarks && stats.remarks.filter(r => r.student_id === child.id).length > 0 ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                    {stats.remarks.filter(r => r.student_id === child.id).map((r, idx) => (
                                                        <div key={idx} style={{ padding: '1rem', background: '#F1F5F9', borderRadius: '8px' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.title || 'General Remark'}</span>
                                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(r.created_at).toLocaleDateString()}</span>
                                                            </div>
                                                            <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginBottom: '0.5rem', fontWeight: 500 }}>
                                                                From: {r.sender_name} ({r.sender_role})
                                                            </div>
                                                            <p style={{ margin: 0, fontSize: '0.9rem', fontStyle: 'italic', color: '#475569' }}>"{r.message}"</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : <p style={{ color: 'var(--text-secondary)' }}>No remarks available.</p>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ParentChildren;
