import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './css/Management.css';

const RemarkManagement = () => {
    const { user } = useAuth();
    const [remarks, setRemarks] = useState([]);
    
    // For creating new remark
    const [isComposing, setIsComposing] = useState(false);
    const [users, setUsers] = useState([]); // Mocking potential recipients
    const [formData, setFormData] = useState({
        receiver_id: '', title: '', message: '', student_id: ''
    });

    const fetchRemarks = async () => {
        try {
            const res = await api.get('/remarks');
            setRemarks(res.data.data);
        } catch (error) {
            console.error('Error fetching remarks', error);
        }
    };

    const fetchUsers = async () => {
        // Simplified approach for the prototype: load teachers and parents to select from
        try {
            const [t, p] = await Promise.all([
                api.get('/teachers'),
                api.get('/parents')
            ]);
            // Combine and format. Note: we need their `user_id` from the users table, not teacher/parent table ID.
            // But since our GET /teachers returns teacher records without user_id explicitly listed in the select if not configured,
            // we will just assume we can fetch them. (In a real app, we'd have a specific endpoint for contacts).
            // For now, let's just make the UI work, and the user can manually enter an ID if needed, or we'll mock it.
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchRemarks();
        // fetchUsers(); // skipped for simplicity, using a generic input for receiver_id in this prototype
    }, []);

    const handleSend = async (e) => {
        e.preventDefault();
        try {
            await api.post('/remarks', formData);
            alert('Remark sent!');
            setIsComposing(false);
            setFormData({ receiver_id: '', title: '', message: '', student_id: '' });
            fetchRemarks();
        } catch (error) {
            console.error('Error sending remark', error);
            alert('Failed to send remark.');
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await api.put(`/remarks/${id}/read`);
            fetchRemarks();
        } catch (error) {
            console.error('Error marking as read', error);
        }
    };

    return (
        <Layout>
            <div className="management-container" style={{flexDirection: 'column'}}>
                
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <h2>Remarks & Communications</h2>
                    <button className="btn-primary" onClick={() => setIsComposing(!isComposing)}>
                        {isComposing ? 'Cancel Compose' : 'Compose Remark'}
                    </button>
                </div>

                {isComposing && (
                    <div className="form-panel" style={{marginBottom: '2rem'}}>
                        <h3>New Remark</h3>
                        <form onSubmit={handleSend} className="crud-form">
                            <div className="form-group">
                                <label>Receiver User ID (number)</label>
                                <input type="number" value={formData.receiver_id} onChange={e => setFormData({...formData, receiver_id: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label>Related Student ID (optional)</label>
                                <input type="number" value={formData.student_id} onChange={e => setFormData({...formData, student_id: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Title</label>
                                <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label>Message</label>
                                <textarea rows="4" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} required style={{width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #CBD5E1'}}></textarea>
                            </div>
                            <div className="form-actions-inline">
                                <button type="submit" className="btn-primary">Send</button>
                            </div>
                        </form>
                    </div>
                )}
                
                <div className="list-panel">
                    <h3>Inbox & Outbox</h3>
                    <div className="table-responsive">
                        <table className="crud-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>From/To</th>
                                    <th>Title</th>
                                    <th>Message</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {remarks.map(r => {
                                    const isIncoming = r.receiver_id.toString() === user?.userId;
                                    return (
                                        <tr key={r.id} style={{backgroundColor: (!isIncoming || r.is_read) ? 'transparent' : '#F0FDF4'}}>
                                            <td>{new Date(r.created_at).toLocaleDateString()}</td>
                                            <td>
                                                {isIncoming 
                                                    ? <span style={{color: 'blue'}}>From: {r.sender_name}</span> 
                                                    : <span style={{color: 'green'}}>To: {r.receiver_name}</span>}
                                            </td>
                                            <td><strong>{r.title}</strong></td>
                                            <td>{r.message}</td>
                                            <td>
                                                {isIncoming 
                                                    ? (r.is_read ? 'Read' : <strong>Unread</strong>)
                                                    : (r.is_read ? 'Read by recipient' : 'Sent')}
                                            </td>
                                            <td>
                                                {isIncoming && !r.is_read && (
                                                    <button className="btn-action edit" onClick={() => handleMarkRead(r.id)}>Mark Read</button>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                        {remarks.length === 0 && <p className="empty-state">No remarks found.</p>}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default RemarkManagement;
