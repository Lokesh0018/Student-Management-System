import React, { useState } from 'react';
import './css/AdminDashboard.css';

const MOCK_REMARKS = [
    { id: 1, title: 'Excellent improvement in Mathematics', category: 'Academic', priority: 'Important', from: 'Teacher', time: '2 hours ago', unread: true },
    { id: 2, title: 'Good participation in Science activity', category: 'General', priority: 'Normal', from: 'Teacher', time: '1 day ago', unread: true },
    { id: 3, title: 'Needs to focus more on Social Studies', category: 'Academic', priority: 'Important', from: 'Teacher', time: '3 days ago', unread: false },
    { id: 4, title: 'Keep up the good work!', category: 'General', priority: 'Low', from: 'Admin', time: '5 days ago', unread: false }
];

const ParentRemarks = () => {
    const [filter, setFilter] = useState('All Remarks');

    return (
        <div className="page-container">
            <div className="dashboard-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem' }}>
                    <span style={{ cursor: 'pointer' }}>Dashboard</span>
                    <span>&gt;</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Remarks</span>
                </div>

                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Remarks</h1>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '2rem' }}>
                        {['All Remarks', 'Unread', 'Read'].map(f => (
                            <span 
                                key={f} 
                                onClick={() => setFilter(f)}
                                style={{ 
                                    cursor: 'pointer', 
                                    fontWeight: filter === f ? 600 : 500,
                                    color: filter === f ? 'var(--primary)' : 'var(--text-secondary)',
                                    borderBottom: filter === f ? '2px solid var(--primary)' : 'none',
                                    paddingBottom: '0.5rem',
                                    marginBottom: '-0.6rem'
                                }}
                            >
                                {f}
                            </span>
                        ))}
                    </div>
                    <div>
                        <select className="form-input" style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem' }}>
                            <option>All Categories</option>
                            <option>Academic</option>
                            <option>General</option>
                        </select>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                    {MOCK_REMARKS.filter(r => filter === 'All Remarks' ? true : filter === 'Unread' ? r.unread : !r.unread).map(remark => (
                        <div key={remark.id} className="card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>{remark.title}</h3>
                                
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <span style={{ color: '#3B82F6', background: '#DBEAFE', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>{remark.category}</span>
                                    <span style={{ 
                                        color: remark.priority === 'Important' ? '#D97706' : '#166534', 
                                        background: remark.priority === 'Important' ? '#FEF3C7' : '#DCFCE7', 
                                        padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 
                                    }}>
                                        {remark.priority}
                                    </span>
                                </div>

                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                    From: {remark.from} <span style={{ float: 'right' }}>{remark.time}</span>
                                </div>
                            </div>
                            
                            {remark.unread && (
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444', position: 'absolute', right: '1.5rem', top: '1.5rem' }}></div>
                            )}
                        </div>
                    ))}
                </div>

                <div style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    No more remarks
                </div>
            </div>
        </div>
    );
};

export default ParentRemarks;
