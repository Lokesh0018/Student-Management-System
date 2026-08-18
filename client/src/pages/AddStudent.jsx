import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaCloudUploadAlt } from 'react-icons/fa';
import './AddStudent.css';

const AddStudent = () => {
    const navigate = useNavigate();

    return (
        <div className="add-student-page">
            <div className="page-header-row">
                <div className="page-header-left">
                    <h1 className="page-title">Add Student</h1>
                    <div className="breadcrumbs">
                        <Link to="/admin/dashboard" className="crumb-link">Dashboard</Link>
                        <span className="crumb-separator">&gt;</span>
                        <Link to="/admin/students" className="crumb-link">Students</Link>
                        <span className="crumb-separator">&gt;</span>
                        <span className="current-crumb">Add Student</span>
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
                                <input type="text" placeholder="Enter first name" />
                            </div>
                            <div className="form-group">
                                <label>Last Name <span className="req">*</span></label>
                                <input type="text" placeholder="Enter last name" />
                            </div>
                            <div className="form-group">
                                <label>Date of Birth <span className="req">*</span></label>
                                <input type="date" />
                            </div>
                            <div className="form-group">
                                <label>Gender <span className="req">*</span></label>
                                <select>
                                    <option value="">Select gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" placeholder="Enter email" />
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input type="tel" placeholder="Enter phone number" />
                            </div>
                            <div className="form-group full-width">
                                <label>Address</label>
                                <textarea placeholder="Enter address" rows="2"></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Academic Information */}
                    <div className="form-section">
                        <h3 className="form-section-title">Academic Information</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Class <span className="req">*</span></label>
                                <select>
                                    <option value="">Select class</option>
                                    <option value="10">Class 10</option>
                                    <option value="9">Class 9</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Section <span className="req">*</span></label>
                                <select>
                                    <option value="">Select section</option>
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Roll Number <span className="req">*</span></label>
                                <input type="text" placeholder="Enter roll number" />
                            </div>
                            <div className="form-group">
                                <label>Admission Number <span className="req">*</span></label>
                                <input type="text" placeholder="Enter admission number" />
                            </div>
                            <div className="form-group">
                                <label>Admission Date <span className="req">*</span></label>
                                <input type="date" />
                            </div>
                            <div className="form-group">
                                <label>Status <span className="req">*</span></label>
                                <select>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="form-right-col">
                    <div className="form-section photo-upload-section">
                        <h3 className="form-section-title">Student Photo</h3>
                        <div className="upload-box">
                            <FaCloudUploadAlt className="upload-icon" />
                            <p>Click to upload photo</p>
                            <span>JPG, PNG up to 2MB</span>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button className="btn-secondary" onClick={() => navigate('/admin/students')}>Cancel</button>
                        <button className="btn-primary">Save Student</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddStudent;
