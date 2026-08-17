import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import './Management.css';

const ClassManagement = () => {
    const [classes, setClasses] = useState([]);
    const [formData, setFormData] = useState({ class_name: '', section: '' });
    const [editingId, setEditingId] = useState(null);

    const fetchClasses = async () => {
        try {
            const res = await api.get('/classes');
            setClasses(res.data.data);
        } catch (error) {
            console.error('Error fetching classes', error);
        }
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/classes/${editingId}`, formData);
            } else {
                await api.post('/classes', formData);
            }
            setFormData({ class_name: '', section: '' });
            setEditingId(null);
            fetchClasses();
        } catch (error) {
            console.error('Error saving class', error);
            alert('Failed to save class. Class and section combination might already exist.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this class?')) {
            try {
                await api.delete(`/classes/${id}`);
                fetchClasses();
            } catch (error) {
                console.error('Error deleting class', error);
            }
        }
    };

    const handleEdit = (cls) => {
        setFormData({ class_name: cls.class_name, section: cls.section });
        setEditingId(cls.id);
    };

    return (
        <Layout>
            <div className="management-container">
                <div className="form-panel">
                    <h3>{editingId ? 'Edit Class' : 'Add New Class'}</h3>
                    <form onSubmit={handleSubmit} className="crud-form">
                        <div className="form-group">
                            <label>Class Name (e.g. 10)</label>
                            <input 
                                type="text" 
                                value={formData.class_name} 
                                onChange={(e) => setFormData({...formData, class_name: e.target.value})} 
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label>Section (e.g. A)</label>
                            <input 
                                type="text" 
                                value={formData.section} 
                                onChange={(e) => setFormData({...formData, section: e.target.value})} 
                                required 
                            />
                        </div>
                        <div className="form-actions-inline">
                            <button type="submit" className="btn-primary">
                                {editingId ? 'Update' : 'Create'}
                            </button>
                            {editingId && (
                                <button type="button" className="btn-secondary" onClick={() => { setEditingId(null); setFormData({ class_name: '', section: ''}); }}>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>
                
                <div className="list-panel">
                    <h3>Class List</h3>
                    <div className="table-responsive">
                        <table className="crud-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Class Name</th>
                                    <th>Section</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {classes.map(cls => (
                                    <tr key={cls.id}>
                                        <td>{cls.id}</td>
                                        <td>{cls.class_name}</td>
                                        <td>{cls.section}</td>
                                        <td>
                                            <button className="btn-action edit" onClick={() => handleEdit(cls)}>Edit</button>
                                            <button className="btn-action delete" onClick={() => handleDelete(cls.id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {classes.length === 0 && <p className="empty-state">No classes found.</p>}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ClassManagement;
