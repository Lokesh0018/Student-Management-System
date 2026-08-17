import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import './Management.css';

const ParentManagement = () => {
    const [parents, setParents] = useState([]);
    const [students, setStudents] = useState([]);
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', address: '', studentIds: []
    });
    const [editingId, setEditingId] = useState(null);

    const fetchData = async () => {
        try {
            const [parentsRes, studentsRes] = await Promise.all([
                api.get('/parents'),
                api.get('/students')
            ]);
            setParents(parentsRes.data.data);
            setStudents(studentsRes.data.data);
        } catch (error) {
            console.error('Error fetching data', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

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
        try {
            if (editingId) {
                await api.put(`/parents/${editingId}`, formData);
            } else {
                await api.post('/parents', formData);
            }
            setFormData({ name: '', email: '', phone: '', address: '', studentIds: [] });
            setEditingId(null);
            fetchData();
        } catch (error) {
            console.error('Error saving parent', error);
            alert('Failed to save parent.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this parent? This will also remove their user account.')) {
            try {
                await api.delete(`/parents/${id}`);
                fetchData();
            } catch (error) {
                console.error('Error deleting parent', error);
            }
        }
    };

    const handleEdit = (parent) => {
        setFormData({
            name: parent.name || '',
            email: parent.email || '',
            phone: parent.phone || '',
            address: parent.address || '',
            studentIds: [] // Simplifying edit for now
        });
        setEditingId(parent.id);
    };

    return (
        <Layout>
            <div className="management-container">
                <div className="form-panel">
                    <h3>{editingId ? 'Edit Parent' : 'Add New Parent'}</h3>
                    <p className="subtitle" style={{fontSize: '0.8rem', marginTop: '-1rem'}}>Default password is 'password123'</p>
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
                            <label>Address</label>
                            <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                        </div>
                        
                        {!editingId && (
                            <div className="form-group">
                                <label>Link Children (Ctrl+Click to select multiple)</label>
                                <select multiple value={formData.studentIds} onChange={handleStudentSelect} style={{height: '100px'}}>
                                    {students.map(s => (
                                        <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.admission_number})</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="form-actions-inline">
                            <button type="submit" className="btn-primary">{editingId ? 'Update' : 'Create'}</button>
                            {editingId && (
                                <button type="button" className="btn-secondary" onClick={() => { setEditingId(null); setFormData({ name: '', email: '', phone: '', address: '', studentIds: [] }); }}>Cancel</button>
                            )}
                        </div>
                    </form>
                </div>
                
                <div className="list-panel">
                    <h3>Parent List</h3>
                    <div className="table-responsive">
                        <table className="crud-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Children</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {parents.map(p => (
                                    <tr key={p.id}>
                                        <td>{p.name}</td>
                                        <td>{p.email}</td>
                                        <td>{p.phone}</td>
                                        <td>{p.children_names || 'None'}</td>
                                        <td>
                                            <button className="btn-action edit" onClick={() => handleEdit(p)}>Edit</button>
                                            <button className="btn-action delete" onClick={() => handleDelete(p.id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {parents.length === 0 && <p className="empty-state">No parents found.</p>}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ParentManagement;
