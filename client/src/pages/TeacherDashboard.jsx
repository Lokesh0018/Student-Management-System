import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUserGraduate, FaCalendarCheck, FaRegClipboard, FaCheckCircle } from 'react-icons/fa';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import api from '../utils/api';
import './css/AdminDashboard.css';

const TeacherDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hoveredAttendance, setHoveredAttendance] = useState({ name: 'Present', value: 94, color: '#3b82f6' });

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
                const res = await api.get('/teacher/dashboard/stats');
                setStats(res.data.data);
            } catch (error) {
                console.error("Error fetching teacher dashboard stats", error);
                setStats({
                    totalStudents: 0,
                    attendance: 0,
                    averageScore: 0,
                    unreadRemarks: 0,
                    recentMarks: []
                });
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div className="dashboard-container">
            <div className="dashboard-header-main" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                    <Skeleton width={300} height={40} />
                    <Skeleton width={400} height={20} style={{ marginTop: '10px' }} />
                </div>
                <Skeleton width={150} height={30} />
            </div>
            <div className="stats-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginTop: '24px' }}>
                <Skeleton height={120} borderRadius={16} />
                <Skeleton height={120} borderRadius={16} />
                <Skeleton height={120} borderRadius={16} />
                <Skeleton height={120} borderRadius={16} />
            </div>
            <div className="middle-row" style={{ marginTop: '24px' }}>
                <Skeleton height={350} borderRadius={16} />
                <Skeleton height={350} borderRadius={16} />
                <Skeleton height={350} borderRadius={16} />
            </div>
        </div>
    );

    const performanceData = [
      { name: '1 May', score: 75 },
      { name: '8 May', score: 82 },
      { name: '15 May', score: 85 },
      { name: '22 May', score: 80 },
      { name: '29 May', score: 90 },
    ];

    const attendanceData = [
      { name: 'Present', value: 94, color: '#16a34a' },
      { name: 'Absent', value: 4, color: '#ef4444' },
      { name: 'Leave', value: 2, color: '#3b82f6' },
    ];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="dashboard-container"
        >
            <div className="dashboard-header-main" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="dash-title">{getGreeting()}, Teacher! 👋</h1>
                    <p className="dash-subtitle">Here's what's happening in your class today.</p>
                </div>
                <div style={{ padding: '8px 16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#475569', fontSize: '13px', fontWeight: '500' }}>
                    {getCurrentDate()}
                </div>
            </div>
            
            {/* Top Stat Cards */}
            <div className="stats-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <motion.div className="stat-card" whileHover={{ y: -4, boxShadow: 'var(--shadow-2)' }}>
                    <div className="stat-icon-square" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}>
                        <FaUserGraduate />
                    </div>
                    <div className="stat-data">
                        <span className="stat-label">Students</span>
                        <div className="stat-value-row">
                            <span className="stat-num">{stats?.totalStudents || '42'}</span>
                        </div>
                        <span className="stat-trend" style={{color: '#64748b'}}>All Active Students</span>
                    </div>
                </motion.div>
                
                <motion.div className="stat-card" whileHover={{ y: -4, boxShadow: 'var(--shadow-2)' }}>
                    <div className="stat-icon-square" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
                        <FaCalendarCheck />
                    </div>
                    <div className="stat-data">
                        <span className="stat-label">Attendance</span>
                        <div className="stat-value-row">
                            <span className="stat-num">{stats?.attendance || '94'}%</span>
                        </div>
                        <span className="stat-trend" style={{color: '#64748b'}}>Average This Month</span>
                    </div>
                </motion.div>
                
                <motion.div className="stat-card" whileHover={{ y: -4, boxShadow: 'var(--shadow-2)' }}>
                    <div className="stat-icon-square" style={{ backgroundColor: '#fffbeb', color: '#f59e0b' }}>
                        <FaCheckCircle />
                    </div>
                    <div className="stat-data">
                        <span className="stat-label">Average Score</span>
                        <div className="stat-value-row">
                            <span className="stat-num">{stats?.averageScore || '78.6'}%</span>
                        </div>
                        <span className="stat-trend" style={{color: '#64748b'}}>This Month</span>
                    </div>
                </motion.div>

                <motion.div className="stat-card" whileHover={{ y: -4, boxShadow: 'var(--shadow-2)' }}>
                    <div className="stat-icon-square" style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}>
                        <FaRegClipboard />
                    </div>
                    <div className="stat-data">
                        <span className="stat-label">Remarks</span>
                        <div className="stat-value-row">
                            <span className="stat-num">{stats?.unreadRemarks || '8'}</span>
                        </div>
                        <span className="stat-trend" style={{color: '#64748b'}}>Unread Remarks</span>
                    </div>
                </motion.div>
            </div>

            {/* Middle Row */}
            <div className="middle-row" style={{ gridTemplateColumns: '2fr 1fr 1fr', marginTop: '8px' }}>
                {/* Line Chart */}
                <motion.div className="dash-panel panel-chart" whileHover={{ y: -2, boxShadow: 'var(--shadow-1)' }}>
                    <div className="panel-header-split">
                        <h3 className="panel-title">Class Performance Overview</h3>
                        <button className="btn-outline">This Month <span>&#9662;</span></button>
                    </div>
                    <div className="chart-container" style={{ width: '100%', height: 250, marginTop: '20px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color, #cbd5e1)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} isAnimationActive={true} animationDuration={1500} animationEasing="ease-out" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Donut Chart */}
                <motion.div className="dash-panel panel-donut" whileHover={{ y: -2, boxShadow: 'var(--shadow-1)' }}>
                    <div className="panel-header-split">
                        <h3 className="panel-title">Attendance Overview</h3>
                        <button className="btn-outline">This Month <span>&#9662;</span></button>
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
                                <span style={{ fontSize: '24px', fontWeight: 'bold', color: hoveredAttendance.color }}>{hoveredAttendance.value}%</span>
                            </div>
                        </div>
                        <div className="donut-legend">
                            <div className="legend-item">
                                <span className="legend-dot" style={{ backgroundColor: '#16a34a'}}></span>
                                <span className="legend-label">Present</span>
                                <span className="legend-val">94%</span>
                            </div>
                            <div className="legend-item">
                                <span className="legend-dot" style={{ backgroundColor: '#ef4444'}}></span>
                                <span className="legend-label">Absent</span>
                                <span className="legend-val">4%</span>
                            </div>
                            <div className="legend-item">
                                <span className="legend-dot" style={{ backgroundColor: '#3b82f6'}}></span>
                                <span className="legend-label">Leave</span>
                                <span className="legend-val">2%</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Remarks List */}
                <motion.div className="dash-panel panel-remarks" whileHover={{ y: -2, boxShadow: 'var(--shadow-1)' }}>
                    <div className="panel-header-split">
                        <h3 className="panel-title">Recent Remarks</h3>
                        <a href="#" className="link-view-all">View All</a>
                    </div>
                    <div className="remark-list">
                        <div className="remark-item">
                            <div className="remark-avatar">
                                <div style={{width: 36, height: 36, borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', fontSize: '14px'}}>RK</div>
                            </div>
                            <div className="remark-content">
                                <h4>Rahul Kumar</h4>
                                <p>Excellent improvement in Mathematics</p>
                                <span className="remark-meta">2 hours ago</span>
                            </div>
                        </div>
                        <div className="remark-item">
                            <div className="remark-avatar">
                                <div style={{width: 36, height: 36, borderRadius: '50%', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706', fontSize: '14px'}}>PS</div>
                            </div>
                            <div className="remark-content">
                                <h4>Priya Sharma</h4>
                                <p>Good participation in Science activity</p>
                                <span className="remark-meta">1 day ago</span>
                            </div>
                        </div>
                        <div className="remark-item">
                            <div className="remark-avatar">
                                <div style={{width: 36, height: 36, borderRadius: '50%', backgroundColor: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9333ea', fontSize: '14px'}}>AD</div>
                            </div>
                            <div className="remark-content">
                                <h4>Admin</h4>
                                <p>Meeting on Parent-Teacher Interaction</p>
                                <span className="remark-meta">2 days ago</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Bottom Row */}
            <div className="bottom-row" style={{ gridTemplateColumns: '1fr', marginTop: '24px' }}>
                <motion.div className="dash-panel panel-exams" whileHover={{ y: -2, boxShadow: 'var(--shadow-1)' }}>
                    <div className="panel-header-split">
                        <h3 className="panel-title">Students Needing Attention</h3>
                        <a href="#" className="link-view-all">View All</a>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                            <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Rohan" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                            <div style={{ flex: 1 }}>
                                <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#0f172a' }}>Rohan Mehta</h4>
                                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#64748b' }}>
                                    <span>Attendance: 72%</span>
                                    <span>Average: 62%</span>
                                </div>
                            </div>
                            <button className="btn-outline" style={{ color: '#3b82f6', borderColor: '#bfdbfe', backgroundColor: '#eff6ff' }}>View</button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                            <img src="https://randomuser.me/api/portraits/women/68.jpg" alt="Ananya" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                            <div style={{ flex: 1 }}>
                                <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#0f172a' }}>Ananya Singh</h4>
                                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#64748b' }}>
                                    <span>Attendance: 75%</span>
                                    <span>Average: 65%</span>
                                </div>
                            </div>
                            <button className="btn-outline" style={{ color: '#3b82f6', borderColor: '#bfdbfe', backgroundColor: '#eff6ff' }}>View</button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 0' }}>
                            <img src="https://randomuser.me/api/portraits/men/44.jpg" alt="Vivaan" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                            <div style={{ flex: 1 }}>
                                <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#0f172a' }}>Vivaan Patel</h4>
                                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#64748b' }}>
                                    <span>Attendance: 78%</span>
                                    <span>Average: 68%</span>
                                </div>
                            </div>
                            <button className="btn-outline" style={{ color: '#3b82f6', borderColor: '#bfdbfe', backgroundColor: '#eff6ff' }}>View</button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default TeacherDashboard;
