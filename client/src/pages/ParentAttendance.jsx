import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import api from '../utils/api';
import './css/AdminDashboard.css';

const ParentAttendance = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [selectedChild, setSelectedChild] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');

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

    let availableMonths = [];
    if (stats && selectedChild && stats.detailed_attendance) {
        const childAttendance = stats.detailed_attendance.filter(a => a.student_id == selectedChild);
        const monthSet = new Set();
        childAttendance.forEach(a => {
            const date = new Date(a.date);
            const monthStr = date.toLocaleString('default', { month: 'long', year: 'numeric' });
            monthSet.add(monthStr);
        });
        availableMonths = Array.from(monthSet).sort((a, b) => new Date(b) - new Date(a));
    }

    useEffect(() => {
        if (availableMonths.length > 0) {
            if (!availableMonths.includes(selectedMonth)) {
                setSelectedMonth(availableMonths[0]);
            }
        } else {
            setSelectedMonth('');
        }
    }, [selectedChild, stats]);

    let pieData = [];
    let trendData = [];
    let overallPercentage = 0;
    let totalDays = 0;

    if (stats && selectedChild && selectedMonth && stats.detailed_attendance) {
        const childAttendance = stats.detailed_attendance.filter(a => a.student_id == selectedChild);
        
        const monthAttendance = childAttendance.filter(a => {
            const date = new Date(a.date);
            return date.toLocaleString('default', { month: 'long', year: 'numeric' }) === selectedMonth;
        });

        let present = 0;
        let absent = 0;
        let late = 0;

        monthAttendance.forEach(a => {
            const status = (a.status || '').toLowerCase();
            if (status === 'present') present++;
            else if (status === 'absent') absent++;
            else if (status === 'late') late++;
        });

        totalDays = present + absent + late;
        
        // Let's count Late as attending for overall %
        overallPercentage = totalDays > 0 ? Math.round(((present + late) / totalDays) * 100) : 0;

        const presentPct = totalDays > 0 ? Math.round((present / totalDays) * 100) : 0;
        const absentPct = totalDays > 0 ? Math.round((absent / totalDays) * 100) : 0;
        const latePct = totalDays > 0 ? Math.round((late / totalDays) * 100) : 0;

        pieData = [
            { name: 'Present', value: presentPct, color: '#10B981', days: present },
            { name: 'Absent', value: absentPct, color: '#EF4444', days: absent },
            { name: 'Late', value: latePct, color: '#F59E0B', days: late }
        ];

        const monthlyStats = {};
        childAttendance.forEach(a => {
            const date = new Date(a.date);
            // Construct a sortable key: YYYY-MM
            const monthVal = date.getMonth() + 1; 
            const sortKey = `${date.getFullYear()}-${monthVal < 10 ? '0' + monthVal : monthVal}`;
            const monthLabel = date.toLocaleString('default', { month: 'short' });
            
            if (!monthlyStats[sortKey]) {
                monthlyStats[sortKey] = { month: monthLabel, present: 0, total: 0, sortKey };
            }
            monthlyStats[sortKey].total++;
            const status = (a.status || '').toLowerCase();
            if (status === 'present' || status === 'late') {
                monthlyStats[sortKey].present++;
            }
        });

        const sortedMonths = Object.values(monthlyStats).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
        trendData = sortedMonths.slice(-6).map(m => ({
            month: m.month,
            value: Math.round((m.present / m.total) * 100)
        }));
    }

    if (loading) {
        return (
            <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ width: '50px', height: '50px', border: '4px solid var(--border, #e2e8f0)', borderTopColor: 'var(--primary, #3b82f6)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <p style={{ color: 'var(--text-secondary, #64748b)', fontWeight: 500 }}>Loading Attendance...</p>
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
                            {stats.children.map(child => (
                                <option key={child.id} value={child.id}>{child.first_name} {child.last_name} (Class {child.class_name}-{child.section})</option>
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
                            disabled={availableMonths.length === 0}
                        >
                            {availableMonths.map(month => (
                                <option key={month} value={month}>{month}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {totalDays > 0 ? (
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
                                        <h3 style={{ fontSize: '2rem', margin: 0, fontWeight: 700 }}>{overallPercentage}%</h3>
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
                                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{totalDays} Days</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Attendance Trend */}
                        <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                            <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 600 }}>Attendance Trend (Last 6 Months)</h2>
                            
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
                ) : (
                    <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <p>No attendance data available for the selected month.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ParentAttendance;
