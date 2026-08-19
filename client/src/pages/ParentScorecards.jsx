import React, { useState } from 'react';
import './css/AdminDashboard.css';

const MOCK_CHILDREN = [
    { id: 1, name: 'Rahul Kumar (Class 10-A)' },
    { id: 2, name: 'Priya Kumar (Class 8-B)' }
];

const MOCK_EXAMS = [
    { id: 1, name: 'Final Examination 2024-25' },
    { id: 2, name: 'Mid Term 2024-25' }
];

const MOCK_SCORECARD = [
    { subject: 'Mathematics', max: 100, obtained: 92, percentage: '92%', grade: 'A+' },
    { subject: 'Science', max: 100, obtained: 87, percentage: '87%', grade: 'A' },
    { subject: 'English', max: 100, obtained: 84, percentage: '84%', grade: 'A' },
    { subject: 'Social Studies', max: 100, obtained: 79, percentage: '79%', grade: 'B+' },
    { subject: 'Computer', max: 100, obtained: 95, percentage: '95%', grade: 'A+' }
];

const ParentScorecards = () => {
    const [selectedChild, setSelectedChild] = useState(MOCK_CHILDREN[0].id);
    const [selectedExam, setSelectedExam] = useState(MOCK_EXAMS[0].id);

    return (
        <div className="page-container">
            <div className="dashboard-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem' }}>
                    <span style={{ cursor: 'pointer' }}>Dashboard</span>
                    <span>&gt;</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Scorecards</span>
                </div>

                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Scorecard</h1>

                <div style={{ display: 'flex', gap: '2rem', marginBottom: '0.5rem' }}>
                    <div style={{ flex: 1, maxWidth: '300px' }}>
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
                    <div style={{ flex: 1, maxWidth: '300px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Select Examination</label>
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

                <div className="card" style={{ padding: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>{MOCK_EXAMS.find(e => e.id == selectedExam)?.name}</h2>
                    
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
                            {MOCK_SCORECARD.map((row, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem 0', fontSize: '0.9rem', fontWeight: 500 }}>{row.subject}</td>
                                    <td style={{ padding: '1rem 0', fontSize: '0.9rem' }}>{row.max}</td>
                                    <td style={{ padding: '1rem 0', fontSize: '0.9rem', fontWeight: 600 }}>{row.obtained}</td>
                                    <td style={{ padding: '1rem 0', fontSize: '0.9rem' }}>{row.percentage}</td>
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
                            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>437 / 500</h3>
                        </div>
                        <div style={{ textAlign: 'center', borderRight: '1px solid var(--border)' }}>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>Percentage</p>
                            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>87.40%</h3>
                        </div>
                        <div style={{ textAlign: 'center', borderRight: '1px solid var(--border)' }}>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>Grade</p>
                            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>A</h3>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>Rank</p>
                            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>5 / 42</h3>
                        </div>
                    </div>

                    <button className="btn-primary" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', fontSize: '1rem' }}>
                        Download Scorecard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ParentScorecards;
