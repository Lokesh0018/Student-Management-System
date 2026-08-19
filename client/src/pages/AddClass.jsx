import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import './css/AddStudent.css'; // Reusing form styles

const AddClass = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        class_name: '',
        section: '',
        teacher_id: ''
    });
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const res = await api.get('/teachers');
                setTeachers(res.data.data);
            } catch (error) {
                console.error('Error fetching teachers', error);
            }
        };
        fetchTeachers();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            await api.post('/classes', formData);
            navigate('/admin/classes');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to add class. Class and section combination might already exist.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-student-page">
            <div className="page-header-row">
                <div className="page-header-left">
                    <h1 className="page-title">Add Class</h1>
                    </div>
            </div>

            <form className="form-container" onSubmit={handleSubmit}>
                <div className="form-left-col" style={{ flex: '1 1 100%' }}>
                    <div className="form-section">
                        <h3 className="form-section-title">Class Information</h3>
                        {error && <div style={{ color: '#be123c', marginBottom: '10px' }}>{error}</div>}
                        
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Class Name (e.g. 10) <span className="req">*</span></label>
                                <input type="text" name="class_name" value={formData.class_name} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Section (e.g. A) <span className="req">*</span></label>
                                <input type="text" name="section" value={formData.section} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Class Teacher</label>
                                <select name="teacher_id" value={formData.teacher_id} onChange={handleChange} className="form-select">
                                    <option value="">None</option>
                                    {teachers.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div className="form-actions" style={{ justifyContent: 'flex-start', marginTop: '24px' }}>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Class'}
                        </button>
                        <button type="button" className="btn-secondary" onClick={() => navigate('/admin/classes')}>
                            Cancel
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddClass;
