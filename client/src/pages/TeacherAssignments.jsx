import React, { useState, useEffect } from 'react';
import { FaSearch, FaPlus, FaPen, FaTrash, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import api from '../utils/api';
import './css/StudentList.css'; 

const TeacherAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);
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
      const [classRes, subRes] = await Promise.all([
        api.get('/classes'),
        api.get('/subjects')
      ]);
      
      let initialClassId = '';
      if (classRes.data.success) {
        setClasses(classRes.data.data);
        if (classRes.data.data.length > 0) {
            initialClassId = classRes.data.data[0].id;
        }
      }
      
      if (subRes.data.success) {
          setSubjects(subRes.data.data);
      }
      
      setFormData(prev => ({ ...prev, class_id: initialClassId }));
      
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

  const openDeleteModal = (id) => {
    setAssignmentToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!assignmentToDelete) return;
    try {
      await api.delete(`/assignments/${assignmentToDelete}`);
      fetchAssignments();
      setIsDeleteModalOpen(false);
      setAssignmentToDelete(null);
    } catch (error) {
      alert('Error deleting assignment');
    }
  };

  const openEdit = (a) => {
    setFormData({
      ...a,
      due_date: a.due_date ? a.due_date.split('T')[0] : ''
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({ 
      class_id: classes.length > 0 ? classes[0].id : '', 
      subject_id: '', 
      title: '', 
      description: '', 
      due_date: '', 
      priority: 'Normal', 
      status: 'Active' 
    });
  };

  const filteredAssignments = assignments.filter(a => 
    a.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.class_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.subject_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="student-list-page">
      <div className="page-header-row">
        <div className="page-header-left">
          <h1 className="page-title">My Assignments</h1>
        </div>
        <button className="btn-primary" onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <FaPlus /> Create Assignment
        </button>
      </div>

      <div className="filter-card">
        <div className="search-input-wrap">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search assignments by title, class, or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-card">
        {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Loading assignments...</div>
        ) : (
            <table className="data-table">
            <thead>
                <tr>
                <th>TITLE</th>
                <th>CLASS</th>
                <th>SUBJECT</th>
                <th>DUE DATE</th>
                <th>PRIORITY</th>
                <th>STATUS</th>
                <th className="text-right">ACTIONS</th>
                </tr>
            </thead>
            <tbody>
                {filteredAssignments.map((a, idx) => (
                <motion.tr 
                    key={a.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="clickable-row"
                >
                    <td className="fw-500">{a.title}</td>
                    <td>{a.class_name} {a.section}</td>
                    <td>{a.subject_name}</td>
                    <td>{new Date(a.due_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td>
                        <span className={`status-badge status-${a.priority?.toLowerCase() === 'high' ? 'inactive' : a.priority?.toLowerCase() === 'low' ? 'pending' : 'active'}`}>
                            {a.priority}
                        </span>
                    </td>
                    <td>
                        <span className={`status-badge status-${a.status?.toLowerCase() === 'active' ? 'active' : 'inactive'}`}>
                            {a.status === 'Active' ? <FaCheckCircle style={{marginRight: 4}}/> : <FaExclamationCircle style={{marginRight: 4}}/>}
                            {a.status}
                        </span>
                    </td>
                    <td className="text-right">
                    <div className="action-buttons-group">
                        <button className="action-btn-icon text-gray" onClick={(e) => { e.stopPropagation(); openEdit(a); }} title="Edit">
                            <FaPen />
                        </button>
                        <button className="action-btn-icon text-red" onClick={(e) => { e.stopPropagation(); openDeleteModal(a.id); }} title="Delete">
                            <FaTrash />
                        </button>
                    </div>
                    </td>
                </motion.tr>
                ))}
                {filteredAssignments.length === 0 && (
                <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                        No assignments found. Try creating one!
                    </td>
                </tr>
                )}
            </tbody>
            </table>
        )}
        
        {!loading && (
            <div className="pagination-footer">
                <span className="pagination-info">Showing {filteredAssignments.length} results</span>
            </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="modal-content" 
            onClick={e => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '500px' }}
          >
            <h3>{formData.id ? 'Edit Assignment' : 'Create Assignment'}</h3>
            <form onSubmit={handleSave}>
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label className="form-label">Title <span style={{color: 'red'}}>*</span></label>
                <input 
                    type="text" 
                    className="form-control" 
                    value={formData.title} 
                    onChange={e => setFormData({ ...formData, title: e.target.value })} 
                    placeholder="Enter assignment title"
                    required 
                />
              </div>
              
              {!formData.id && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div className="form-group">
                    <label className="form-label">Class <span style={{color: 'red'}}>*</span></label>
                    {classes.length > 0 ? (
                      <input 
                          type="text" 
                          className="form-control" 
                          value={`${classes[0].class_name} ${classes[0].section}`} 
                          disabled 
                          style={{ background: '#f1f5f9', color: '#64748b', cursor: 'not-allowed', border: '1px solid #e2e8f0' }}
                      />
                    ) : (
                      <input 
                          type="text" 
                          className="form-control" 
                          value="No class assigned" 
                          disabled 
                          style={{ background: '#fee2e2', color: '#ef4444', cursor: 'not-allowed', border: '1px solid #fca5a5' }}
                      />
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subject <span style={{color: 'red'}}>*</span></label>
                    <select 
                        className="form-control" 
                        value={formData.subject_id} 
                        onChange={e => setFormData({ ...formData, subject_id: e.target.value })} 
                        required
                    >
                      <option value="">-- Select --</option>
                      {subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.subject_name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label className="form-label">Description</label>
                <textarea 
                    className="form-control" 
                    value={formData.description} 
                    onChange={e => setFormData({ ...formData, description: e.target.value })} 
                    rows="4" 
                    placeholder="Enter assignment details..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: formData.id ? '1fr 1fr 1fr' : '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div className="form-group">
                    <label className="form-label">Due Date <span style={{color: 'red'}}>*</span></label>
                    <input 
                        type="date" 
                        className="form-control" 
                        value={formData.due_date} 
                        onChange={e => setFormData({ ...formData, due_date: e.target.value })} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select 
                        className="form-control" 
                        value={formData.priority} 
                        onChange={e => setFormData({ ...formData, priority: e.target.value })}
                    >
                    <option value="Low">Low</option>
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    </select>
                </div>
                
                {formData.id && (
                    <div className="form-group">
                    <label className="form-label">Status</label>
                    <select 
                        className="form-control" 
                        value={formData.status} 
                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                    >
                        <option value="Active">Active</option>
                        <option value="Draft">Draft</option>
                        <option value="Closed">Closed</option>
                    </select>
                    </div>
                )}
              </div>

              <div className="modal-actions" style={{ marginTop: '0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Assignment</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="modal-content" 
                onClick={e => e.stopPropagation()}
            >
                <h3>Confirm Deletion</h3>
                <p>Are you sure you want to delete this assignment? This action cannot be undone.</p>
                <div className="modal-actions">
                    <button className="btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
                    <button className="btn-primary" style={{backgroundColor: '#ef4444', borderColor: '#ef4444'}} onClick={confirmDelete}>Delete</button>
                </div>
            </motion.div>
        </div>
      )}
    </div>
  );
};

export default TeacherAssignments;

