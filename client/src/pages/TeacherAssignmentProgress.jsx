import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBook, FaCalendarAlt, FaExclamationCircle, FaUserGraduate, FaPen } from 'react-icons/fa';
import api from '../utils/api';
import './css/StudentList.css';

const TeacherAssignmentProgress = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [assignment, setAssignment] = useState(null);
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'Normal',
    status: 'Active'
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assignmentRes, progressRes] = await Promise.all([
        api.get(`/assignments/${id}`),
        api.get(`/assignments/${id}/progress`)
      ]);
      
      if (assignmentRes.data.success) {
        setAssignment(assignmentRes.data.data);
      }
      if (progressRes.data.success) {
        setProgressData(progressRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching assignment details:', error);
      alert('Error fetching assignment details.');
    } finally {
      setLoading(false);
    }
  };

  const openEdit = () => {
    setFormData({
      ...assignment,
      due_date: assignment.due_date ? assignment.due_date.split('T')[0] : ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/assignments/${formData.id}`, formData);
      fetchData(); // Refresh the data
      setIsModalOpen(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving assignment');
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Loading assignment details...</div>;
  }

  if (!assignment) {
    return (
        <div className="student-list-page">
            <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>Assignment not found.</div>
            <button className="btn-secondary" onClick={() => navigate('/teacher/assignments')} style={{ margin: '0 auto', display: 'block' }}>Go Back</button>
        </div>
    );
  }

  return (
    <div className="student-list-page">
      <div className="page-header-row">
        <div className="page-header-left">
          <h1 className="page-title">{assignment.title}</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="badge badge-info" style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500' }}>
                {assignment.class_name} {assignment.section}
            </span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <span style={{ fontWeight: '500', color: '#64748b' }}>{assignment.subject_name}</span>
          </p>
        </div>
        <button className="btn-primary" onClick={openEdit}>
            <FaPen /> Edit Assignment
        </button>
      </div>

      <div className="card" style={{ marginBottom: '24px', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-1)', border: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ flex: '1 1 500px' }}>
                <h3 style={{ margin: '0 0 12px 0', color: 'var(--text-primary)', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaBook style={{ color: 'var(--primary)' }} /> Description
                </h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '15px' }}>{assignment.description || 'No description provided.'}</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '200px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>Priority</span>
                    <span className={`status-badge status-${assignment.priority?.toLowerCase() === 'high' ? 'inactive' : assignment.priority?.toLowerCase() === 'low' ? 'pending' : 'active'}`} style={{ margin: 0 }}>
                        {assignment.priority}
                    </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>Status</span>
                    <span className={`status-badge status-${assignment.status?.toLowerCase() === 'active' ? 'active' : 'inactive'}`} style={{ margin: 0 }}>
                        {assignment.status}
                    </span>
                </div>
            </div>
        </div>
        
        <div style={{ display: 'flex', gap: '24px', marginTop: '24px', paddingTop: '20px', borderTop: '1px dashed var(--border)', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                    <FaCalendarAlt size={18} />
                </div>
                <div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Assigned Date</div>
                    <div style={{ color: 'var(--text-primary)', fontSize: '15px', fontWeight: '500' }}>{new Date(assignment.assigned_date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</div>
                </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--danger-bg, #fee2e2)', border: '1px solid var(--danger-border, #fca5a5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger, #ef4444)' }}>
                    <FaExclamationCircle size={18} />
                </div>
                <div>
                    <div style={{ color: 'var(--danger, #ef4444)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Due Date</div>
                    <div style={{ color: 'var(--danger, #ef4444)', fontSize: '15px', fontWeight: '600' }}>{new Date(assignment.due_date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</div>
                </div>
            </div>
        </div>
      </div>

      <div className="table-card">
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center' }}>
            <FaUserGraduate style={{ marginRight: '10px', color: 'var(--primary)', fontSize: '20px' }} />
            <h2 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)' }}>Student Progress</h2>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>STUDENT NAME</th>
              <th>ROLL NUMBER</th>
              <th>STATUS</th>
              <th>COMPLETED ON</th>
            </tr>
          </thead>
          <tbody>
            {progressData.length === 0 ? (
                <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                        No students found in this class.
                    </td>
                </tr>
            ) : progressData.map((student, idx) => (
              <motion.tr 
                key={student.student_id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="clickable-row"
                onClick={() => navigate(`/teacher/students/${student.student_id}`)}
              >
                <td className="fw-500">{student.first_name} {student.last_name}</td>
                <td>{student.roll_number || 'N/A'}</td>
                <td>
                    <span className={`status-badge status-${student.status ? (student.status === 'COMPLETED' ? 'active' : student.status === 'IN_PROGRESS' ? 'pending' : 'inactive') : 'inactive'}`}>
                        {student.status ? student.status.replace('_', ' ') : 'Not Started'}
                    </span>
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>
                    {student.completed_at ? new Date(student.completed_at).toLocaleString() : '-'}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        
        <div className="pagination-footer">
            <span className="pagination-info">Showing {progressData.length} students</span>
        </div>
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
            <h3>Edit Assignment</h3>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '20px' }}>
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
              </div>

              <div className="modal-actions" style={{ marginTop: '0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TeacherAssignmentProgress;
