import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const TeacherAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [formData, setFormData] = useState({
    class_id: '',
    subject_id: '',
    title: '',
    description: '',
    due_date: '',
    priority: 'Normal',
    status: 'Active'
  });

  useEffect(() => {
    fetchAssignments();
    fetchClassesAndSubjects();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await api.get('/assignments');
      if (res.data.success) setAssignments(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassesAndSubjects = async () => {
    try {
      // Assuming these endpoints exist for the teacher to get their classes/subjects
      const [classRes, subRes] = await Promise.all([
        api.get('/classes'),
        api.get('/subjects')
      ]);
      if (classRes.data.success) setClasses(classRes.data.data);
      if (subRes.data.success) setSubjects(subRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await api.put(`/assignments/${formData.id}`, formData);
      } else {
        await api.post('/assignments', formData);
      }
      fetchAssignments();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving assignment');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this assignment?')) return;
    try {
      await api.delete(`/assignments/${id}`);
      fetchAssignments();
    } catch (error) {
      alert('Error deleting');
    }
  };

  const openEdit = (a) => {
    setFormData({
      ...a,
      due_date: a.due_date.split('T')[0]
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({ class_id: '', subject_id: '', title: '', description: '', due_date: '', priority: 'Normal', status: 'Active' });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>My Assignments</h1>
        <button className="btn btn-primary" onClick={() => { resetForm(); setIsModalOpen(true); }}>
          + Create Assignment
        </button>
      </div>

      <div className="card">
        <table className="table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <th style={{ padding: '10px' }}>Title</th>
              <th style={{ padding: '10px' }}>Class</th>
              <th style={{ padding: '10px' }}>Subject</th>
              <th style={{ padding: '10px' }}>Due Date</th>
              <th style={{ padding: '10px' }}>Status</th>
              <th style={{ padding: '10px' }}>Priority</th>
              <th style={{ padding: '10px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map(a => (
              <tr key={a.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px' }}>{a.title}</td>
                <td style={{ padding: '10px' }}>{a.class_name} {a.section}</td>
                <td style={{ padding: '10px' }}>{a.subject_name}</td>
                <td style={{ padding: '10px' }}>{new Date(a.due_date).toLocaleDateString()}</td>
                <td style={{ padding: '10px' }}>
                  <span className={`badge ${a.status === 'Active' ? 'badge-success' : 'badge-secondary'}`}>{a.status}</span>
                </td>
                <td style={{ padding: '10px' }}>
                  <span className={`badge ${a.priority === 'High' ? 'badge-danger' : a.priority === 'Low' ? 'badge-info' : 'badge-primary'}`}>{a.priority}</span>
                </td>
                <td style={{ padding: '10px' }}>
                  <button className="btn btn-sm" style={{ marginRight: '5px' }} onClick={() => openEdit(a)}>Edit</button>
                  <button className="btn btn-sm" style={{ background: '#ff4d4f', color: '#fff' }} onClick={() => handleDelete(a.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {assignments.length === 0 && (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>No assignments found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ background: '#fff', padding: '20px', borderRadius: '8px', width: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2>{formData.id ? 'Edit Assignment' : 'Create Assignment'}</h2>
            <form onSubmit={handleSave}>
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label>Title *</label>
                <input type="text" className="form-control" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required style={{ width: '100%', padding: '8px' }} />
              </div>
              
              {!formData.id && (
                <>
                  <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label>Class *</label>
                    <select className="form-control" value={formData.class_id} onChange={e => setFormData({ ...formData, class_id: e.target.value })} required style={{ width: '100%', padding: '8px' }}>
                      <option value="">-- Select --</option>
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.class_name} {c.section}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label>Subject *</label>
                    <select className="form-control" value={formData.subject_id} onChange={e => setFormData({ ...formData, subject_id: e.target.value })} required style={{ width: '100%', padding: '8px' }}>
                      <option value="">-- Select --</option>
                      {subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.subject_name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label>Description</label>
                <textarea className="form-control" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows="3" style={{ width: '100%', padding: '8px' }}></textarea>
              </div>

              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label>Due Date *</label>
                <input type="date" className="form-control" value={formData.due_date} onChange={e => setFormData({ ...formData, due_date: e.target.value })} required style={{ width: '100%', padding: '8px' }} />
              </div>

              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label>Priority</label>
                <select className="form-control" value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })} style={{ width: '100%', padding: '8px' }}>
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                </select>
              </div>

              {formData.id && (
                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label>Status</label>
                  <select className="form-control" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} style={{ width: '100%', padding: '8px' }}>
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAssignments;
