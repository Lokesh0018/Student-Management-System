import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import './css/AddStudent.css'; // Reusing form styles

const AddTeacher = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        gender: '',
        phone: '',
        department: '',
        qualification: '',
        employee_id: '',
        joining_date: '',
        description: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            await api.post('/teachers', formData);
            navigate('/admin/teachers');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to add teacher. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-student-page">
            <div className="page-header-row">
                <div className="page-header-left">
                    <h1 className="page-title">Add Teacher</h1>
                    </div>
            </div>

            <form className="form-container" onSubmit={handleSubmit}>
                <div className="form-left-col" style={{ flex: '1 1 100%' }}>
                    <div className="form-section">
                        <h3 className="form-section-title">Teacher Information</h3>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>Leave password blank to use default 'teacher123'</p>
                        {error && <div style={{ color: '#be123c', marginBottom: '10px' }}>{error}</div>}
                        
                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label>Full Name <span className="req">*</span></label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Email Address <span className="req">*</span></label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Login Password</label>
                                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Default: teacher123" />
                            </div>
                            <div className="form-group">
                                <label>Gender <span className="req">*</span></label>
                                <select name="gender" value={formData.gender} onChange={handleChange} className="form-control" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} required>
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Phone Number <span className="req">*</span></label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Employee ID <span className="req">*</span></label>
                                <input type="text" name="employee_id" value={formData.employee_id} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Department <span className="req">*</span></label>
                                <input type="text" name="department" value={formData.department} onChange={handleChange} placeholder="e.g. Mathematics" required />
                            </div>
                            <div className="form-group">
                                <label>Qualification <span className="req">*</span></label>
                                <input type="text" name="qualification" value={formData.qualification} onChange={handleChange} placeholder="e.g. M.Sc. Math" required />
                            </div>
                            <div className="form-group">
                                <label>Joining Date <span className="req">*</span></label>
                                <input type="date" name="joining_date" value={formData.joining_date} onChange={handleChange} required />
                            </div>
                            <div className="form-group full-width">
                                <label>About Teacher</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows="4" placeholder="Brief description about the teacher..."></textarea>
                            </div>
                        </div>
                    </div>
                    
                    <div className="form-actions" style={{ justifyContent: 'flex-start', marginTop: '24px' }}>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Teacher'}
                        </button>
                        <button type="button" className="btn-secondary" onClick={() => navigate('/admin/teachers')}>
                            Cancel
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddTeacher;
