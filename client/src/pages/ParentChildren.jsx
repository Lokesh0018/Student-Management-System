import React, { useState } from 'react';
import { FaDownload, FaArrowUp, FaArrowDown, FaUserGraduate } from 'react-icons/fa';
import './css/AdminDashboard.css';

const MOCK_CHILD = {
    id: 1,
    name: 'Rahul Kumar',
    class_name: '10-A',
    roll_no: '1023',
    academic_year: '2024-25',
    status: 'Active',
    img: 'https://i.pravatar.cc/150?img=11',
    dob: '15 Jan 2009',
    age: '15 Years',
    blood_group: 'B+',
    phone: '9876543210',
    email: 'rahul.kumar@email.com',
    address: '123, Green Park, New Delhi - 110016',
    metrics: {
        attendance: '94%',
        average_score: '87%',
        rank: '5 / 42',
        subjects: '5'
    },
    subjects_overview: [
        { name: 'Mathematics', score: '92%', grade: 'A+', trend: 'up', trend_val: '5%' },
        { name: 'Science', score: '87%', grade: 'A', trend: 'up', trend_val: '3%' },
        { name: 'English', score: '84%', grade: 'A', trend: 'up', trend_val: '2%' },
        { name: 'Social Studies', score: '79%', grade: 'B+', trend: 'down', trend_val: '2%' },
        { name: 'Computer', score: '95%', grade: 'A+', trend: 'up', trend_val: '4%' },
    ]
};

const ParentChildren = () => {
    const [activeTab, setActiveTab] = useState('Overview');
    
    const tabs = ['Overview', 'Scorecard', 'Attendance', 'Performance', 'Remarks'];

    return (
        <div className="page-container">
            <div className="dashboard-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Breadcrumbs */}
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem' }}>
                    <span style={{ cursor: 'pointer' }}>Dashboard</span>
                    <span>&gt;</span>
                    <span style={{ cursor: 'pointer' }}>My Children</span>
                    <span>&gt;</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{MOCK_CHILD.name}</span>
                </div>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>{MOCK_CHILD.name}</h1>
                            <span style={{ fontSize: '0.7rem', background: '#DCFCE7', color: '#166534', padding: '4px 8px', borderRadius: '12px', fontWeight: 600, textTransform: 'uppercase' }}>{MOCK_CHILD.status}</span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                            Class {MOCK_CHILD.class_name} <span style={{ margin: '0 0.5rem' }}>•</span> 
                            Roll No: {MOCK_CHILD.roll_no} <span style={{ margin: '0 0.5rem' }}>•</span> 
                            Academic Year: {MOCK_CHILD.academic_year}
                        </p>
                    </div>
                    <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '6px' }}>
                        <FaDownload /> Download Profile
                    </button>
                </div>

                {/* Tabs */}
                <div style={{ borderBottom: '1px solid var(--border)', display: 'flex', gap: '2rem' }}>
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

                {/* Tab Content: Overview */}
                {activeTab === 'Overview' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '1.5rem', alignItems: 'start' }}>
                        {/* Profile Card */}
                        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <img src={MOCK_CHILD.img} alt={MOCK_CHILD.name} style={{ width: '120px', height: '120px', borderRadius: '12px', objectFit: 'cover', marginBottom: '1.5rem' }} />
                            
                            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Date of Birth</span><span style={{ fontWeight: 500 }}>{MOCK_CHILD.dob}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Age</span><span style={{ fontWeight: 500 }}>{MOCK_CHILD.age}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Blood Group</span><span style={{ fontWeight: 500 }}>{MOCK_CHILD.blood_group}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Phone</span><span style={{ fontWeight: 500 }}>{MOCK_CHILD.phone}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Email</span><span style={{ fontWeight: 500 }}>{MOCK_CHILD.email}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}><span style={{ color: 'var(--text-secondary)', minWidth: '60px' }}>Address</span><span style={{ fontWeight: 500, textAlign: 'right' }}>{MOCK_CHILD.address}</span></div>
                            </div>

                            <button className="btn-outline" style={{ width: '100%', marginTop: '2rem', padding: '0.5rem', borderRadius: '6px', color: 'var(--primary)', borderColor: 'var(--border)' }}>
                                View Full Profile
                            </button>
                        </div>

                        {/* Right Content */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* Metrics Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                                <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>Attendance</p>
                                    <h3 style={{ fontSize: '1.75rem', margin: '0 0 0.25rem 0' }}>{MOCK_CHILD.metrics.attendance}</h3>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>This Month</p>
                                </div>
                                <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>Average Score</p>
                                    <h3 style={{ fontSize: '1.75rem', margin: '0 0 0.25rem 0' }}>{MOCK_CHILD.metrics.average_score}</h3>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>This Month</p>
                                </div>
                                <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>Rank</p>
                                    <h3 style={{ fontSize: '1.75rem', margin: '0 0 0.25rem 0' }}>{MOCK_CHILD.metrics.rank}</h3>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>In Class</p>
                                </div>
                                <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>Total Subjects</p>
                                    <h3 style={{ fontSize: '1.75rem', margin: '0 0 0.25rem 0' }}>{MOCK_CHILD.metrics.subjects}</h3>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Subjects</p>
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
                                        {MOCK_CHILD.subjects_overview.map((sub, idx) => (
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
                                        ))}
                                    </tbody>
                                </table>
                                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                                    <span style={{ color: 'var(--primary)', fontWeight: 500, cursor: 'pointer', fontSize: '0.9rem' }}>View Full Scorecard →</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Placeholders for other tabs for now */}
                {activeTab !== 'Overview' && (
                    <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <FaUserGraduate size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                        <p>{activeTab} view is accessible via the sidebar directly.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ParentChildren;
