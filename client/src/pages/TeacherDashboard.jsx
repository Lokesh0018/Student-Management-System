import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUserGraduate, FaCalendarCheck, FaRegClipboard, FaCheckCircle } from 'react-icons/fa';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import api from '../utils/api';
import './css/AdminDashboard.css';

const TeacherDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hoveredAttendance, setHoveredAttendance] = useState({ name: 'Present', value: 94, color: '#10b981' });

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
                    recentMarks: [],
                    performanceData: [],
                    attendanceData: []
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

    const performanceData = stats?.performanceData || [];
    const attendanceData = stats?.attendanceData || [];

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
            <div className="stats-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                <motion.div style={{ display: 'flex', flexDirection: 'column', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', background: 'var(--surface)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)' }}>
                                <FaUserGraduate />
                            </div>
                            <span style={{ padding: '4px 10px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>Active</span>
                        </div>
                        <div>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>Total Students</span>
                            <h3 style={{ margin: '4px 0 0 0', fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)' }}>{stats?.totalStudents || '42'}</h3>
                        </div>
                    </div>
                </motion.div>
                
                <motion.div style={{ display: 'flex', flexDirection: 'column', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', background: 'var(--surface)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)' }}>
                                <FaCalendarCheck />
                            </div>
                            <span style={{ padding: '4px 10px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>+2.1%</span>
                        </div>
                        <div>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>Average Attendance</span>
                            <h3 style={{ margin: '4px 0 0 0', fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)' }}>{stats?.attendance || '94'}%</h3>
                        </div>
                    </div>
                </motion.div>
                
                <motion.div style={{ display: 'flex', flexDirection: 'column', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', background: 'var(--surface)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', boxShadow: '0 4px 6px -1px rgba(245, 158, 11, 0.3)' }}>
                                <FaCheckCircle />
                            </div>
                            <span style={{ padding: '4px 10px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>+1.4%</span>
                        </div>
                        <div>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>Class Average</span>
                            <h3 style={{ margin: '4px 0 0 0', fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)' }}>{stats?.averageScore || '78.6'}%</h3>
                        </div>
                    </div>
                </motion.div>

                <motion.div style={{ display: 'flex', flexDirection: 'column', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', background: 'var(--surface)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', boxShadow: '0 4px 6px -1px rgba(244, 63, 94, 0.3)' }}>
                                <FaRegClipboard />
                            </div>
                            <span style={{ padding: '4px 10px', backgroundColor: 'rgba(244, 63, 94, 0.1)', color: '#e11d48', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>Action Needed</span>
                        </div>
                        <div>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>Unread Remarks</span>
                            <h3 style={{ margin: '4px 0 0 0', fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)' }}>{stats?.unreadRemarks || '8'}</h3>
                        </div>
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
                            <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color, #cbd5e1)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" activeDot={{ r: 6 }} isAnimationActive={true} animationDuration={1500} animationEasing="ease-out" />
                            </AreaChart>
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
                                <span className="legend-dot" style={{ backgroundColor: '#10b981'}}></span>
                                <span className="legend-label">Present</span>
                                <span className="legend-val">94%</span>
                            </div>
                            <div className="legend-item">
                                <span className="legend-dot" style={{ backgroundColor: '#f43f5e'}}></span>
                                <span className="legend-label">Absent</span>
                                <span className="legend-val">4%</span>
                            </div>
                            <div className="legend-item">
                                <span className="legend-dot" style={{ backgroundColor: '#6366f1'}}></span>
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
