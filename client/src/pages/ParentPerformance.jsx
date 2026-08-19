import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './css/AdminDashboard.css';

const MOCK_CHILDREN = [
    { id: 1, name: 'Rahul Kumar (Class 10-A)' }
];
const MOCK_EXAMS = [
    { id: 1, name: 'Final Examination 2024-25' }
];

const performanceData = [
    { subject: 'Maths', score: 92 },
    { subject: 'Science', score: 87 },
    { subject: 'English', score: 84 },
    { subject: 'S.St.', score: 79 },
    { subject: 'Computer', score: 95 }
];

const ParentPerformance = () => {
    const [selectedChild, setSelectedChild] = useState(MOCK_CHILDREN[0].id);
    const [selectedExam, setSelectedExam] = useState(MOCK_EXAMS[0].id);

    return (
        <div className="page-container">
            <div className="dashboard-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem' }}>
                    <span style={{ cursor: 'pointer' }}>Dashboard</span>
                    <span>&gt;</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Performance</span>
                </div>

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
                            {MOCK_CHILDREN.map(child => (
                                <option key={child.id} value={child.id}>{child.name}</option>
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
                        >
                            {MOCK_EXAMS.map(exam => (
                                <option key={exam.id} value={exam.id}>{exam.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="card" style={{ padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 600 }}>Performance Overview</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                        <div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>Average Score</p>
                            <h3 style={{ fontSize: '1.75rem', margin: 0, fontWeight: 700 }}>87%</h3>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>Highest Score</p>
                            <h3 style={{ fontSize: '1.75rem', margin: 0, fontWeight: 700 }}>95%</h3>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>Computer</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>Lowest Score</p>
                            <h3 style={{ fontSize: '1.75rem', margin: 0, fontWeight: 700 }}>79%</h3>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>Social Studies</p>
                        </div>
                        <div style={{ background: '#DCFCE7', padding: '1rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <p style={{ fontSize: '0.85rem', color: '#166534', margin: '0 0 0.25rem 0', fontWeight: 500 }}>Improvement</p>
                            <h3 style={{ fontSize: '1.5rem', margin: 0, color: '#166534', fontWeight: 700 }}>+6%</h3>
                            <p style={{ fontSize: '0.75rem', color: '#166534', margin: 0, opacity: 0.8 }}>From Last Exam</p>
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

                    <button className="btn-outline" style={{ marginTop: '2rem', width: '100%', padding: '0.75rem', borderRadius: '6px', color: 'var(--primary)', borderColor: 'var(--primary)' }}>
                        View Detailed Performance Report →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ParentPerformance;
