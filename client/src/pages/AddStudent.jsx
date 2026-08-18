import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaCloudUploadAlt } from 'react-icons/fa';
import api from '../utils/api';
import { getDirectImageUrl } from '../utils/imageUtils';
import './css/AddStudent.css';

const AddStudent = () => {
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
        status: 'ACTIVE',
        photo: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [classes, setClasses] = useState([]);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const res = await api.get('/classes');
                if (res.data.success) {
                    setClasses(res.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch classes", err);
            }
        };
        fetchClasses();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            await api.post('/students', formData);
            navigate('/admin/students');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to add student. Please try again.');
        } finally {
            setLoading(false);
        }
    };

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
                                    {classes.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.class_name} - {c.section}
                                        </option>
                                    ))}
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
                        <h3 className="form-section-title">Student Photo URL</h3>
                        <div className="form-group full-width">
                            <label>Image Link</label>
                            <input 
                                type="url" 
                                name="photo" 
                                value={formData.photo} 
                                onChange={handleChange} 
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>
                        {formData.photo && (
                            <div className="upload-box" style={{ marginTop: '16px', padding: 0, overflow: 'hidden', border: 'none' }}>
                                <img 
                                    src={getDirectImageUrl(formData.photo)} 
                                    alt="Preview" 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} 
                                    onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = "/default-avatar.png";
                                    }} 
                                />
                            </div>
                        )}
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={() => navigate('/admin/students')}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Student'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddStudent;
