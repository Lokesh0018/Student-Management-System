import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaCheck, FaEye } from 'react-icons/fa';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './css/StudentList.css'; 

const RemarkManagement = () => {
    const { user } = useAuth();
    const [remarks, setRemarks] = useState([]);
    const [users, setUsers] = useState([]);
    const [students, setStudents] = useState([]);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    
    // For creating new remark
    const [isComposing, setIsComposing] = useState(false);
    const [formData, setFormData] = useState({
        receiver_id: '', title: '', message: '', student_id: ''
    });

    const [recipientType, setRecipientType] = useState('');
    const [selectedRemark, setSelectedRemark] = useState(null);

    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };

    const fetchRemarks = async () => {
        try {
            const res = await api.get('/remarks');
            if (res.data.success) {
                setRemarks(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching remarks', error);
        }
    };

    const fetchDropdownData = async () => {
        try {
            const [usersRes, studentsRes] = await Promise.all([
                api.get('/users'),
                api.get('/students') // Already filters based on current user role on backend
            ]);
            
            if (usersRes.data.success) {
                setUsers(usersRes.data.data);
            }
            if (studentsRes.data.success) {
                setStudents(studentsRes.data.data);
            }
        } catch (error) {
            console.error('Error fetching dropdown data', error);
        }
    };

    useEffect(() => {
        fetchRemarks();
        fetchDropdownData();
    }, []);

    const handleSend = async (e) => {
        e.preventDefault();
        try {
            await api.post('/remarks', formData);
            showNotification('Remark sent successfully!', 'success');
            setIsComposing(false);
            setFormData({ receiver_id: '', title: '', message: '', student_id: '' });
            setRecipientType('');
            fetchRemarks();
        } catch (error) {
            console.error('Error sending remark', error);
            showNotification('Failed to send remark.', 'error');
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await api.put(`/remarks/${id}/read`);
            fetchRemarks();
            showNotification('Marked as read.', 'success');
        } catch (error) {
            console.error('Error marking as read', error);
        }
    };

    const filteredUsers = users.filter(u => u.role === recipientType);

    return (
        <div className="student-list-page">
            <div className="page-header-row">
                <div className="page-header-left">
                    <h1 className="page-title">Remarks & Communications</h1>
                    </div>
                <button 
                    className={isComposing ? "btn-secondary" : "btn-primary"} 
                    onClick={() => {
                        setIsComposing(!isComposing);
                        if (!isComposing) {
                            setFormData({ receiver_id: '', title: '', message: '', student_id: '' });
                            setRecipientType('');
                        }
                    }}
                >
                    {isComposing ? 'Cancel Compose' : <><FaPlus /> Compose Remark</>}
                </button>
            </div>

            {notification.show && (
                <div style={{
                    padding: '12px 24px', 
                    marginBottom: '16px', 
                    borderRadius: '8px',
                    backgroundColor: notification.type === 'success' ? '#dcfce7' : '#fee2e2',
                    color: notification.type === 'success' ? '#16a34a' : '#dc2626',
                    border: `1px solid ${notification.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                    display: 'flex',
                    alignItems: 'center',
                    fontWeight: '500'
                }}>
                    {notification.message}
                </div>
            )}

            {isComposing && (
                <div className="form-card" style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '1.25rem', color: '#1e293b' }}>New Remark</h3>
                    <form onSubmit={handleSend} className="crud-form">
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#475569' }}>Recipient Type</label>
                                <select 
                                    value={recipientType} 
                                    onChange={e => {
                                        setRecipientType(e.target.value);
                                        setFormData({...formData, receiver_id: ''}); // Reset selected recipient
                                    }}
                                    required
                                    style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                >
                                    <option value="">Select Type</option>
                                    <option value="CLASS_TEACHER">Teacher</option>
                                    <option value="PARENT">Parent</option>
                                </select>
                            </div>

                            <div className="form-group" style={{ margin: 0 }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#475569' }}>Recipient</label>
                                <select 
                                    value={formData.receiver_id} 
                                    onChange={e => setFormData({...formData, receiver_id: e.target.value})} 
                                    required
                                    disabled={!recipientType}
                                    style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: !recipientType ? '#f1f5f9' : 'white', cursor: !recipientType ? 'not-allowed' : 'pointer' }}
                                >
                                    <option value="">{recipientType ? 'Select Recipient' : 'Select Type First'}</option>
                                    {filteredUsers.map(u => (
                                        <option key={u.id} value={u.id}>{u.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group" style={{ margin: 0 }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#475569' }}>Related Student (Optional)</label>
                                <select 
                                    value={formData.student_id} 
                                    onChange={e => setFormData({...formData, student_id: e.target.value})}
                                    style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                >
                                    <option value="">Select Student</option>
                                    {students.map(s => (
                                        <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.roll_number || 'No Roll'})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#475569' }}>Title</label>
                            <input 
                                type="text" 
                                value={formData.title} 
                                onChange={e => setFormData({...formData, title: e.target.value})} 
                                required 
                                placeholder="E.g., Update on Mathematics Performance"
                                style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#475569' }}>Message</label>
                            <textarea 
                                rows="4" 
                                value={formData.message} 
                                onChange={e => setFormData({...formData, message: e.target.value})} 
                                required 
                                placeholder="Type your message here..."
                                style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                            ></textarea>
                        </div>
                        <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                            <button type="submit" className="btn-primary" style={{ padding: '0.6rem 1.5rem' }}>Send Message</button>
                        </div>
                    </form>
                </div>
            )}
            
            <div className="table-card">
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                    <h3 style={{ margin: 0, fontSize: '1.125rem', color: '#1e293b' }}>Inbox & Outbox</h3>
                </div>
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>DATE</th>
                                <th>FROM/TO</th>
                                <th>TITLE & MESSAGE</th>
                                <th>STATUS</th>
                                <th className="text-right">ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {remarks.map(r => {
                                const isIncoming = r.receiver_id.toString() === user?.userId;
                                const isUnread = isIncoming && !r.is_read;
                                
                                return (
                                    <tr key={r.id} style={{ backgroundColor: isUnread ? '#f0fdf4' : 'transparent', transition: 'background-color 0.2s' }}>
                                        <td className="text-secondary">{new Date(r.created_at).toLocaleDateString()}</td>
                                        <td>
                                            {isIncoming 
                                                ? <span style={{ color: '#3b82f6', fontWeight: '500' }}>From: {r.sender_name}</span> 
                                                : <span style={{ color: '#10b981', fontWeight: '500' }}>To: {r.receiver_name}</span>}
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: isUnread ? '600' : '500', color: '#1e293b', marginBottom: '4px' }}>{r.title}</div>
                                            <div style={{ color: '#64748b', fontSize: '0.875rem', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {r.message}
                                            </div>
                                        </td>
                                        <td>
                                            {isIncoming ? (
                                                r.is_read ? (
                                                    <span style={{ padding: '4px 8px', borderRadius: '9999px', backgroundColor: '#f1f5f9', color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}>Read</span>
                                                ) : (
                                                    <span style={{ padding: '4px 8px', borderRadius: '9999px', backgroundColor: '#fef3c7', color: '#d97706', fontSize: '0.75rem', fontWeight: '600' }}>New</span>
                                                )
                                            ) : (
                                                <span style={{ padding: '4px 8px', borderRadius: '9999px', backgroundColor: '#e0e7ff', color: '#4338ca', fontSize: '0.75rem', fontWeight: '600' }}>Sent</span>
                                            )}
                                        </td>
                                        <td className="text-right">
                                            {isUnread ? (
                                                <button 
                                                    onClick={() => handleMarkRead(r.id)}
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '6px', border: 'none', backgroundColor: '#10b981', color: 'white', fontSize: '0.875rem', cursor: 'pointer', transition: 'background-color 0.2s' }}
                                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                                                >
                                                    <FaCheck /> Mark Read
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => setSelectedRemark(r)}
                                                    style={{ color: '#3b82f6', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.1rem', transition: 'color 0.2s' }}
                                                    onMouseOver={(e) => e.currentTarget.style.color = '#2563eb'}
                                                    onMouseOut={(e) => e.currentTarget.style.color = '#3b82f6'}
                                                    title="View Full Message"
                                                >
                                                    <FaEye />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                            {remarks.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                                        No remarks found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedRemark && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }} onClick={() => setSelectedRemark(null)}>
                    <div style={{
                        backgroundColor: 'white', borderRadius: '8px', padding: '2rem',
                        width: '90%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.25rem' }}>{selectedRemark.title}</h2>
                            <button 
                                onClick={() => setSelectedRemark(null)}
                                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }}
                            >&times;</button>
                        </div>
                        
                        <div style={{ marginBottom: '1.5rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                            <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                <strong style={{ color: '#475569' }}>From:</strong> <span style={{ color: '#334155' }}>{selectedRemark.sender_name}</span>
                            </div>
                            <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                <strong style={{ color: '#475569' }}>To:</strong> <span style={{ color: '#334155' }}>{selectedRemark.receiver_name}</span>
                            </div>
                            <div style={{ fontSize: '0.875rem' }}>
                                <strong style={{ color: '#475569' }}>Date:</strong> <span style={{ color: '#334155' }}>{new Date(selectedRemark.created_at).toLocaleString()}</span>
                            </div>
                        </div>

                        <div style={{ color: '#334155', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                            {selectedRemark.message}
                        </div>

                        <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                            <button onClick={() => setSelectedRemark(null)} className="btn-secondary">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RemarkManagement;
