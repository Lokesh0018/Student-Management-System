import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaEnvelope, FaPhone, FaGraduationCap, FaCalendarAlt, FaIdBadge, FaBook, FaEllipsisH } from 'react-icons/fa';
import './StudentProfile.css'; // Reusing for consistency

const TeacherDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    return (
        <div className="student-profile-page">
            <div className="page-header-row">
                <div className="page-header-left">
                    <h1 className="page-title">Teacher Details</h1>
                    <div className="breadcrumbs">
                        <Link to="/admin/dashboard" className="crumb-link">Dashboard</Link>
                        <span className="crumb-separator">&gt;</span>
                        <Link to="/admin/teachers" className="crumb-link">Teachers</Link>
                        <span className="crumb-separator">&gt;</span>
                        <span className="current-crumb">Teacher Details</span>
                    </div>
                </div>
                <div className="action-buttons-group">
                    <button className="btn-primary" onClick={() => navigate(`/admin/teachers/${id}/edit`)}>Edit Teacher</button>
                    <button className="btn-outline">More <span>&#9662;</span></button>
                </div>
            </div>

            <div className="profile-content-split">
                {/* Main Content Area */}
                <div className="profile-main">
                    {/* Top Summary Card */}
                    <div className="profile-card profile-summary-card">
                        <div className="summary-left">
                            <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Rahul Kumar" className="profile-avatar-large" />
                            <div className="profile-identity">
                                <h2>Rahul Kumar</h2>
                                <p>Mathematics Teacher</p>
                                <span className="status-badge status-active" style={{alignSelf: 'flex-start'}}>Active</span>
                            </div>
                        </div>
                        <div className="summary-right">
                            <div className="info-grid-clean">
                                <div className="info-item-clean">
                                    <span className="info-label-clean"><FaEnvelope /> Email</span>
                                    <span className="info-val-clean">rahul.k@email.com</span>
                                </div>
                                <div className="info-item-clean">
                                    <span className="info-label-clean"><FaIdBadge /> Employee ID</span>
                                    <span className="info-val-clean">TID12345</span>
                                </div>
                                <div className="info-item-clean">
                                    <span className="info-label-clean"><FaPhone /> Phone</span>
                                    <span className="info-val-clean">9876543210</span>
                                </div>
                                <div className="info-item-clean">
                                    <span className="info-label-clean"><FaBook /> Department</span>
                                    <span className="info-val-clean">Mathematics</span>
                                </div>
                                <div className="info-item-clean">
                                    <span className="info-label-clean"><FaGraduationCap /> Qualification</span>
                                    <span className="info-val-clean">M.Sc. Mathematics</span>
                                </div>
                                <div className="info-item-clean">
                                    <span className="info-label-clean"><FaCalendarAlt /> Joining Date</span>
                                    <span className="info-val-clean">12 Apr 2009</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="overview-tab-content">
                        <div className="overview-grid">
                            {/* Assigned Classes */}
                            <div className="overview-section">
                                <h3 className="overview-section-title">Assigned Classes</h3>
                                <div className="info-grid-2">
                                    <div className="info-block">
                                        <span>Class 10-A</span>
                                        <strong className="text-blue">32 Students</strong>
                                    </div>
                                    <div className="info-block">
                                        <span>Class 10-B</span>
                                        <strong className="text-blue">45 Students</strong>
                                    </div>
                                </div>
                            </div>

                            {/* Assigned Subjects */}
                            <div className="overview-section">
                                <h3 className="overview-section-title">Assigned Subjects</h3>
                                <div className="info-grid-2">
                                    <div className="info-block full-width">
                                        <span>Mathematics</span>
                                        <strong className="text-blue">4 Classes</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="overview-grid" style={{ marginTop: '24px' }}>
                            {/* About Teacher */}
                            <div className="overview-section" style={{ gridColumn: '1 / -1' }}>
                                <h3 className="overview-section-title">About Teacher</h3>
                                <p style={{ fontSize: '14px', color: '#334155', lineHeight: '1.6', margin: 0 }}>
                                    Rahul Kumar is an experienced Mathematics teacher with over 5 years of teaching experience.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Optional Right Sidebar if needed, keeping it minimal for now */}
            </div>
        </div>
    );
};

export default TeacherDetails;
