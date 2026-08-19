import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FaChartBar, FaTrophy, FaArrowUp, FaArrowDown, FaMedal, FaExclamationTriangle } from 'react-icons/fa';
import api from '../utils/api';
import './css/StudentList.css'; 

const PerformanceAnalytics = () => {
    
    const [data, setData] = useState({
        overview: { average: 0, highest: 0, lowest: 0, passPercentage: 0 },
        subjectAverages: [],
        distribution: [],
        topStudents: [],
        bottomStudents: []
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/performance/stats');
                if (res.data.success && res.data.data) {
                    setData(res.data.data);
                }
            } catch (error) {
                console.error("Error fetching performance stats:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    const { overview, subjectAverages, distribution, topStudents, bottomStudents } = data;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };
    
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    if (isLoading) {
        return <div className="student-list-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div className="loader" style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        </div>;
    }

    return (
        <motion.div className="student-list-page" style={{ paddingBottom: '40px', padding: '0 40px' }} initial="hidden" animate="visible" variants={containerVariants}>
            <style>{`
                .perf-grid-stats { display: grid; gap: 24px; grid-template-columns: repeat(4, 1fr); margin-bottom: 24px; }
                .perf-grid-charts { display: grid; gap: 24px; grid-template-columns: 1.4fr 1fr; margin-bottom: 24px; }
                .perf-grid-lists { display: grid; gap: 24px; grid-template-columns: 1fr 1fr; }
                .sticky-header { position: sticky; top: 0; z-index: 10; background: var(--bg); padding: 16px 0 12px 0; margin-top: -16px; margin-bottom: 16px; border-bottom: 1px solid var(--border); }
                .perf-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; box-shadow: var(--shadow-1, 0 4px 10px rgba(0,0,0,0.02)); padding: 24px; }
                .legend-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; border-radius: 8px; margin-bottom: 8px; }
                @media (max-width: 1280px) {
                    .perf-grid-stats { grid-template-columns: repeat(2, 1fr); }
                }
                @media (max-width: 1024px) {
                    .perf-grid-charts, .perf-grid-lists { grid-template-columns: 1fr; }
                }
                @media (max-width: 640px) {
                    .perf-grid-stats { grid-template-columns: 1fr; }
                    .student-list-page { padding: 0 20px !important; }
                }
            `}</style>
            
            <motion.div className="page-header-row sticky-header" variants={itemVariants}>
                <div className="page-header-left">
                    <h1 className="page-title" style={{ fontSize: '24px', color: 'var(--text-primary)', fontWeight: '800', letterSpacing: '-0.5px' }}>Performance Overview</h1>
                    <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '14px' }}>Analytics & insights based on latest marks</p>
                </div>
            </motion.div>

            {/* Top Stats Cards: 2x2 Grid */}
            <motion.div className="perf-grid-stats" variants={containerVariants}>
                
                <motion.div variants={itemVariants} className="perf-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', transition: 'transform 0.2s', cursor: 'pointer', minHeight: '120px' }} whileHover={{ y: -3 }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px', flexShrink: 0 }}>
                        <FaChartBar />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Average Score</span>
                        <span style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: '1.2' }}>{overview?.average}%</span>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="perf-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', transition: 'transform 0.2s', cursor: 'pointer', minHeight: '120px' }} whileHover={{ y: -3 }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px', flexShrink: 0 }}>
                        <FaTrophy />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pass Percentage</span>
                        <span style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: '1.2' }}>{overview?.passPercentage}%</span>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="perf-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', transition: 'transform 0.2s', cursor: 'pointer', minHeight: '120px' }} whileHover={{ y: -3 }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px', flexShrink: 0 }}>
                        <FaArrowUp />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Highest Score</span>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            <span style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: '1.2' }}>{overview?.highest}%</span>
                        </div>
                        {overview?.highestStudent && (
                            <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>· {overview.highestStudent}</span>
                        )}
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="perf-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', transition: 'transform 0.2s', cursor: 'pointer', minHeight: '120px' }} whileHover={{ y: -3 }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px', flexShrink: 0 }}>
                        <FaArrowDown />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Lowest Score</span>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            <span style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: '1.2' }}>{overview?.lowest}%</span>
                        </div>
                        {overview?.lowestStudent && (
                            <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>· {overview.lowestStudent}</span>
                        )}
                    </div>
                </motion.div>

            </motion.div>

            {/* Middle Row: Charts 60/40 */}
            <motion.div className="perf-grid-charts" variants={containerVariants}>
                {/* Subject Wise Average */}
                <motion.div variants={itemVariants} className="perf-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary)', fontWeight: '700' }}>Subject Averages</h3>
                    </div>
                    <div style={{ width: '100%', height: '420px', overflow: 'visible' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={subjectAverages} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                <XAxis dataKey="name" tick={{fontSize: 12, fill: 'var(--text-secondary)', fontWeight: 500}} axisLine={false} tickLine={false} />
                                <YAxis type="number" domain={[0, 100]} tick={{fontSize: 12, fill: 'var(--text-secondary)', fontWeight: 500}} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{fill: 'var(--bg)'}} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-1)', fontSize: '12px', background: 'var(--surface)', color: 'var(--text-primary)' }} formatter={(value) => [value, 'Score']} />
                                <Bar dataKey="avg" radius={[4, 4, 0, 0]} maxBarSize={48}>
                                    {subjectAverages.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'][index % 7]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Performance Distribution */}
                <motion.div variants={itemVariants} className="perf-card" style={{ padding: '24px' }}>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: 'var(--text-primary)', fontWeight: '700' }}>Grade Distribution</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', height: 'auto', gap: '20px' }}>
                        <div style={{ width: '100%', height: '200px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={distribution}
                                        innerRadius={65}
                                        outerRadius={90}
                                        paddingAngle={4}
                                        dataKey="value"
                                        stroke="var(--surface)"
                                        strokeWidth={2}
                                        cornerRadius={4}
                                    >
                                        {distribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-1)', fontSize: '12px', background: 'var(--surface)', color: 'var(--text-primary)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {distribution.map((item, idx) => (
                                <div key={idx} className="legend-item" style={{ background: 'var(--bg)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color }}></div>
                                        <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '500' }}>{item.name}</span>
                                    </div>
                                    <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: '700' }}>{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Bottom Row: Lists 50/50 */}
            <motion.div className="perf-grid-lists" variants={containerVariants}>
                <motion.div variants={itemVariants} className="perf-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                            <FaMedal />
                        </div>
                        <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary)', fontWeight: '700' }}>Top Performers</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {topStudents.map((student, idx) => (
                            <motion.div key={idx} whileHover={{ scale: 1.01 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: '8px', transition: 'all 0.2s', background: 'var(--surface)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: idx === 0 ? 'linear-gradient(135deg, #fbbf24, #d97706)' : idx === 1 ? 'linear-gradient(135deg, #9ca3af, #6b7280)' : idx === 2 ? 'linear-gradient(135deg, #d97706, #92400e)' : '#eff6ff', color: idx < 3 ? 'white' : '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700' }}>
                                        #{student.rank}
                                    </div>
                                    <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{student.name}</span>
                                </div>
                                <span style={{ fontSize: '15px', fontWeight: '800', color: '#10b981', textAlign: 'right' }}>{student.score}</span>
                            </motion.div>
                        ))}
                        {topStudents.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '16px 0', fontSize: '13px' }}>No top performers data available yet.</div>}
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="perf-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                                <FaExclamationTriangle />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary)', fontWeight: '700' }}>Needs Attention</h3>
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '4px 10px', borderRadius: '6px' }}>Below 75%</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {bottomStudents.map((student, idx) => (
                            <motion.div key={idx} whileHover={{ scale: 1.01 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', transition: 'all 0.2s', background: 'var(--surface)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
                                    <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{student.name}</span>
                                </div>
                                <span style={{ fontSize: '15px', fontWeight: '800', color: '#ef4444', textAlign: 'right' }}>{student.score}</span>
                            </motion.div>
                        ))}
                        {bottomStudents.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '32px 0', fontSize: '14px', fontWeight: '500' }}>No additional students need attention 🎉</div>}
                    </div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default PerformanceAnalytics;
