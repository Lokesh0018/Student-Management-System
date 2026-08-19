import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import './css/AdminDashboard.css';

const MOCK_CHILDREN = [
    { id: 1, name: 'Rahul Kumar (Class 10-A)' }
];
const MOCK_MONTHS = [
    { id: 1, name: 'May 2024' }
];

const pieData = [
    { name: 'Present', value: 94, color: '#10B981', days: 26 },
    { name: 'Absent', value: 4, color: '#EF4444', days: 2 },
    { name: 'Late', value: 0, color: '#F59E0B', days: 0 }
];

const trendData = [
    { month: 'Dec', value: 80 },
    { month: 'Jan', value: 90 },
    { month: 'Feb', value: 85 },
    { month: 'Mar', value: 92 },
    { month: 'Apr', value: 90 },
    { month: 'May', value: 94 }
];

const ParentAttendance = () => {
    const [selectedChild, setSelectedChild] = useState(MOCK_CHILDREN[0].id);
    const [selectedMonth, setSelectedMonth] = useState(MOCK_MONTHS[0].id);

    return (
        <div className="page-container">
            <div className="dashboard-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem' }}>
                    <span style={{ cursor: 'pointer' }}>Dashboard</span>
                    <span>&gt;</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Attendance</span>
                </div>

                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Attendance</h1>

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
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Select Month</label>
                        <select 
                            className="form-input" 
                            value={selectedMonth} 
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            style={{ padding: '0.5rem', width: '100%', borderRadius: '6px', border: '1px solid var(--border)' }}
                        >
                            {MOCK_MONTHS.map(month => (
                                <option key={month.id} value={month.id}>{month.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'stretch' }}>
                    {/* Attendance Summary */}
                    <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                        <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 600 }}>Attendance Summary</h2>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flex: 1 }}>
                            <div style={{ width: '200px', height: '200px', position: 'relative' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            innerRadius={70}
                                            outerRadius={90}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                    <h3 style={{ fontSize: '2rem', margin: 0, fontWeight: 700 }}>94%</h3>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: 0, textAlign: 'center', width: '60%' }}>Overall Attendance</p>
                                </div>
                            </div>

                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {pieData.map(item => (
                                    <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color }}></div>
                                            <div>
                                                <p style={{ fontSize: '0.9rem', fontWeight: 500, margin: 0 }}>{item.name}</p>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>{item.days} Days</p>
                                            </div>
                                        </div>
                                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.value}%</span>
                                    </div>
                                ))}
                                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Total Days</span>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>30 Days</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Attendance Trend */}
                    <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                        <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 600 }}>Attendance Trend</h2>
                        
                        <div style={{ flex: 1, minHeight: '250px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(val) => `${val}%`} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ParentAttendance;
