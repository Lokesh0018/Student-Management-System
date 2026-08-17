import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import './Management.css';

const StudentManagement = () => {
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [formData, setFormData] = useState({
        admission_number: '', first_name: '', last_name: '', email: '', class_id: '', roll_number: ''
    });
    const [editingId, setEditingId] = useState(null);

    const fetchData = async () => {
        try {
            const [studentsRes, classesRes] = await Promise.all([
                api.get('/students'),
                api.get('/classes')
            ]);
            setStudents(studentsRes.data.data);
            setClasses(classesRes.data.data);
        } catch (error) {
            console.error('Error fetching data', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/students/${editingId}`, formData);
            } else {
                await api.post('/students', formData);
            }
            setFormData({ admission_number: '', first_name: '', last_name: '', email: '', class_id: '', roll_number: '' });
            setEditingId(null);
            fetchData();
        } catch (error) {
            console.error('Error saving student', error);
            alert('Failed to save student.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                await api.delete(`/students/${id}`);
                fetchData();
            } catch (error) {
                console.error('Error deleting student', error);
            }
        }
    };

    const handleEdit = (student) => {
        setFormData({
            admission_number: student.admission_number || '',
            first_name: student.first_name || '',
            last_name: student.last_name || '',
            email: student.email || '',
            class_id: student.class_id || '',
            roll_number: student.roll_number || ''
        });
        setEditingId(student.id);
    };

    return (
        <Layout>
            <div className="management-container">
                <div className="form-panel">
                    <h3>{editingId ? 'Edit Student' : 'Add New Student'}</h3>
                    <form onSubmit={handleSubmit} className="crud-form">
                        <div className="form-group">
                            <label>Admission Number</label>
                            <input type="text" value={formData.admission_number} onChange={e => setFormData({...formData, admission_number: e.target.value})} required />
                        </div>
                        <div className="form-group">
                            <label>First Name</label>
                            <input type="text" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} required />
                        </div>
                        <div className="form-group">
                            <label>Last Name</label>
                            <input type="text" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} required />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label>Class</label>
                            <select value={formData.class_id} onChange={e => setFormData({...formData, class_id: e.target.value})}>
                                <option value="">Select Class</option>
                                {classes.map(c => (
                                    <option key={c.id} value={c.id}>{c.class_name} - {c.section}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Roll Number</label>
                            <input type="text" value={formData.roll_number} onChange={e => setFormData({...formData, roll_number: e.target.value})} />
                        </div>
                        <div className="form-actions-inline">
                            <button type="submit" className="btn-primary">{editingId ? 'Update' : 'Create'}</button>
                            {editingId && (
                                <button type="button" className="btn-secondary" onClick={() => { setEditingId(null); setFormData({ admission_number: '', first_name: '', last_name: '', email: '', class_id: '', roll_number: '' }); }}>Cancel</button>
                            )}
                        </div>
                    </form>
                </div>
                
                <div className="list-panel">
                    <h3>Student List</h3>
                    <div className="table-responsive">
                        <table className="crud-table">
                            <thead>
                                <tr>
                                    <th>Adm No</th>
                                    <th>Name</th>
                                    <th>Class</th>
                                    <th>Roll No</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(s => (
                                    <tr key={s.id}>
                                        <td>{s.admission_number}</td>
                                        <td>{s.first_name} {s.last_name}</td>
                                        <td>{s.class_name ? `${s.class_name}-${s.section}` : 'N/A'}</td>
                                        <td>{s.roll_number}</td>
                                        <td>
                                            <button className="btn-action edit" onClick={() => handleEdit(s)}>Edit</button>
                                            <button className="btn-action delete" onClick={() => handleDelete(s.id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {students.length === 0 && <p className="empty-state">No students found.</p>}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default StudentManagement;
