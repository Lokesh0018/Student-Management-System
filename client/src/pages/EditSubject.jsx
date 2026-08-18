import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import './StudentList.css';

const EditSubject = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [teachers, setTeachers] = useState([]);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [formData, setFormData] = useState({
        subject_name: '',
        subject_code: '',
        teacher_id: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const res = await api.get('/teachers');
                if (res.data.success) {
                    setTeachers(res.data.data);
                }
            } catch (error) {
                console.error('Error fetching teachers:', error);
            }
        };
        fetchTeachers();
    }, []);

    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };

    useEffect(() => {
        const fetchSubject = async () => {
            try {
                const res = await api.get(`/subjects/${id}`);
                if (res.data.success) {
                    setFormData({
                        subject_name: res.data.data.subject_name,
                        subject_code: res.data.data.subject_code,
                        teacher_id: res.data.data.teacher_id || ''
                    });
                }
            } catch (error) {
                console.error('Error fetching subject', error);
                showNotification('Failed to load subject details', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchSubject();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/subjects/${id}`, formData);
            showNotification('Subject updated successfully!', 'success');
            setTimeout(() => navigate('/admin/subjects'), 1500);
        } catch (error) {
            console.error('Error updating subject', error);
            showNotification('Failed to update subject', 'error');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="student-list-page">
            <div className="page-header-row">
                <div className="page-header-left">
                    <h1 className="page-title">Edit Subject</h1>
                    <div className="breadcrumbs">
                        <Link to="/admin/dashboard" className="crumb-link">Dashboard</Link>
                        <span className="crumb-separator">&gt;</span>
                        <Link to="/admin/subjects" className="crumb-link">Subjects</Link>
                        <span className="crumb-separator">&gt;</span>
                        <span className="current-crumb">Edit Subject</span>
                    </div>
                </div>
            </div>

            {notification.show && (
                <div style={{
                    padding: '12px 24px', 
                    marginBottom: '16px', 
                    borderRadius: '8px',
                    backgroundColor: notification.type === 'success' ? '#dcfce7' : '#fee2e2',
                    color: notification.type === 'success' ? '#16a34a' : '#dc2626',
                    border: `1px solid ${notification.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                    display: 'flex',
                    alignItems: 'center',
                    fontWeight: '500'
                }}>
                    {notification.message}
                </div>
            )}

            <div className="form-card">
                <form onSubmit={handleSubmit} className="standard-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Subject Name</label>
                            <input 
                                type="text" 
                                required 
                                value={formData.subject_name}
                                onChange={(e) => setFormData({...formData, subject_name: e.target.value})}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Subject Code</label>
                            <input 
                                type="text" 
                                required 
                                value={formData.subject_code}
                                onChange={(e) => setFormData({...formData, subject_code: e.target.value})}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Assigned Teacher</label>
                            <select 
                                value={formData.teacher_id}
                                onChange={(e) => setFormData({...formData, teacher_id: e.target.value})}
                            >
                                <option value="">Select Teacher (Optional)</option>
                                {teachers.map(t => (
                                    <option key={t.id} value={t.id}>
                                        {t.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={() => navigate('/admin/subjects')}>Cancel</button>
                        <button type="submit" className="btn-primary">Update Subject</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditSubject;
