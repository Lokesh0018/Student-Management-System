import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { FaCloudUploadAlt } from 'react-icons/fa';
import api from '../utils/api';
import './AddStudent.css';

const EditStudent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        class_id: '',
        roll_number: '',
        admission_number: '',
        dob: '',
        gender: '',
        phone: '',
        address: '',
        admission_date: '',
        status: 'ACTIVE'
    });
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const res = await api.get(`/students/${id}`);
                if (res.data.success) {
                    const s = res.data.data;
                    setFormData({
                        first_name: s.first_name || '',
                        last_name: s.last_name || '',
                        email: s.email || '',
                        class_id: s.class_id || '',
                        roll_number: s.roll_number || '',
                        admission_number: s.admission_number || '',
                        dob: s.dob ? s.dob.split('T')[0] : '',
                        gender: s.gender || '',
                        phone: s.phone || '',
                        address: s.address || '',
                        admission_date: s.admission_date ? s.admission_date.split('T')[0] : '',
                        status: s.status || 'ACTIVE'
                    });
                    if (s.photo) {
                        setPhotoPreview(`http://localhost:5000/api/students/${id}/photo?t=${Date.now()}`);
                    }
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to update student. Please try again.');
                console.error(err);
            }
        };
        fetchStudent();
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePhotoChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPhoto(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });
            if (photo) {
                data.append('photo', photo);
            }

            await api.put(`/students/${id}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            navigate('/admin/students');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to update student');
        } finally {
            setLoading(false);
        }
    };

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

            <form className="form-container" onSubmit={handleSubmit}>
                <div className="form-left-col">
                    {/* Personal Information */}
                    <div className="form-section">
                        <h3 className="form-section-title">Personal Information</h3>
                        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
                        <div className="form-grid">
                            <div className="form-group">
                                <label>First Name <span className="req">*</span></label>
                                <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Last Name <span className="req">*</span></label>
                                <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Date of Birth</label>
                                <input type="date" name="dob" value={formData.dob} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Gender</label>
                                <select name="gender" value={formData.gender} onChange={handleChange}>
                                    <option value="">Select gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
                            </div>
                            <div className="form-group full-width">
                                <label>Address</label>
                                <textarea name="address" value={formData.address} onChange={handleChange} rows="2"></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Academic Information */}
                    <div className="form-section">
                        <h3 className="form-section-title">Academic Information</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Class <span className="req">*</span></label>
                                <select name="class_id" value={formData.class_id} onChange={handleChange} required>
                                    <option value="">Select class</option>
                                    <option value="1">Class 10</option>
                                    <option value="2">Class 9</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Roll Number <span className="req">*</span></label>
                                <input type="text" name="roll_number" value={formData.roll_number} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Admission Number <span className="req">*</span></label>
                                <input type="text" name="admission_number" value={formData.admission_number} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Admission Date</label>
                                <input type="date" name="admission_date" value={formData.admission_date} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Status <span className="req">*</span></label>
                                <select name="status" value={formData.status} onChange={handleChange} required>
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="form-right-col">
                    <div className="form-section photo-upload-section">
                        <h3 className="form-section-title">Student Photo</h3>
                        <div className="upload-box" style={{ position: 'relative' }}>
                            <input 
                                type="file" 
                                accept="image/jpeg, image/png" 
                                onChange={handlePhotoChange} 
                                style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                            />
                            {photoPreview ? (
                                <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                            ) : (
                                <>
                                    <FaCloudUploadAlt className="upload-icon" />
                                    <p>Click to upload photo</p>
                                    <span>JPG, PNG up to 2MB</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={() => navigate('/admin/students')}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Student'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EditStudent;
