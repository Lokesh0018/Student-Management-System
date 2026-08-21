import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBook, FaCheckCircle, FaExclamationCircle, FaUserGraduate, FaCalendarAlt, FaTimes } from 'react-icons/fa';
import api from '../utils/api';
import './css/StudentList.css';

const ParentAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Custom Alert Modal State
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, message: '', type: 'success' });

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await api.get('/homework/my-children');
      if (res.data.success) {
        setAssignments(res.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, type = 'success') => {
    setAlertConfig({ isOpen: true, message, type });
  };

  const handleAddHomework = async (id) => {
    try {
      const res = await api.post('/homework', { assignment_id: id });
      if (res.data.success) {
        showAlert('Successfully added to homework!', 'success');
        fetchAssignments();
      }
    } catch (error) {
      showAlert(error.response?.data?.message || 'Error adding to homework', 'error');
    }
  };

  const handleUpdateStatus = async (homework_id, status) => {
    try {
      const res = await api.put(`/homework/${homework_id}/status`, { status });
      if (res.data.success) {
        showAlert(`Homework status updated to ${status.replace('_', ' ')}`, 'success');
        fetchAssignments();
      }
    } catch (error) {
      showAlert('Error updating homework status', 'error');
    }
  };

  return (
    <div className="student-list-page">
      <div className="page-header-row">
        <div className="page-header-left">
          <h1 className="page-title">Children's Assignments</h1>
        </div>
      </div>

      <div className="card" style={{ background: 'transparent', boxShadow: 'none', padding: 0 }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', background: '#fff', borderRadius: '12px', boxShadow: 'var(--shadow-1)' }}>
            Loading assignments...
          </div>
        ) : assignments.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b', background: '#fff', borderRadius: '12px', boxShadow: 'var(--shadow-1)' }}>
            <FaBook style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '16px' }} />
            <h3>No Active Assignments</h3>
            <p>Your children currently have no active assignments.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {assignments.map((a, idx) => (
              <motion.div 
                key={a.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                style={{ 
                    background: '#fff', 
                    borderRadius: '16px', 
                    padding: '24px', 
                    boxShadow: 'var(--shadow-1)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <span className="status-badge status-active" style={{ fontSize: '12px', padding: '4px 10px' }}>
                    <FaBook style={{ marginRight: '6px' }} />
                    {a.subject_name}
                  </span>
                  {a.priority === 'High' && (
                    <span className="status-badge status-inactive" style={{ fontSize: '12px', padding: '4px 10px' }}>
                      High Priority
                    </span>
                  )}
                </div>
                
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>{a.title}</h3>
                
                <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>
                    <FaUserGraduate style={{ marginRight: '8px', color: 'var(--primary)' }} />
                    <span style={{ fontWeight: '500' }}>{a.student_name}</span>
                </div>
                
                <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5', marginBottom: '16px', flexGrow: 1 }}>
                    {a.description || 'No description provided.'}
                </p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '8px', marginBottom: '20px', fontSize: '13px' }}>
                  <div>
                      <div style={{ color: '#64748b', marginBottom: '4px' }}>Assigned</div>
                      <div style={{ fontWeight: '500', color: '#334155' }}>
                          <FaCalendarAlt style={{ marginRight: '6px', color: '#94a3b8' }}/> 
                          {new Date(a.assigned_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#64748b', marginBottom: '4px' }}>Due Date</div>
                      <div style={{ fontWeight: '500', color: '#ef4444' }}>
                          <FaCalendarAlt style={{ marginRight: '6px', color: '#fca5a5' }}/> 
                          {new Date(a.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                  {!a.homework_status ? (
                    <button 
                        className="btn-primary" 
                        style={{ width: '100%', justifyContent: 'center' }}
                        onClick={() => handleAddHomework(a.id)}
                    >
                        Mark as Homework
                    </button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: '500', fontSize: '14px', color: 'var(--text-secondary)' }}>Status:</span>
                      <select 
                        className="form-control" 
                        style={{ width: 'auto', padding: '6px 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: a.homework_status === 'COMPLETED' ? '#ecfdf5' : '#fff' }}
                        value={a.homework_status} 
                        onChange={(e) => handleUpdateStatus(a.homework_id, e.target.value)}
                      >
                        <option value="TO_DO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Alert Modal */}
      <AnimatePresence>
        {alertConfig.isOpen && (
          <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={() => setAlertConfig({ ...alertConfig, isOpen: false })}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="modal-content"
              onClick={e => e.stopPropagation()}
              style={{ 
                  maxWidth: '400px', 
                  textAlign: 'center', 
                  padding: '32px 24px',
                  borderRadius: '20px'
              }}
            >
              <div style={{ 
                  width: '64px', 
                  height: '64px', 
                  borderRadius: '50%', 
                  background: alertConfig.type === 'success' ? '#dcfce7' : '#fee2e2',
                  color: alertConfig.type === 'success' ? '#22c55e' : '#ef4444',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '32px',
                  margin: '0 auto 20px auto'
              }}>
                  {alertConfig.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
              </div>
              <h3 style={{ fontSize: '20px', marginBottom: '12px', color: 'var(--text-primary)' }}>
                  {alertConfig.type === 'success' ? 'Success' : 'Error'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.5' }}>
                  {alertConfig.message}
              </p>
              <button 
                  className="btn-primary" 
                  style={{ width: '100%', justifyContent: 'center', background: alertConfig.type === 'success' ? 'var(--primary)' : '#ef4444' }} 
                  onClick={() => setAlertConfig({ ...alertConfig, isOpen: false })}
              >
                  Continue
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ParentAssignments;
