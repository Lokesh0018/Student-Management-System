import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AddStudent.css';

const EditStudent = () => {
    const navigate = useNavigate();

    return (
        <div className="add-student-page">
            <div className="page-header-row">
                <div className="page-header-left">
                    <h1 className="page-title">Edit Student</h1>
                    <div className="breadcrumbs">
                        <Link to="/admin/dashboard" className="crumb-link">Dashboard</Link>
                        <span className="crumb-separator">&gt;</span>
                        <Link to="/admin/students" className="crumb-link">Students</Link>
                        <span className="crumb-separator">&gt;</span>
                        <span className="current-crumb">Edit Student</span>
                    </div>
                </div>
            </div>

            <div className="form-container">
                <div className="form-left-col">
                    {/* Personal Information */}
                    <div className="form-section">
                        <h3 className="form-section-title">Personal Information</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>First Name <span className="req">*</span></label>
                                <input type="text" defaultValue="Rahul" />
                            </div>
                            <div className="form-group">
                                <label>Last Name <span className="req">*</span></label>
                                <input type="text" defaultValue="Kumar" />
                            </div>
                            <div className="form-group">
                                <label>Date of Birth <span className="req">*</span></label>
                                <input type="date" defaultValue="2009-01-15" />
                            </div>
                            <div className="form-group">
                                <label>Gender <span className="req">*</span></label>
                                <select defaultValue="Male">
                                    <option value="">Select gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" defaultValue="" />
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input type="tel" defaultValue="9876543210" />
                            </div>
                            <div className="form-group full-width">
                                <label>Address</label>
                                <textarea defaultValue="123, Green Park, New Delhi" rows="2"></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Academic Information */}
                    <div className="form-section">
                        <h3 className="form-section-title">Academic Information</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Class <span className="req">*</span></label>
                                <select defaultValue="10">
                                    <option value="">Select class</option>
                                    <option value="10">10th</option>
                                    <option value="9">9th</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Section <span className="req">*</span></label>
                                <select defaultValue="A">
                                    <option value="">Select section</option>
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Roll Number <span className="req">*</span></label>
                                <input type="text" defaultValue="1025" />
                            </div>
                            <div className="form-group">
                                <label>Admission Number <span className="req">*</span></label>
                                <input type="text" defaultValue="ADM12345" />
                            </div>
                            <div className="form-group">
                                <label>Admission Date <span className="req">*</span></label>
                                <input type="date" defaultValue="2022-04-10" />
                            </div>
                            <div className="form-group">
                                <label>Status <span className="req">*</span></label>
                                <select defaultValue="Active">
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="form-right-col">
                    <div className="form-section photo-upload-section">
                        <div className="edit-avatar-preview">
                            <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Rahul" className="edit-avatar-img" />
                            <h4>Rahul Kumar</h4>
                            <span className="edit-avatar-sub">Class 10-A | Roll No: 1025</span>
                            <button className="btn-outline" style={{ marginTop: '16px', width: '100%' }}>Change Photo</button>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button className="btn-secondary" onClick={() => navigate('/admin/students')}>Cancel</button>
                        <button className="btn-primary">Update Student</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditStudent;
