import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './css/AdminDashboard.css';

const ParentScorecards = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [selectedChild, setSelectedChild] = useState('');
    const [selectedExam, setSelectedExam] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/parent/dashboard/stats');
                const data = res.data.data;
                setStats(data);
                if (data.children && data.children.length > 0) {
                    setSelectedChild(data.children[0].id);
                }
            } catch (error) {
                console.error("Error fetching data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    useEffect(() => {
        if (!stats || !selectedChild) return;
        
        const marksForChild = stats.marks.filter(m => m.student_id == selectedChild);
        const examMap = new Map();
        marksForChild.forEach(m => {
            if (!examMap.has(m.exam_id)) {
                examMap.set(m.exam_id, { id: m.exam_id, name: m.exam_name });
            }
        });
        const exams = Array.from(examMap.values());
        
        if (exams.length > 0) {
            if (!exams.find(e => e.id == selectedExam)) {
                setSelectedExam(exams[0].id);
            }
        } else {
            setSelectedExam('');
        }
    }, [selectedChild, stats]);

    let childExams = [];
    if (stats && selectedChild) {
        const marksForChild = stats.marks.filter(m => m.student_id == selectedChild);
        const examMap = new Map();
        marksForChild.forEach(m => {
            if (!examMap.has(m.exam_id)) {
                examMap.set(m.exam_id, { id: m.exam_id, name: m.exam_name });
            }
        });
        childExams = Array.from(examMap.values());
    }

    let scorecardData = [];
    let totalObtained = 0;
    let totalMax = 0;
    let rank = 'N/A';

    if (stats && selectedChild && selectedExam) {
        scorecardData = stats.marks.filter(m => m.student_id == selectedChild && m.exam_id == selectedExam);
        scorecardData.forEach(m => {
            totalObtained += Number(m.marks_obtained);
            totalMax += Number(m.max_marks);
        });
        
        const childInfo = stats.children.find(c => c.id == selectedChild);
        if (childInfo) {
            rank = childInfo.rank !== 'N/A' ? `${childInfo.rank} / ${childInfo.class_size}` : 'N/A';
        }
    }

    const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(2) : 0;
    
    let overallGrade = 'F';
    if (percentage >= 90) overallGrade = 'A+';
    else if (percentage >= 80) overallGrade = 'A';
    else if (percentage >= 70) overallGrade = 'B+';
    else if (percentage >= 60) overallGrade = 'B';
    else if (percentage >= 50) overallGrade = 'C';
    else if (percentage >= 40) overallGrade = 'D';

    if (loading) {
        return (
            <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ width: '50px', height: '50px', border: '4px solid var(--border, #e2e8f0)', borderTopColor: 'var(--primary, #3b82f6)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <p style={{ color: 'var(--text-secondary, #64748b)', fontWeight: 500 }}>Loading Scorecards...</p>
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

    return (
        <div className="page-container">
            <div className="dashboard-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h1 className="no-print" style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Scorecard</h1>

                <div className="no-print" style={{ display: 'flex', gap: '2rem', marginBottom: '0.5rem' }}>
                    <div style={{ flex: 1, maxWidth: '300px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Select Child</label>
                        <select 
                            className="form-input" 
                            value={selectedChild} 
                            onChange={(e) => setSelectedChild(e.target.value)}
                            style={{ padding: '0.5rem', width: '100%', borderRadius: '6px', border: '1px solid var(--border)' }}
                        >
                            {stats.children.map(child => (
                                <option key={child.id} value={child.id}>{child.first_name} {child.last_name} (Class {child.class_name}-{child.section})</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ flex: 1, maxWidth: '300px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Select Examination</label>
                        <select 
                            className="form-input" 
                            value={selectedExam} 
                            onChange={(e) => setSelectedExam(e.target.value)}
                            style={{ padding: '0.5rem', width: '100%', borderRadius: '6px', border: '1px solid var(--border)' }}
                            disabled={childExams.length === 0}
                        >
                            {childExams.map(exam => (
                                <option key={exam.id} value={exam.id}>{exam.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {scorecardData.length > 0 ? (
                    <div className="card print-only-child" style={{ padding: '2rem', position: 'relative' }}>
                        <div style={{ display: 'none' }} className="print-header">
                            <h2 style={{ margin: 0 }}>{stats.children.find(c => c.id == selectedChild)?.first_name} {stats.children.find(c => c.id == selectedChild)?.last_name}</h2>
                            <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 1.5rem 0' }}>
                                Class: {stats.children.find(c => c.id == selectedChild)?.class_name}-{stats.children.find(c => c.id == selectedChild)?.section} | 
                                Roll No: {stats.children.find(c => c.id == selectedChild)?.roll_number || 'N/A'}
                            </p>
                        </div>
                        <style>{`@media print { .print-header { display: block !important; } }`}</style>

                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>{childExams.find(e => e.id == selectedExam)?.name}</h2>
                        
                        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                                    <th style={{ padding: '1rem 0', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>Subject</th>
                                    <th style={{ padding: '1rem 0', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>Max Marks</th>
                                    <th style={{ padding: '1rem 0', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>Marks Obtained</th>
                                    <th style={{ padding: '1rem 0', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>Percentage</th>
                                    <th style={{ padding: '1rem 0', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>Grade</th>
                                </tr>
                            </thead>
                            <tbody>
                                {scorecardData.map((row, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem 0', fontSize: '0.9rem', fontWeight: 500 }}>{row.subject_name}</td>
                                        <td style={{ padding: '1rem 0', fontSize: '0.9rem' }}>{row.max_marks}</td>
                                        <td style={{ padding: '1rem 0', fontSize: '0.9rem', fontWeight: 600 }}>{row.marks_obtained}</td>
                                        <td style={{ padding: '1rem 0', fontSize: '0.9rem' }}>{row.max_marks > 0 ? ((row.marks_obtained/row.max_marks)*100).toFixed(0) : 0}%</td>
                                        <td style={{ padding: '1rem 0', fontSize: '0.9rem' }}>
                                            <span style={{ color: '#166534', background: '#DCFCE7', padding: '2px 8px', borderRadius: '12px', fontWeight: 600, fontSize: '0.8rem' }}>{row.grade}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                            <div style={{ textAlign: 'center', borderRight: '1px solid var(--border)' }}>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>Total Marks</p>
                                <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{totalObtained} / {totalMax}</h3>
                            </div>
                            <div style={{ textAlign: 'center', borderRight: '1px solid var(--border)' }}>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>Percentage</p>
                                <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{percentage}%</h3>
                            </div>
                            <div style={{ textAlign: 'center', borderRight: '1px solid var(--border)' }}>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>Grade</p>
                                <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{overallGrade}</h3>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>Overall Rank</p>
                                <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{rank}</h3>
                            </div>
                        </div>

                        <button className="btn-primary no-print" onClick={() => window.print()} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', fontSize: '1rem' }}>
                            Download Scorecard
                        </button>
                    </div>
                ) : (
                    <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <p>No scores available for the selected child and examination.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ParentScorecards;
