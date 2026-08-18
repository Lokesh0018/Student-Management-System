import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import './css/Management.css';

const SubjectManagement = () => {
    const [subjects, setSubjects] = useState([]);
    const [formData, setFormData] = useState({ subject_name: '', subject_code: '' });
    const [editingId, setEditingId] = useState(null);

    const fetchSubjects = async () => {
        try {
            const res = await api.get('/subjects');
            setSubjects(res.data.data);
        } catch (error) {
            console.error('Error fetching subjects', error);
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/subjects/${editingId}`, formData);
            } else {
                await api.post('/subjects', formData);
            }
            setFormData({ subject_name: '', subject_code: '' });
            setEditingId(null);
            fetchSubjects();
        } catch (error) {
            console.error('Error saving subject', error);
            alert('Failed to save subject. Code might already exist.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this subject?')) {
            try {
                await api.delete(`/subjects/${id}`);
                fetchSubjects();
            } catch (error) {
                console.error('Error deleting subject', error);
            }
        }
    };

    const handleEdit = (subj) => {
        setFormData({ subject_name: subj.subject_name, subject_code: subj.subject_code });
        setEditingId(subj.id);
    };

    return (
        <Layout>
            <div className="management-container">
                <div className="form-panel">
                    <h3>{editingId ? 'Edit Subject' : 'Add New Subject'}</h3>
                    <form onSubmit={handleSubmit} className="crud-form">
                        <div className="form-group">
                            <label>Subject Name</label>
                            <input 
                                type="text" 
                                value={formData.subject_name} 
                                onChange={(e) => setFormData({...formData, subject_name: e.target.value})} 
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label>Subject Code</label>
                            <input 
                                type="text" 
                                value={formData.subject_code} 
                                onChange={(e) => setFormData({...formData, subject_code: e.target.value})} 
                                required 
                            />
                        </div>
                        <div className="form-actions-inline">
                            <button type="submit" className="btn-primary">
                                {editingId ? 'Update' : 'Create'}
                            </button>
                            {editingId && (
                                <button type="button" className="btn-secondary" onClick={() => { setEditingId(null); setFormData({ subject_name: '', subject_code: ''}); }}>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>
                
                <div className="list-panel">
                    <h3>Subject List</h3>
                    <div className="table-responsive">
                        <table className="crud-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Subject Name</th>
                                    <th>Code</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subjects.map(subj => (
                                    <tr key={subj.id}>
                                        <td>{subj.id}</td>
                                        <td>{subj.subject_name}</td>
                                        <td>{subj.subject_code}</td>
                                        <td>
                                            <button className="btn-action edit" onClick={() => handleEdit(subj)}>Edit</button>
                                            <button className="btn-action delete" onClick={() => handleDelete(subj.id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {subjects.length === 0 && <p className="empty-state">No subjects found.</p>}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default SubjectManagement;
