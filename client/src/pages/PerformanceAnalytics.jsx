import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './css/StudentList.css'; // Use the shared layout CSS

const PerformanceAnalytics = () => {
    
    // Mock data for charts as per the implementation plan (using realistic data matching the design)
    const subjectAverages = [
        { name: 'Computer', avg: 85 },
        { name: 'Social Studies', avg: 70 },
        { name: 'English', avg: 72 },
        { name: 'Science', avg: 75 },
        { name: 'Maths', avg: 78 }
    ];

    const distributionData = [
        { name: '90% and above', value: 25, color: '#10b981' },
        { name: '75% - 89%', value: 45, color: '#3b82f6' },
        { name: '50% - 74%', value: 25, color: '#f59e0b' },
        { name: 'Below 50%', value: 5, color: '#ef4444' }
    ];

    const topPerformers = [
        { rank: 1, name: 'Meera Nair', score: '95%' },
        { rank: 2, name: 'Aditya Gupta', score: '92%' },
        { rank: 3, name: 'Aryan Verma', score: '90%' }
    ];

    const needsImprovement = [
        { rank: 1, name: 'Rohan Mehta', score: '62%' },
        { rank: 2, name: 'Ananya Singh', score: '65%' },
        { rank: 3, name: 'Vivaan Patel', score: '68%' }
    ];

    return (
        <div className="student-list-page">
            <div className="page-header-row" style={{ marginBottom: '24px' }}>
                <div className="page-header-left">
                    <h1 className="page-title">Class Performance</h1>
                    <p className="page-subtitle">Dashboard &gt; Performance</p>
                </div>
                <button className="btn-outline">This Month <span>&#9662;</span></button>
            </div>

            {/* Top Stats Cards */}
            <div className="stats-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '24px' }}>
                <div className="stat-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Average Score</span>
                    <span style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a' }}>78.6%</span>
                </div>
                <div className="stat-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Highest Score</span>
                    <span style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a' }}>95%</span>
                    <span style={{ fontSize: '12px', fontWeight: '500', color: '#0f172a' }}>Meera Nair</span>
                </div>
                <div className="stat-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Lowest Score</span>
                    <span style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a' }}>62%</span>
                    <span style={{ fontSize: '12px', fontWeight: '500', color: '#0f172a' }}>Rohan Mehta</span>
                </div>
                <div className="stat-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Pass Percentage</span>
                    <span style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a' }}>100%</span>
                </div>
            </div>

            {/* Middle Row: Charts */}
            <div className="middle-row" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '24px' }}>
                {/* Subject Wise Average */}
                <div className="table-card" style={{ padding: '24px' }}>
                    <h3 style={{ margin: '0 0 24px 0', fontSize: '16px', color: '#0f172a' }}>Subject Wise Average</h3>
                    <div style={{ width: '100%', height: '250px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={subjectAverages} margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                <XAxis type="number" domain={[0, 100]} tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                                <YAxis dataKey="name" type="category" tick={{fontSize: 12, fill: '#475569'}} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{fill: '#f8fafc'}} />
                                <Bar dataKey="avg" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={16} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Performance Distribution */}
                <div className="table-card" style={{ padding: '24px' }}>
                    <h3 style={{ margin: '0 0 24px 0', fontSize: '16px', color: '#0f172a' }}>Performance Distribution</h3>
                    <div style={{ display: 'flex', height: '250px', alignItems: 'center' }}>
                        <div style={{ flex: 1, height: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={distributionData}
                                        innerRadius={60}
                                        outerRadius={85}
                                        paddingAngle={2}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {distributionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {distributionData.map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color }}></div>
                                        <span style={{ fontSize: '13px', color: '#475569', fontWeight: '500' }}>{item.name}</span>
                                    </div>
                                    <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: '600' }}>{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Lists */}
            <div className="middle-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="table-card" style={{ padding: '24px' }}>
                    <h3 style={{ margin: '0 0 24px 0', fontSize: '16px', color: '#0f172a' }}>Top Performers</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {topPerformers.map((student, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: idx !== topPerformers.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '600' }}>
                                        {student.rank}
                                    </div>
                                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a' }}>{student.name}</span>
                                </div>
                                <span style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>{student.score}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="table-card" style={{ padding: '24px' }}>
                    <h3 style={{ margin: '0 0 24px 0', fontSize: '16px', color: '#0f172a' }}>Needs Improvement</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {needsImprovement.map((student, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: idx !== needsImprovement.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '600' }}>
                                        {student.rank}
                                    </div>
                                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a' }}>{student.name}</span>
                                </div>
                                <span style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>{student.score}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerformanceAnalytics;
