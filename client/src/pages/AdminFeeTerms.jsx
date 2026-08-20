import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './css/Settings.css';
import { FaPen, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdminFeeTerms = () => {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTerm, setCurrentTerm] = useState({ name: '', amount: '', due_date: '', description: '' });

  const [classes, setClasses] = useState([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignData, setAssignData] = useState({ fee_term_id: '', class_id: '' });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [termToDelete, setTermToDelete] = useState(null);

  useEffect(() => {
    fetchTerms();
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes');
      if (res.data.success) setClasses(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTerms = async () => {
    try {
      const res = await api.get('/fees/terms');
      if (res.data.success) {
        setTerms(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch terms', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (currentTerm.id) {
        await api.put(`/fees/terms/${currentTerm.id}`, currentTerm);
      } else {
        await api.post('/fees/terms', currentTerm);
      }
      toast.success('Term saved successfully');
      fetchTerms();
      setIsModalOpen(false);
      setCurrentTerm({ name: '', amount: '', due_date: '', description: '' });
    } catch (error) {
      console.error('Failed to save term', error);
      toast.error('Error saving term');
    }
  };

  const handleDelete = (id) => {
    setTermToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!termToDelete) return;
    try {
      await api.delete(`/fees/terms/${termToDelete}`);
      toast.success('Term deleted successfully');
      fetchTerms();
      setIsDeleteModalOpen(false);
      setTermToDelete(null);
    } catch (error) {
      console.error('Failed to delete', error);
      toast.error('Error deleting term');
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/fees/assign', assignData);
      if (res.data.success) {
        toast.success(res.data.message);
        setIsAssignModalOpen(false);
      } else {
        toast.error(res.data.message || 'Failed to assign');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error assigning fees');
    }
  };

  const openEdit = (term) => {
    setCurrentTerm({ ...term, due_date: term.due_date.split('T')[0] });
    setIsModalOpen(true);
  };

  const openAssign = (term) => {
    setAssignData({ fee_term_id: term.id, class_id: classes.length > 0 ? classes[0].id : '' });
    setIsAssignModalOpen(true);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>Fee Terms</h1>
        <button className="btn btn-primary" onClick={() => { setCurrentTerm({ name: '', amount: '', due_date: '', description: '' }); setIsModalOpen(true); }}>
          + Create Term
        </button>
      </div>

      <div className="card">
        <table className="table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <th style={{ padding: '10px' }}>Term Name</th>
              <th style={{ padding: '10px' }}>Amount (₹)</th>
              <th style={{ padding: '10px' }}>Due Date</th>
              <th style={{ padding: '10px' }}>Status</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>Assign</th>
              <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {terms.map(term => (
              <tr key={term.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px' }}>{term.name}</td>
                <td style={{ padding: '10px' }}>₹{term.amount}</td>
                <td style={{ padding: '10px' }}>{new Date(term.due_date).toLocaleDateString()}</td>
                <td style={{ padding: '10px' }}>
                  <span className={`badge ${term.status === 'ACTIVE' ? 'badge-success' : 'badge-secondary'}`}>{term.status}</span>
                </td>
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  <button className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '4px 8px' }} onClick={() => openAssign(term)}>Assign to Class</button>
                </td>
                <td data-label="ACTION" className="text-right" style={{ padding: '10px' }}>
                  <div className="action-buttons-group">
                    <button className="action-btn-icon text-gray" onClick={() => openEdit(term)}>
                      <FaPen />
                    </button>
                    <button className="action-btn-icon text-red" onClick={() => handleDelete(term.id)}>
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {terms.length === 0 && (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No fee terms configured.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ background: '#fff', padding: '20px', borderRadius: '8px', width: '400px' }}>
            <h2>{currentTerm.id ? 'Edit Term' : 'Create Term'}</h2>
            <form onSubmit={handleSave}>
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label>Term Name</label>
                <input type="text" className="form-control" value={currentTerm.name} onChange={e => setCurrentTerm({ ...currentTerm, name: e.target.value })} required style={{ width: '100%', padding: '8px' }} />
              </div>
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label>Amount (₹)</label>
                <input type="number" className="form-control" value={currentTerm.amount} onChange={e => setCurrentTerm({ ...currentTerm, amount: e.target.value })} required style={{ width: '100%', padding: '8px' }} />
              </div>
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label>Due Date</label>
                <input type="date" className="form-control" value={currentTerm.due_date} onChange={e => setCurrentTerm({ ...currentTerm, due_date: e.target.value })} required style={{ width: '100%', padding: '8px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAssignModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ background: '#fff', padding: '20px', borderRadius: '8px', width: '400px' }}>
            <h2>Assign Fee to Class</h2>
            <form onSubmit={handleAssign}>
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label>Select Class</label>
                <select className="form-control" value={assignData.class_id} onChange={e => setAssignData({ ...assignData, class_id: e.target.value })} required style={{ width: '100%', padding: '8px' }}>
                  <option value="">-- Select Class --</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.class_name} {c.section}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAssignModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Assign</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Confirm Deletion</h3>
            <p style={{ marginTop: '10px', marginBottom: '20px' }}>Are you sure you want to delete this fee term? This action cannot be undone.</p>
            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn-secondary" style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#e5e7eb', cursor: 'pointer' }} onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
              <button className="btn-primary" style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer' }} onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFeeTerms;
