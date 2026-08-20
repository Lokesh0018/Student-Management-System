import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../utils/api';
import './css/AdminDashboard.css';

const ParentPerformance = () => {
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

    let performanceData = [];
    let avgScore = 0;
    let highest = { subject: 'N/A', score: 0 };
    let lowest = { subject: 'N/A', score: 100 };
    let improvementText = 'N/A';
    let improvementVal = 0;
    let showImprovement = false;

    if (stats && selectedChild && selectedExam) {
        const examMarks = stats.marks.filter(m => m.student_id == selectedChild && m.exam_id == selectedExam);
        let totalPercent = 0;

        examMarks.forEach(m => {
            const pct = m.max_marks > 0 ? (Number(m.marks_obtained) / Number(m.max_marks)) * 100 : 0;
            performanceData.push({
                subject: m.subject_name,
                score: Number(pct.toFixed(1))
            });
            totalPercent += pct;
            
            if (pct > highest.score || highest.subject === 'N/A') {
                highest = { subject: m.subject_name, score: pct };
            }
            if (pct < lowest.score || lowest.subject === 'N/A') {
                lowest = { subject: m.subject_name, score: pct };
            }
        });

        if (examMarks.length > 0) {
            avgScore = (totalPercent / examMarks.length).toFixed(1);
        }

        const currentExamIndex = childExams.findIndex(e => e.id == selectedExam);
        if (currentExamIndex >= 0 && currentExamIndex + 1 < childExams.length) {
            const prevExamId = childExams[currentExamIndex + 1].id;
            const prevMarks = stats.marks.filter(m => m.student_id == selectedChild && m.exam_id == prevExamId);
            if (prevMarks.length > 0) {
                let prevTotal = 0;
                prevMarks.forEach(m => {
                    prevTotal += m.max_marks > 0 ? (Number(m.marks_obtained) / Number(m.max_marks)) * 100 : 0;
                });
                const prevAvg = prevTotal / prevMarks.length;
                improvementVal = (avgScore - prevAvg).toFixed(1);
                showImprovement = true;
            }
        }
    }

    if (loading) {
        return (
            <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ width: '50px', height: '50px', border: '4px solid var(--border, #e2e8f0)', borderTopColor: 'var(--primary, #3b82f6)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <p style={{ color: 'var(--text-secondary, #64748b)', fontWeight: 500 }}>Loading Performance Data...</p>
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
                
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Performance</h1>

                <div style={{ display: 'flex', gap: '2rem', marginBottom: '0.5rem' }}>
                    <div style={{ flex: 1 }}>
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
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Select Exam</label>
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

                {performanceData.length > 0 ? (
                    <>
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 600 }}>Performance Overview ({childExams.find(e => e.id == selectedExam)?.name})</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                                <div>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>Average Score</p>
                                    <h3 style={{ fontSize: '1.75rem', margin: 0, fontWeight: 700 }}>{avgScore}%</h3>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>Highest Score</p>
                                    <h3 style={{ fontSize: '1.75rem', margin: 0, fontWeight: 700 }}>{highest.score.toFixed(1)}%</h3>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>{highest.subject}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>Lowest Score</p>
                                    <h3 style={{ fontSize: '1.75rem', margin: 0, fontWeight: 700 }}>{lowest.score.toFixed(1)}%</h3>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>{lowest.subject}</p>
                                </div>
                                <div style={{ background: showImprovement ? (improvementVal >= 0 ? '#DCFCE7' : '#FEE2E2') : '#F1F5F9', padding: '1rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <p style={{ fontSize: '0.85rem', color: showImprovement ? (improvementVal >= 0 ? '#166534' : '#991B1B') : 'var(--text-secondary)', margin: '0 0 0.25rem 0', fontWeight: 500 }}>Improvement</p>
                                    <h3 style={{ fontSize: '1.5rem', margin: 0, color: showImprovement ? (improvementVal >= 0 ? '#166534' : '#991B1B') : 'var(--text-primary)', fontWeight: 700 }}>
                                        {showImprovement ? (improvementVal >= 0 ? `+${improvementVal}%` : `${improvementVal}%`) : 'N/A'}
                                    </h3>
                                    <p style={{ fontSize: '0.75rem', color: showImprovement ? (improvementVal >= 0 ? '#166534' : '#991B1B') : 'var(--text-secondary)', margin: 0, opacity: 0.8 }}>From Last Exam</p>
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                            <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 600 }}>Subject Performance</h2>
                            <div style={{ width: '100%', height: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={performanceData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} barSize={40}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                        <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(val) => `${val}%`} />
                                        <Tooltip cursor={{ fill: '#F1F5F9' }} />
                                        <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                                            {performanceData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill="#3B82F6" />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <p>No performance data available for the selected child and examination.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ParentPerformance;
