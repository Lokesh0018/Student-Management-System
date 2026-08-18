import React, { useState, useEffect } from 'react';
import { FaUserGraduate, FaChalkboardTeacher, FaUsers, FaBook, FaUserPlus, FaCalendarCheck, FaRegClipboard, FaChartPie, FaPlus, FaRegEnvelope, FaRegChartBar } from 'react-icons/fa';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import api from '../utils/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/admin/dashboard/stats');
                setStats(response.data.data);
            } catch (err) {
                setStats({
                    totalStudents: 1245,
                    totalTeachers: 68,
                    totalParents: 1080,
                    totalClasses: 32
                });
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="loading-state">Loading dashboard...</div>;

    const performanceData = [
      { name: '1 May', score: 75 },
      { name: '8 May', score: 82 },
      { name: '15 May', score: 85 },
      { name: '22 May', score: 80 },
      { name: '29 May', score: 90 },
    ];

    const attendanceData = [
      { name: 'Present', value: 94, color: '#3b82f6' },
      { name: 'Absent', value: 4, color: '#ef4444' },
      { name: 'Leave', value: 2, color: '#cbd5e1' },
    ];

    const classData = [
      { name: '6th', students: 120 },
      { name: '7th', students: 140 },
      { name: '8th', students: 160 },
      { name: '9th', students: 150 },
      { name: '10th', students: 180 },
      { name: '11th', students: 170 },
      { name: '12th', students: 140 },
    ];

    return (
        <div className="dashboard-container">
            <div className="dashboard-header-main">
                <h1 className="dash-title">Good Morning, Admin! 👋</h1>
                <p className="dash-subtitle">Here's what's happening in your school today.</p>
            </div>
            
            {/* Top Stat Cards */}
            <div className="stats-row">
                <div className="stat-card">
                    <div className="stat-icon-square" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}>
                        <FaUserGraduate />
                    </div>
                    <div className="stat-data">
                        <span className="stat-label">Students</span>
                        <div className="stat-value-row">
                            <span className="stat-num">{stats?.totalStudents?.toLocaleString() || '1,245'}</span>
                        </div>
                        <span className="stat-trend trend-up">+4.2% this month</span>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon-square" style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}>
                        <FaChalkboardTeacher />
                    </div>
                    <div className="stat-data">
                        <span className="stat-label">Teachers</span>
                        <div className="stat-value-row">
                            <span className="stat-num">{stats?.totalTeachers?.toLocaleString() || '68'}</span>
                        </div>
                        <span className="stat-trend trend-up">+2 this month</span>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon-square" style={{ backgroundColor: '#f0fdf4', color: '#3b82f6' }}>
                        <FaUsers />
                    </div>
                    <div className="stat-data">
                        <span className="stat-label">Parents</span>
                        <div className="stat-value-row">
                            <span className="stat-num">{stats?.totalParents?.toLocaleString() || '1,080'}</span>
                        </div>
                        <span className="stat-trend trend-up">+5.1% this month</span>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon-square" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
                        <FaBook />
                    </div>
                    <div className="stat-data">
                        <span className="stat-label">Classes</span>
                        <div className="stat-value-row">
                            <span className="stat-num">{stats?.totalClasses?.toLocaleString() || '32'}</span>
                        </div>
                        <span className="stat-trend trend-up">+1 this month</span>
                    </div>
                </div>
            </div>

            {/* Middle Row */}
            <div className="middle-row">
                {/* Line Chart */}
                <div className="dash-panel panel-chart">
                    <div className="panel-header-split">
                        <h3 className="panel-title">Student Performance Overview</h3>
                        <button className="btn-outline">This Month <span>&#9662;</span></button>
                    </div>
                    <div className="chart-container" style={{ width: '100%', height: 250, marginTop: '20px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Donut Chart */}
                <div className="dash-panel panel-donut">
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
                                    >
                                        {attendanceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>94%</span>
                            </div>
                        </div>
                        <div className="donut-legend">
                            <div className="legend-item">
                                <span className="legend-dot" style={{ backgroundColor: '#3b82f6'}}></span>
                                <span className="legend-label">Present</span>
                                <span className="legend-val">94%</span>
                            </div>
                            <div className="legend-item">
                                <span className="legend-dot" style={{ backgroundColor: '#ef4444'}}></span>
                                <span className="legend-label">Absent</span>
                                <span className="legend-val">4%</span>
                            </div>
                            <div className="legend-item">
                                <span className="legend-dot" style={{ backgroundColor: '#cbd5e1'}}></span>
                                <span className="legend-label">Leave</span>
                                <span className="legend-val">2%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Remarks List */}
                <div className="dash-panel panel-remarks">
                    <div className="panel-header-split">
                        <h3 className="panel-title">Recent Remarks</h3>
                        <a href="#" className="link-view-all">View All</a>
                    </div>
                    <div className="remark-list">
                        <div className="remark-item">
                            <div className="remark-avatar">
                                <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Rahul" />
                            </div>
                            <div className="remark-content">
                                <h4>Rahul Kumar</h4>
                                <p>Excellent improvement in Mathematics</p>
                                <span className="remark-meta">By: Class Teacher • 2 hours ago</span>
                            </div>
                        </div>
                        <div className="remark-item">
                            <div className="remark-avatar">
                                <img src="https://randomuser.me/api/portraits/women/68.jpg" alt="Priya" />
                            </div>
                            <div className="remark-content">
                                <h4>Priya Sharma</h4>
                                <p>Good performance in Science</p>
                                <span className="remark-meta">By: Class Teacher • 5 hours ago</span>
                            </div>
                        </div>
                        <div className="remark-item">
                            <div className="remark-avatar">
                                <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Aarav" />
                            </div>
                            <div className="remark-content">
                                <h4>Aarav Mehta</h4>
                                <p>Needs to focus more on Social Studies</p>
                                <span className="remark-meta">By: Class Teacher • 1 day ago</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="bottom-row">
                <div className="dash-panel panel-exams">
                    <div className="panel-header-split">
                        <h3 className="panel-title">Upcoming Examinations</h3>
                        <a href="#" className="link-view-all">View All</a>
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
                            <tr>
                                <td className="fw-500 text-blue">Unit Test - 1</td>
                                <td>Class 10-A</td>
                                <td>24 May 2024</td>
                            </tr>
                            <tr>
                                <td className="fw-500 text-blue">Mid Term Exam</td>
                                <td>Class 9-B</td>
                                <td>10 Jun 2024</td>
                            </tr>
                            <tr>
                                <td className="fw-500 text-blue">Quarterly Exam</td>
                                <td>Class 8-A</td>
                                <td>22 Jun 2024</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="dash-panel panel-students-class">
                    <div className="panel-header-split">
                        <h3 className="panel-title">Students by Class</h3>
                        <button className="btn-outline">This Month <span>&#9662;</span></button>
                    </div>
                    <div className="chart-container" style={{ width: '100%', height: 250, marginTop: '20px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={classData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} cursor={{ fill: '#f8fafc' }} />
                                <Bar dataKey="students" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
