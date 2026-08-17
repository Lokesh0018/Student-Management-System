import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import './Management.css';

const ExamManagement = () => {
    const [exams, setExams] = useState([]);
    const [classes, setClasses] = useState([]);
    const [years, setYears] = useState([]);
    const [formData, setFormData] = useState({
        exam_name: '', academic_year_id: '', class_id: '', start_date: '', end_date: '', status: 'UPCOMING'
    });
    const [editingId, setEditingId] = useState(null);

    const fetchData = async () => {
        try {
            const [examsRes, classesRes, yearsRes] = await Promise.all([
                api.get('/exams'),
                api.get('/classes'),
                // For simplicity, hardcoding academic years or fetching if we had the endpoint.
                // Assuming we have an endpoint, but we didn't build one in Phase 7-10. Let's mock it.
                Promise.resolve({data: {data: [{id: 1, year_name: '2026-2027'}]}})
            ]);
            setExams(examsRes.data.data);
            setClasses(classesRes.data.data);
            setYears(yearsRes.data.data);
        } catch (error) {
            console.error('Error fetching exams data', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/exams/${editingId}`, formData);
            } else {
                await api.post('/exams', formData);
            }
            setFormData({ exam_name: '', academic_year_id: '', class_id: '', start_date: '', end_date: '', status: 'UPCOMING' });
            setEditingId(null);
            fetchData();
        } catch (error) {
            console.error('Error saving exam', error);
            alert('Failed to save exam.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this exam?')) {
            try {
                await api.delete(`/exams/${id}`);
                fetchData();
            } catch (error) {
                console.error('Error deleting exam', error);
            }
        }
    };

    const handleEdit = (exam) => {
        setFormData({
            exam_name: exam.exam_name,
            academic_year_id: exam.academic_year_id,
            class_id: exam.class_id,
            start_date: exam.start_date ? exam.start_date.split('T')[0] : '',
            end_date: exam.end_date ? exam.end_date.split('T')[0] : '',
            status: exam.status
        });
        setEditingId(exam.id);
    };

    return (
        <Layout>
            <div className="management-container">
                <div className="form-panel">
                    <h3>{editingId ? 'Edit Exam' : 'Create Exam'}</h3>
                    <form onSubmit={handleSubmit} className="crud-form">
                        <div className="form-group">
                            <label>Exam Name</label>
                            <input type="text" value={formData.exam_name} onChange={e => setFormData({...formData, exam_name: e.target.value})} required />
                        </div>
                        <div className="form-group">
                            <label>Academic Year</label>
                            <select value={formData.academic_year_id} onChange={e => setFormData({...formData, academic_year_id: e.target.value})} required>
                                <option value="">Select Year</option>
                                {years.map(y => <option key={y.id} value={y.id}>{y.year_name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Class</label>
                            <select value={formData.class_id} onChange={e => setFormData({...formData, class_id: e.target.value})} required>
                                <option value="">Select Class</option>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.class_name} - {c.section}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Start Date</label>
                            <input type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} required />
                        </div>
                        <div className="form-group">
                            <label>End Date</label>
                            <input type="date" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} required />
                        </div>
                        <div className="form-group">
                            <label>Status</label>
                            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                                <option value="UPCOMING">Upcoming</option>
                                <option value="ONGOING">Ongoing</option>
                                <option value="COMPLETED">Completed</option>
                            </select>
                        </div>
                        <div className="form-actions-inline">
                            <button type="submit" className="btn-primary">{editingId ? 'Update' : 'Create'}</button>
                            {editingId && (
                                <button type="button" className="btn-secondary" onClick={() => { setEditingId(null); setFormData({ exam_name: '', academic_year_id: '', class_id: '', start_date: '', end_date: '', status: 'UPCOMING' }); }}>Cancel</button>
                            )}
                        </div>
                    </form>
                </div>
                
                <div className="list-panel">
                    <h3>Exam List</h3>
                    <div className="table-responsive">
                        <table className="crud-table">
                            <thead>
                                <tr>
                                    <th>Exam</th>
                                    <th>Class</th>
                                    <th>Dates</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {exams.map(e => (
                                    <tr key={e.id}>
                                        <td>{e.exam_name}</td>
                                        <td>{e.class_name}-{e.section}</td>
                                        <td>{e.start_date ? new Date(e.start_date).toLocaleDateString() : ''} to {e.end_date ? new Date(e.end_date).toLocaleDateString() : ''}</td>
                                        <td><span className={`status-badge ${e.status.toLowerCase()}`}>{e.status}</span></td>
                                        <td>
                                            <button className="btn-action edit" onClick={() => handleEdit(e)}>Edit</button>
                                            <button className="btn-action delete" onClick={() => handleDelete(e.id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {exams.length === 0 && <p className="empty-state">No exams found.</p>}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ExamManagement;
