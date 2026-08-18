import React, { useState, useEffect } from 'react';

import api from '../utils/api';
import './css/Management.css'; // Reusing for general styles

const PerformanceAnalytics = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/performance/stats');
                setStats(res.data.data);
            } catch (error) {
                console.error("Error fetching performance stats", error);
            }
        };
        fetchStats();
    }, []);

    if (!stats) return <div className="page-container"><div className="dashboard-container">Loading...</div></div>;

    const renderBar = (percentage) => (
        <div style={{width: '100%', backgroundColor: '#E2E8F0', borderRadius: '9999px', height: '12px', marginTop: '0.5rem'}}>
            <div style={{
                width: `${percentage}%`,
                backgroundColor: percentage >= 75 ? '#10B981' : (percentage >= 50 ? '#F59E0B' : '#EF4444'),
                height: '100%',
                borderRadius: '9999px'
            }}></div>
        </div>
    );

    return (
        <div className="page-container">
            <div className="dashboard-container">
                <header className="dashboard-header" style={{marginBottom: '2rem'}}>
                    <h1>Performance Analytics</h1>
                    <p>Track academic performance across classes and subjects.</p>
                </header>

                <div className="stats-grid" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem'}}>
                    
                    <div className="list-panel">
                        <h3>Class Averages</h3>
                        {stats.classAverages.map((c, idx) => (
                            <div key={idx} style={{marginBottom: '1rem'}}>
                                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                    <span>{c.class_name}-{c.section}</span>
                                    <strong>{Number(c.avg_percentage).toFixed(1)}%</strong>
                                </div>
                                {renderBar(Number(c.avg_percentage))}
                            </div>
                        ))}
                        {stats.classAverages.length === 0 && <p className="empty-state">No data</p>}
                    </div>

                    <div className="list-panel">
                        <h3>Subject Averages</h3>
                        {stats.subjectAverages.map((s, idx) => (
                            <div key={idx} style={{marginBottom: '1rem'}}>
                                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                    <span>{s.subject_name}</span>
                                    <strong>{Number(s.avg_percentage).toFixed(1)}%</strong>
                                </div>
                                {renderBar(Number(s.avg_percentage))}
                            </div>
                        ))}
                        {stats.subjectAverages.length === 0 && <p className="empty-state">No data</p>}
                    </div>
                </div>

                <div className="list-panel" style={{marginTop: '2rem'}}>
                    <h3>Top Performing Students</h3>
                    <div className="table-responsive">
                        <table className="crud-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Name</th>
                                    <th>Average Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.topStudents.map((s, idx) => (
                                    <tr key={idx}>
                                        <td>#{idx + 1}</td>
                                        <td>{s.first_name} {s.last_name}</td>
                                        <td>
                                            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                                                <strong>{Number(s.avg_percentage).toFixed(1)}%</strong>
                                                <div style={{width: '200px'}}>{renderBar(Number(s.avg_percentage))}</div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {stats.topStudents.length === 0 && <p className="empty-state">No data</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerformanceAnalytics;
