import React, { useState } from 'react';
import { FaEdit, FaDownload, FaEnvelope, FaPhone, FaUserTie, FaTint, FaPrint, FaArrowUp, FaAngleRight, FaChartBar } from 'react-icons/fa';
import './StudentProfile.css';

const StudentManagement = () => {
    const [activeTab, setActiveTab] = useState('Performance');

    const tabs = ['Overview', 'Performance', 'Attendance', 'Remarks', 'Documents'];

    const renderPerformanceTab = () => (
        <div className="profile-content-split">
            {/* Left Column: Results Table */}
            <div className="profile-panel panel-results">
                <div className="panel-header">
                    <h3>Term 1 Results (2023-24)</h3>
                    <button className="btn-icon-text"><FaPrint /> Print</button>
                </div>
                
                <table className="results-table">
                    <thead>
                        <tr>
                            <th>SUBJECT</th>
                            <th className="text-center">MARKS OBTAINED</th>
                            <th className="text-center">MAX MARKS</th>
                            <th className="text-center">GRADE</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Mathematics</td>
                            <td className="text-center fw-700">92</td>
                            <td className="text-center text-secondary">100</td>
                            <td className="text-center"><span className="grade-badge grade-aplus">A+</span></td>
                        </tr>
                        <tr>
                            <td>Science</td>
                            <td className="text-center fw-700">87</td>
                            <td className="text-center text-secondary">100</td>
                            <td className="text-center"><span className="grade-badge grade-a">A</span></td>
                        </tr>
                        <tr>
                            <td>English</td>
                            <td className="text-center fw-700">84</td>
                            <td className="text-center text-secondary">100</td>
                            <td className="text-center"><span className="grade-badge grade-a">A</span></td>
                        </tr>
                        <tr>
                            <td>Social Studies</td>
                            <td className="text-center fw-700">79</td>
                            <td className="text-center text-secondary">100</td>
                            <td className="text-center"><span className="grade-badge grade-bplus">B+</span></td>
                        </tr>
                        <tr>
                            <td>Hindi</td>
                            <td className="text-center fw-700">95</td>
                            <td className="text-center text-secondary">100</td>
                            <td className="text-center"><span className="grade-badge grade-aplus">A+</span></td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td>Total</td>
                            <td className="text-center total-val">437</td>
                            <td className="text-center total-max">500</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Right Column: Performance & Actions */}
            <div className="profile-sidebars">
                
                <div className="profile-panel panel-overall">
                    <h3>Overall Performance</h3>
                    
                    <div className="overall-score-wrap">
                        <span className="overall-score">87.4%</span>
                        <span className="overall-trend"><FaArrowUp /> +2.1%</span>
                    </div>

                    <div className="progress-section">
                        <div className="progress-labels">
                            <span>Class Standing</span>
                            <strong>4th <span className="text-secondary">/ 42</span></strong>
                        </div>
                        <div className="progress-bar-wrap">
                            <div className="progress-fill" style={{ width: '90%' }}></div>
                        </div>
                    </div>

                    <div className="progress-section">
                        <div className="progress-labels">
                            <span>Percentile</span>
                            <strong>91st</strong>
                        </div>
                        <div className="progress-bar-wrap">
                            <div className="progress-fill" style={{ width: '91%' }}></div>
                        </div>
                    </div>
                </div>

                <div className="profile-panel panel-quick-actions">
                    <h3>Quick Actions</h3>
                    
                    <div className="action-list">
                        <button className="action-card">
                            <div className="action-card-icon" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}>
                                <FaEnvelope />
                            </div>
                            <div className="action-card-info">
                                <h4>Email Report to Parents</h4>
                                <p>Send Term 1 results via email</p>
                            </div>
                            <FaAngleRight className="action-card-arrow" />
                        </button>

                        <button className="action-card">
                            <div className="action-card-icon" style={{ backgroundColor: '#f5f3ff', color: '#8b5cf6' }}>
                                <FaChartBar />
                            </div>
                            <div className="action-card-info">
                                <h4>Generate Detailed Analytics</h4>
                                <p>View subject-wise trends</p>
                            </div>
                            <FaAngleRight className="action-card-arrow" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="student-profile-page">
            <div className="breadcrumbs">
                Dashboard &gt; Students &gt; <span className="current-crumb">Rahul Kumar</span>
            </div>

            <div className="page-header-row">
                <h1 className="page-title">Student Profile</h1>
                <div className="header-actions">
                    <button className="btn-outline-dark"><FaEdit /> Edit Profile</button>
                    <button className="btn-primary"><FaDownload /> Export Report</button>
                </div>
            </div>

            <div className="profile-summary-card">
                <div className="summary-left">
                    <div className="summary-avatar">
                        <img src="https://randomuser.me/api/portraits/men/51.jpg" alt="Rahul Kumar" />
                    </div>
                    <div className="summary-basic">
                        <div className="summary-name-row">
                            <h2>Rahul Kumar</h2>
                            <span className="badge-active">ACTIVE</span>
                        </div>
                        <div className="summary-meta-row">
                            <span>🎓 Class 10-A • Roll No. 1023</span>
                        </div>
                        <div className="summary-meta-row">
                            <span>🎂 15 Years, 3 Months</span>
                        </div>
                    </div>
                </div>
                
                <div className="summary-right">
                    <div className="info-grid">
                        <div className="info-item">
                            <FaEnvelope className="info-icon" />
                            <div className="info-data">
                                <span className="info-label">EMAIL</span>
                                <span className="info-val">rahul.kumar@email.com</span>
                            </div>
                        </div>
                        <div className="info-item">
                            <FaUserTie className="info-icon" />
                            <div className="info-data">
                                <span className="info-label">FATHER</span>
                                <span className="info-val">Rajesh Kumar</span>
                            </div>
                        </div>
                        <div className="info-item">
                            <FaPhone className="info-icon" />
                            <div className="info-data">
                                <span className="info-label">PHONE</span>
                                <span className="info-val">+91 9876543210</span>
                            </div>
                        </div>
                        <div className="info-item">
                            <FaTint className="info-icon" />
                            <div className="info-data">
                                <span className="info-label">BLOOD GROUP</span>
                                <span className="info-val">A+</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="profile-tabs">
                {tabs.map(tab => (
                    <button 
                        key={tab}
                        className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="tab-content">
                {activeTab === 'Performance' ? renderPerformanceTab() : (
                    <div className="placeholder-tab">
                        <h3>{activeTab} content coming soon</h3>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentManagement;
