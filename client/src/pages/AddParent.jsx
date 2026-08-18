import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import './AddStudent.css'; // Reusing form styles

const AddParent = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        relationship: 'Parent',
        studentIds: []
    });
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await api.get('/students');
                setStudents(res.data.data);
            } catch (err) {
                console.error("Failed to fetch students", err);
            }
        };
        fetchStudents();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleStudentSelect = (e) => {
        const options = e.target.options;
        const selectedValues = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selectedValues.push(options[i].value);
            }
        }
        setFormData({ ...formData, studentIds: selectedValues });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            await api.post('/parents', formData);
            navigate('/admin/parents');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to add parent.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-student-page">
            <div className="page-header-row">
                <div className="page-header-left">
                    <h1 className="page-title">Add Parent</h1>
                    <div className="breadcrumbs">
                        <Link to="/admin/dashboard" className="crumb-link">Dashboard</Link>
                        <span className="crumb-separator">&gt;</span>
                        <Link to="/admin/parents" className="crumb-link">Parents</Link>
                        <span className="crumb-separator">&gt;</span>
                        <span className="current-crumb">Add Parent</span>
                    </div>
                </div>
            </div>

            <form className="form-container" onSubmit={handleSubmit}>
                <div className="form-left-col" style={{ flex: '1 1 100%' }}>
                    <div className="form-section">
                        <h3 className="form-section-title">Parent Information</h3>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>Default login password will be 'parent123'</p>
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
                                <label>Phone Number</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
                            </div>
                            <div className="form-group full-width">
                                <label>Address</label>
                                <textarea name="address" value={formData.address} onChange={handleChange} rows="3"></textarea>
                            </div>
                            <div className="form-group">
                                <label>Relationship to Children</label>
                                <select name="relationship" value={formData.relationship} onChange={handleChange} className="form-select">
                                    <option value="Parent">Parent</option>
                                    <option value="Father">Father</option>
                                    <option value="Mother">Mother</option>
                                    <option value="Guardian">Guardian</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="form-group full-width">
                                <label>Link Children (Hold Ctrl/Cmd to select multiple)</label>
                                <select 
                                    multiple 
                                    name="studentIds"
                                    value={formData.studentIds} 
                                    onChange={handleStudentSelect} 
                                    style={{ height: '150px', padding: '8px' }}
                                    className="form-select"
                                >
                                    {students.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.first_name} {s.last_name} ({s.admission_number}) - Class: {s.class_name || 'N/A'}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div className="form-actions" style={{ justifyContent: 'flex-start', marginTop: '24px' }}>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Parent'}
                        </button>
                        <button type="button" className="btn-secondary" onClick={() => navigate('/admin/parents')}>
                            Cancel
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddParent;
