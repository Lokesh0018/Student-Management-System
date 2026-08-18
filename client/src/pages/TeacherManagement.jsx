import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import './Management.css';

const TeacherManagement = () => {
    const [teachers, setTeachers] = useState([]);
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', department: ''
    });
    const [editingId, setEditingId] = useState(null);

    const fetchTeachers = async () => {
        try {
            const res = await api.get('/teachers');
            setTeachers(res.data.data);
        } catch (error) {
            console.error('Error fetching teachers', error);
        }
    };

    useEffect(() => {
        fetchTeachers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/teachers/${editingId}`, formData);
            } else {
                await api.post('/teachers', formData);
            }
            setFormData({ name: '', email: '', phone: '', department: '' });
            setEditingId(null);
            fetchTeachers();
        } catch (error) {
            console.error('Error saving teacher', error);
            alert('Failed to save teacher.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this teacher? This will also remove their user account.')) {
            try {
                await api.delete(`/teachers/${id}`);
                fetchTeachers();
            } catch (error) {
                console.error('Error deleting teacher', error);
            }
        }
    };

    const handleEdit = (teacher) => {
        setFormData({
            name: teacher.name || '',
            email: teacher.email || '',
            phone: teacher.phone || '',
            department: teacher.department || ''
        });
        setEditingId(teacher.id);
    };

    return (
        <Layout>
            <div className="management-container">
                <div className="form-panel">
                    <h3>{editingId ? 'Edit Teacher' : 'Add New Teacher'}</h3>
                    <p className="subtitle" style={{fontSize: '0.8rem', marginTop: '-1rem'}}>Default password is 'teacher123'</p>
                    <form onSubmit={handleSubmit} className="crud-form">
                        <div className="form-group">
                            <label>Full Name</label>
                            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                        </div>
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label>Department</label>
                            <input type="text" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
                        </div>
                        <div className="form-actions-inline">
                            <button type="submit" className="btn-primary">{editingId ? 'Update' : 'Create'}</button>
                            {editingId && (
                                <button type="button" className="btn-secondary" onClick={() => { setEditingId(null); setFormData({ name: '', email: '', phone: '', department: '' }); }}>Cancel</button>
                            )}
                        </div>
                    </form>
                </div>
                
                <div className="list-panel">
                    <h3>Teacher List</h3>
                    <div className="table-responsive">
                        <table className="crud-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Department</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teachers.map(t => (
                                    <tr key={t.id}>
                                        <td>{t.name}</td>
                                        <td>{t.email}</td>
                                        <td>{t.phone}</td>
                                        <td>{t.department}</td>
                                        <td>
                                            <button className="btn-action edit" onClick={() => handleEdit(t)}>Edit</button>
                                            <button className="btn-action delete" onClick={() => handleDelete(t.id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {teachers.length === 0 && <p className="empty-state">No teachers found.</p>}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default TeacherManagement;
