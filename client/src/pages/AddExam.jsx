import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import './AddStudent.css'; // Reusing form styles

const AddExam = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        exam_name: '',
        exam_type: 'Regular',
        academic_year_id: '1', // Defaulting to 1 as there's no academic year table UI yet
        class_id: '',
        start_date: '',
        end_date: ''
    });
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const res = await api.get('/classes');
                if (res.data.success) {
                    setClasses(res.data.data);
                }
            } catch (error) {
                console.error('Error fetching classes', error);
            }
        };
        fetchClasses();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (new Date(formData.end_date) < new Date(formData.start_date)) {
            setError('End Date cannot be before Start Date');
            return;
        }

        setLoading(true);
        setError('');
        
        try {
            await api.post('/exams', formData);
            navigate('/admin/exams');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to add exam. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    let computedStatus = 'UPCOMING';
    let computedStatusLabel = 'Upcoming (Auto-calculated)';
    
    if (formData.start_date && formData.end_date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const start = new Date(formData.start_date);
        const end = new Date(formData.end_date);
        
        if (today < start) {
            computedStatus = 'UPCOMING';
            computedStatusLabel = 'Upcoming (Auto-calculated)';
        } else if (today > end) {
            computedStatus = 'COMPLETED';
            computedStatusLabel = 'Completed (Auto-calculated)';
        } else {
            computedStatus = 'ONGOING';
            computedStatusLabel = 'Ongoing (Auto-calculated)';
        }
    }

    return (
        <div className="add-student-page">
            <div className="page-header-row">
                <div className="page-header-left">
                    <h1 className="page-title">Add Examination</h1>
                    <div className="breadcrumbs">
                        <Link to="/admin/dashboard" className="crumb-link">Dashboard</Link>
                        <span className="crumb-separator">&gt;</span>
                        <Link to="/admin/exams" className="crumb-link">Examinations</Link>
                        <span className="crumb-separator">&gt;</span>
                        <span className="current-crumb">Add Exam</span>
                    </div>
                </div>
            </div>

            <form className="form-container" onSubmit={handleSubmit}>
                <div className="form-left-col" style={{ flex: '1 1 100%' }}>
                    <div className="form-section">
                        <h3 className="form-section-title">Exam Information</h3>
                        {error && <div style={{ color: '#be123c', marginBottom: '10px' }}>{error}</div>}
                        
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Exam Name <span className="req">*</span></label>
                                <input type="text" name="exam_name" value={formData.exam_name} onChange={handleChange} required placeholder="e.g. Mid Term Exam" />
                            </div>

                            <div className="form-group">
                                <label>Exam Type</label>
                                <select name="exam_type" value={formData.exam_type} onChange={handleChange} className="form-select">
                                    <option value="Regular">Regular</option>
                                    <option value="Online">Online</option>
                                    <option value="Practical">Practical</option>
                                    <option value="Assignment">Assignment</option>
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label>Class</label>
                                <select name="class_id" value={formData.class_id} onChange={handleChange} className="form-select">
                                    <option value="">All Classes / Common</option>
                                    {classes.map(c => (
                                        <option key={c.id} value={c.id}>{c.class_name} - {c.section}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Status</label>
                                <select name="status" value={computedStatus} disabled className="form-select" style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed', color: '#6b7280' }}>
                                    <option value={computedStatus}>{computedStatusLabel}</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Start Date <span className="req">*</span></label>
                                <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>End Date <span className="req">*</span></label>
                                <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} required />
                            </div>
                        </div>
                    </div>
                    
                    <div className="form-actions" style={{ justifyContent: 'flex-start', marginTop: '24px' }}>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Exam'}
                        </button>
                        <button type="button" className="btn-secondary" onClick={() => navigate('/admin/exams')}>
                            Cancel
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddExam;
