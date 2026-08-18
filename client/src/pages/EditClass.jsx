import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import './css/AddStudent.css';

const EditClass = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        class_name: '',
        section: '',
        teacher_id: ''
    });
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch class details and teachers in parallel
                const [classRes, teachersRes] = await Promise.all([
                    api.get(`/classes/${id}`),
                    api.get('/teachers')
                ]);

                setTeachers(teachersRes.data.data);
                
                if (classRes.data.success) {
                    const cls = classRes.data.data;
                    setFormData({
                        class_name: cls.class_name,
                        section: cls.section,
                        teacher_id: cls.teacher_id || ''
                    });
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load class data.');
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
        setLoading(true);
        setError('');
        
        try {
            await api.put(`/classes/${id}`, formData);
            navigate('/admin/classes');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to update class. Class and section combination might already exist.');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="add-student-page">
                <div className="page-header-row">
                    <h1 className="page-title">Edit Class</h1>
                </div>
                <div className="form-container" style={{ padding: '2rem', textAlign: 'center' }}>
                    <p>Loading class data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="add-student-page">
            <div className="page-header-row">
                <div className="page-header-left">
                    <h1 className="page-title">Edit Class</h1>
                    <div className="breadcrumbs">
                        <Link to="/admin/dashboard" className="crumb-link">Dashboard</Link>
                        <span className="crumb-separator">&gt;</span>
                        <Link to="/admin/classes" className="crumb-link">Classes</Link>
                        <span className="crumb-separator">&gt;</span>
                        <span className="current-crumb">Edit Class</span>
                    </div>
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
                            {loading ? 'Saving...' : 'Update Class'}
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

export default EditClass;
