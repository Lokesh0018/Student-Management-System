import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
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
        <div>
            <h1 className="page-title" style={{marginBottom: '24px'}}>Student Profile Management</h1>
            <div className="management-container">
                <Card style={{ flex: 1, minWidth: '300px' }}>
                    <h3 className="section-title">{editingId ? 'Edit Student' : 'Add New Student'}</h3>
                    <form onSubmit={handleSubmit} style={{marginTop: '24px'}}>
                        <Input label="Admission Number" value={formData.admission_number} onChange={e => setFormData({...formData, admission_number: e.target.value})} required />
                        <Input label="First Name" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} required />
                        <Input label="Last Name" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} required />
                        <Input label="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        
                        <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column' }}>
                            <label className="caption" style={{ marginBottom: '4px' }}>Class</label>
                            <select 
                                value={formData.class_id} 
                                onChange={e => setFormData({...formData, class_id: e.target.value})}
                                style={{ padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '6px', fontFamily: 'var(--font-sans)', fontSize: '16px' }}
                            >
                                <option value="">Select Class</option>
                                {classes.map(c => (
                                    <option key={c.id} value={c.id}>{c.class_name} - {c.section}</option>
                                ))}
                            </select>
                        </div>
                        
                        <Input label="Roll Number" value={formData.roll_number} onChange={e => setFormData({...formData, roll_number: e.target.value})} />
                        
                        <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
                            <Button type="submit" variant="primary">{editingId ? 'Update' : 'Create'}</Button>
                            {editingId && (
                                <Button type="button" variant="secondary" onClick={() => { setEditingId(null); setFormData({ admission_number: '', first_name: '', last_name: '', email: '', class_id: '', roll_number: '' }); }}>Cancel</Button>
                            )}
                        </div>
                    </form>
                </Card>
                
                <Card style={{ flex: 2, minWidth: '300px' }}>
                    <h3 className="section-title" style={{marginBottom: '24px'}}>Student List</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="crud-table w-full">
                            <thead>
                                <tr>
                                    <th className="caption">Adm No</th>
                                    <th className="caption">Name</th>
                                    <th className="caption">Class</th>
                                    <th className="caption">Roll No</th>
                                    <th className="caption">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(s => (
                                    <tr key={s.id}>
                                        <td className="body-secondary">{s.admission_number}</td>
                                        <td className="body-main">{s.first_name} {s.last_name}</td>
                                        <td className="body-secondary">{s.class_name ? `${s.class_name}-${s.section}` : 'N/A'}</td>
                                        <td className="body-secondary">{s.roll_number}</td>
                                        <td>
                                            <Button variant="ghost" onClick={() => handleEdit(s)} style={{padding: '4px 8px'}}>Edit</Button>
                                            <Button variant="ghost" onClick={() => handleDelete(s.id)} style={{padding: '4px 8px', color: 'var(--danger)'}}>Delete</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {students.length === 0 && <p className="body-secondary text-center" style={{padding: '24px'}}>No students found.</p>}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default StudentManagement;
