import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import api from '../utils/api';
import { useBreadcrumb } from '../context/BreadcrumbContext';
import './css/AddStudent.css'; // Reusing form styles

const EditTeacher = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setDynamicCrumb } = useBreadcrumb();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
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

    useEffect(() => {
        const fetchTeacher = async () => {
            try {
                const res = await api.get(`/teachers/${id}`);
                if (res.data.success) {
                    const t = res.data.data;
                    setDynamicCrumb(id, t.name);
                    setFormData({
                        name: t.name || '',
                        email: t.email || '',
                        phone: t.phone || '',
                        department: t.department || '',
                        qualification: t.qualification || '',
                        employee_id: t.employee_id || '',
                        joining_date: t.joining_date ? t.joining_date.split('T')[0] : '',
                        description: t.description || '',
                        password: ''
                    });
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch teacher details.');
            }
        };
        fetchTeacher();
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            await api.put(`/teachers/${id}`, formData);
            navigate('/admin/teachers');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to update teacher.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-student-page">
            <div className="page-header-row">
                <div className="page-header-left">
                    <h1 className="page-title">Edit Teacher</h1>
                    </div>
            </div>

            <form className="form-container" onSubmit={handleSubmit}>
                <div className="form-left-col" style={{ flex: '1 1 100%' }}>
                    <div className="form-section">
                        <h3 className="form-section-title">Teacher Information</h3>
                        {error && <div style={{ color: '#be123c', marginBottom: '10px' }}>{error}</div>}
                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>Leave password blank unless you want to reset it.</p>
                        
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
                                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Reset password..." />
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Employee ID</label>
                                <input type="text" name="employee_id" value={formData.employee_id} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Department</label>
                                <input type="text" name="department" value={formData.department} onChange={handleChange} placeholder="e.g. Mathematics" />
                            </div>
                            <div className="form-group">
                                <label>Qualification</label>
                                <input type="text" name="qualification" value={formData.qualification} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Joining Date</label>
                                <input type="date" name="joining_date" value={formData.joining_date} onChange={handleChange} />
                            </div>
                            <div className="form-group full-width">
                                <label>About Teacher</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows="4"></textarea>
                            </div>
                        </div>
                    </div>
                    
                    <div className="form-actions" style={{ justifyContent: 'flex-start', marginTop: '24px' }}>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Teacher'}
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

export default EditTeacher;
