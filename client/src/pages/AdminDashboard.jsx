import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUserGraduate, FaChalkboardTeacher, FaUsers, FaBook, FaUserPlus, FaCalendarCheck, FaRegClipboard, FaChartPie, FaPlus, FaRegEnvelope, FaRegChartBar } from 'react-icons/fa';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import api from '../utils/api';
import './css/AdminDashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [monthFilter, setMonthFilter] = useState('this');
    const [hoveredAttendance, setHoveredAttendance] = useState(null);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const getCurrentDate = () => {
        const options = { day: 'numeric', month: 'short', year: 'numeric', weekday: 'long' };
        return new Date().toLocaleDateString('en-US', options);
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get(`/admin/dashboard/stats?month=${monthFilter}`);
                setStats(response.data.data);
            } catch (err) {
                setStats({
                    totalStudents: 0,
                    totalTeachers: 0,
                    totalParents: 0,
                    totalClasses: 0,
                    averagePerformance: 0,
                    attendanceRate: 0,
                    classData: [],
                    attendanceData: [],
                    performanceData: []
                });
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [monthFilter]);

    if (loading) return (
        <div className="dashboard-container">
            <div className="dashboard-header-main">
                <Skeleton width={300} height={40} />
                <Skeleton width={400} height={20} style={{ marginTop: '10px' }} />
            </div>
            <div className="stats-grid">
                <Skeleton height={120} borderRadius={16} />
                <Skeleton height={120} borderRadius={16} />
                <Skeleton height={120} borderRadius={16} />
                <Skeleton height={120} borderRadius={16} />
            </div>
            <div className="dashboard-grid">
                <Skeleton height={350} borderRadius={16} />
                <Skeleton height={350} borderRadius={16} />
            </div>
        </div>
    );

    const performanceData = stats?.performanceData || [];
    const attendanceData = stats?.attendanceData || [];
    const classData = stats?.classData || [];
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="dashboard-container"
        >
            <div className="dashboard-header-main" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="dash-title">{getGreeting()}, Admin! 👋</h1>
                    <p className="dash-subtitle">Here's what's happening in your school today.</p>
                </div>
                <div style={{ padding: '8px 16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#475569', fontSize: '13px', fontWeight: '500' }}>
                    {getCurrentDate()}
                </div>
            </div>

            {/* Top Stat Cards */}
            <div className="stats-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                <motion.div style={{ display: 'flex', flexDirection: 'column', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', background: 'var(--surface)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)' }}>
                                <FaUserGraduate />
                            </div>
                        </div>
                        <div>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>Total Students</span>
                            <h3 style={{ margin: '4px 0 0 0', fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)' }}>{stats?.totalStudents?.toLocaleString() || '1,245'}</h3>
                        </div>
                    </div>
                </motion.div>

                <motion.div style={{ display: 'flex', flexDirection: 'column', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', background: 'var(--surface)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)' }}>
                                <FaChalkboardTeacher />
                            </div>
                        </div>
                        <div>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>Total Teachers</span>
                            <h3 style={{ margin: '4px 0 0 0', fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)' }}>{stats?.totalTeachers?.toLocaleString() || '68'}</h3>
                        </div>
                    </div>
                </motion.div>

                <motion.div style={{ display: 'flex', flexDirection: 'column', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', background: 'var(--surface)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', boxShadow: '0 4px 6px -1px rgba(245, 158, 11, 0.3)' }}>
                                <FaUsers />
                            </div>
                        </div>
                        <div>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>Total Parents</span>
                            <h3 style={{ margin: '4px 0 0 0', fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)' }}>{stats?.totalParents?.toLocaleString() || '1,080'}</h3>
                        </div>
                    </div>
                </motion.div>

                <motion.div style={{ display: 'flex', flexDirection: 'column', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', background: 'var(--surface)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', boxShadow: '0 4px 6px -1px rgba(139, 92, 246, 0.3)' }}>
                                <FaBook />
                            </div>
                        </div>
                        <div>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>Total Classes</span>
                            <h3 style={{ margin: '4px 0 0 0', fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)' }}>{stats?.totalClasses?.toLocaleString() || '32'}</h3>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Middle Row */}
            <div className="middle-row">
                {/* Line Chart */}
                <motion.div className="dash-panel panel-chart" whileHover={{ y: -2, boxShadow: 'var(--shadow-1)' }}>
                    <div className="panel-header-split">
                        <h3 className="panel-title">Student Performance Overview</h3>
                        <select className="btn-outline" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} style={{ background: 'transparent', border: '1px solid var(--border-color, #cbd5e1)', borderRadius: '6px', padding: '4px 8px', fontSize: '13px', cursor: 'pointer' }}>
                            <option value="this">This Month</option>
                            <option value="last">Last Month</option>
                        </select>
                    </div>
                    <div className="chart-container" style={{ width: '100%', height: 250, marginTop: '20px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorScoreAdmin" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color, #cbd5e1)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorScoreAdmin)" activeDot={{ r: 6 }} isAnimationActive={true} animationDuration={1500} animationEasing="ease-out" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Donut Chart */}
                <motion.div className="dash-panel panel-donut" whileHover={{ y: -2, boxShadow: 'var(--shadow-1)' }}>
                    <div className="panel-header-split">
                        <h3 className="panel-title">Attendance Overview</h3>
                        <select className="btn-outline" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} style={{ background: 'transparent', border: '1px solid var(--border-color, #cbd5e1)', borderRadius: '6px', padding: '4px 8px', fontSize: '13px', cursor: 'pointer' }}>
                            <option value="this">This Month</option>
                            <option value="last">Last Month</option>
                        </select>
                    </div>
                    <div className="donut-content-row">
                        <div className="donut-chart-wrap" style={{ position: 'relative', width: '150px', height: '150px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={attendanceData}
                                        innerRadius={55}
                                        outerRadius={70}
                                        paddingAngle={2}
                                        dataKey="value"
                                        stroke="none"
                                        isAnimationActive={true}
                                        animationDuration={1500}
                                        animationEasing="ease-out"
                                        onMouseEnter={(_, index) => setHoveredAttendance(attendanceData[index])}
                                    >
                                        {attendanceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                {hoveredAttendance ? (
                                    <>
                                        <span style={{ fontSize: '24px', fontWeight: 'bold', color: hoveredAttendance.color }}>
                                            {Math.round((hoveredAttendance.value / (attendanceData.reduce((a, b) => a + b.value, 0) || 1)) * 100)}%
                                        </span>
                                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{hoveredAttendance.name}</div>
                                    </>
                                ) : (
                                    <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#64748b' }}>No Data</span>
                                )}
                            </div>
                        </div>
                        <div className="donut-legend">
                            {attendanceData.length > 0 ? attendanceData.map((item, idx) => (
                                <div className="legend-item" key={idx}>
                                    <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
                                    <span className="legend-label">{item.name}</span>
                                    <span className="legend-val">
                                        {Math.round((item.value / attendanceData.reduce((a, b) => a + b.value, 0)) * 100)}%
                                    </span>
                                </div>
                            )) : (
                                <div className="legend-item" style={{ color: '#64748b' }}>No attendance data available.</div>
                            )}
                        </div>
                    </div>
                </motion.div>

                <motion.div className="dash-panel panel-remarks" whileHover={{ y: -2, boxShadow: 'var(--shadow-1)' }}>
                    <div className="panel-header-split">
                        <h3 className="panel-title">Recent Remarks</h3>
                        <Link to="/admin/remarks" className="link-view-all">View All</Link>
                    </div>
                    <div className="remark-list">
                        {stats?.recentRemarks?.length > 0 ? (
                            stats.recentRemarks.map((remark, index) => (
                                <div className="remark-item" key={index}>
                                    <div className="remark-avatar">
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontWeight: 'bold' }}>
                                            {remark.sender_name?.charAt(0) || 'U'}
                                        </div>
                                    </div>
                                    <div className="remark-content">
                                        <h4>{remark.title}</h4>
                                        <p>{remark.message}</p>
                                        <span className="remark-meta">By: {remark.sender_name} • {new Date(remark.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No recent remarks found.</div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Bottom Row */}
            <div className="bottom-row">
                <motion.div className="dash-panel panel-exams" whileHover={{ y: -2, boxShadow: 'var(--shadow-1)' }}>
                    <div className="panel-header-split">
                        <h3 className="panel-title">Upcoming Examinations</h3>
                        <Link to="/admin/exams" className="link-view-all">View All</Link>
                    </div>
                    <table className="mini-table">
                        <thead>
                            <tr>
                                <th>Exam</th>
                                <th>Class</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats?.upcomingExams?.length > 0 ? (
                                stats.upcomingExams.map((exam, index) => (
                                    <tr key={index}>
                                        <td className="fw-500 text-blue">{exam.exam_name}</td>
                                        <td>Class {exam.class_id}</td>
                                        <td>{new Date(exam.start_date).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>No upcoming exams.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </motion.div>

                <motion.div className="dash-panel panel-students-class" whileHover={{ y: -2, boxShadow: 'var(--shadow-1)' }}>
                    <div className="panel-header-split">
                        <h3 className="panel-title">Students by Class</h3>
                        <select className="btn-outline" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} style={{ background: 'transparent', border: '1px solid var(--border-color, #cbd5e1)', borderRadius: '6px', padding: '4px 8px', fontSize: '13px', cursor: 'pointer' }}>
                            <option value="this">This Month</option>
                            <option value="last">Last Month</option>
                        </select>
                    </div>
                    <div className="chart-container" style={{ width: '100%', height: 250, marginTop: '20px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={classData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorBarAdmin" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#2563eb" stopOpacity={0.7} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color, #cbd5e1)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} cursor={{ fill: '#f8fafc' }} />
                                <Bar dataKey="students" fill="url(#colorBarAdmin)" radius={[4, 4, 0, 0]} maxBarSize={40} isAnimationActive={true} animationDuration={1500} animationEasing="ease-out" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default AdminDashboard;
