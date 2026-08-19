import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import './css/AddStudent.css'; // Reusing form styles

const EditExam = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        exam_name: '',
        exam_type: 'Regular',
        academic_year_id: '1', 
        class_id: '',
        start_date: '',
        end_date: '',
        status: 'UPCOMING'
    });
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [examRes, classesRes] = await Promise.all([
                    api.get(`/exams/${id}`),
                    api.get('/classes')
                ]);

                if (classesRes.data.success) {
                    setClasses(classesRes.data.data);
                }

                if (examRes.data.success) {
                    const exam = examRes.data.data;
                    setFormData({
                        exam_name: exam.exam_name || '',
                        exam_type: exam.exam_type || 'Regular',
                        academic_year_id: exam.academic_year_id || '1',
                        class_id: exam.class_id || '',
                        start_date: exam.start_date ? exam.start_date.split('T')[0] : '',
                        end_date: exam.end_date ? exam.end_date.split('T')[0] : '',
                        status: exam.status || 'UPCOMING'
                    });
                }
            } catch (error) {
                console.error('Error fetching data', error);
                setError('Failed to load exam data.');
            } finally {
                setFetching(false);
            }
        };
        fetchData();
    }, [id]);

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
            await api.put(`/exams/${id}`, formData);
            navigate('/admin/exams');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to update exam. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="add-student-page">
                <div className="page-header-row">
                    <h1 className="page-title">Edit Examination</h1>
                </div>
                <div className="form-container" style={{ padding: '2rem', textAlign: 'center' }}>
                    <p>Loading exam data...</p>
                </div>
            </div>
        );
    }

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
                    <h1 className="page-title">Edit Examination</h1>
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
                            {loading ? 'Saving...' : 'Update Exam'}
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

export default EditExam;
