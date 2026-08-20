import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './css/AdminDashboard.css';
import { FaCheckCircle, FaRegCircle, FaTag, FaFlag } from 'react-icons/fa';

const ParentRemarks = () => {
    const [stats, setStats] = useState(null);
    const [remarksData, setRemarksData] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [statusFilter, setStatusFilter] = useState('All Remarks'); // 'All Remarks', 'Unread', 'Read'
    const [categoryFilter, setCategoryFilter] = useState('All Categories'); // 'All Categories', 'Academic', 'General'

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/parent/dashboard/stats');
                setStats(res.data.data);
                if (res.data.data.remarks) {
                    setRemarksData(res.data.data.remarks);
                }
            } catch (error) {
                console.error("Error fetching data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const toggleReadStatus = async (id, currentReadStatus) => {
        try {
            const newStatus = currentReadStatus ? 0 : 1;
            
            // Optimistic UI update
            setRemarksData(prev => prev.map(r => r.id === id ? { ...r, is_read: newStatus } : r));
            
            if (newStatus === 1) {
                await api.put(`/remarks/${id}/read`);
            } else {
                await api.put(`/remarks/${id}/unread`);
            }
        } catch (error) {
            console.error("Error toggling read status", error);
            // Revert on error
            setRemarksData(prev => prev.map(r => r.id === id ? { ...r, is_read: currentReadStatus } : r));
        }
    };

    if (loading) {
        return (
            <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                <div style={{ width: '50px', height: '50px', border: '4px solid var(--border, #e2e8f0)', borderTopColor: 'var(--primary, #3b82f6)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <p style={{ color: 'var(--text-secondary, #64748b)', fontWeight: 500 }}>Loading Remarks...</p>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    // Apply filters
    const filteredRemarks = remarksData.filter(remark => {
        // Read/Unread Filter
        if (statusFilter === 'Unread' && remark.is_read) return false;
        if (statusFilter === 'Read' && !remark.is_read) return false;

        // Category Filter
        if (categoryFilter !== 'All Categories') {
            const cat = remark.category || 'General';
            if (cat !== categoryFilter) return false;
        }

        return true;
    });

    return (
        <div className="page-container" style={{ width: '100%' }}>
            <div className="dashboard-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
                
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Remarks</h1>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '2rem' }}>
                        {['All Remarks', 'Unread', 'Read'].map(f => (
                            <span 
                                key={f} 
                                onClick={() => setStatusFilter(f)}
                                style={{ 
                                    cursor: 'pointer', 
                                    fontWeight: statusFilter === f ? 600 : 500,
                                    color: statusFilter === f ? 'var(--primary)' : 'var(--text-secondary)',
                                    borderBottom: statusFilter === f ? '2px solid var(--primary)' : 'none',
                                    paddingBottom: '0.5rem',
                                    marginBottom: '-0.6rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {f}
                            </span>
                        ))}
                    </div>
                    <div>
                        <select 
                            className="form-input" 
                            style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.9rem', outline: 'none', background: 'var(--surface)', color: 'var(--text-primary)', cursor: 'pointer' }}
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option value="All Categories">All Categories</option>
                            <option value="Academic">Academic</option>
                            <option value="General">General</option>
                        </select>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem', width: '100%' }}>
                    {filteredRemarks.length > 0 ? filteredRemarks.map(remark => {
                        const child = stats?.children?.find(c => c.id === remark.student_id);
                        const childName = child ? `${child.first_name} ${child.last_name}` : 'Student';
                        const isRead = remark.is_read;

                        return (
                            <div key={remark.id} className="card" style={{ padding: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', borderLeft: isRead ? '4px solid #E2E8F0' : '4px solid var(--primary)', transition: 'all 0.2s' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>
                                            {remark.title || 'General Remark'}
                                        </h3>
                                        <button 
                                            onClick={() => toggleReadStatus(remark.id, isRead)}
                                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: isRead ? 'var(--text-secondary)' : 'var(--primary)', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s' }}
                                        >
                                            {isRead ? <><FaCheckCircle /> Mark as Unread</> : <><FaRegCircle /> Mark as Read</>}
                                        </button>
                                    </div>
                                    
                                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <span style={{ color: '#3B82F6', background: '#DBEAFE', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                            For: {childName}
                                        </span>
                                        <span style={{ color: '#10B981', background: '#D1FAE5', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                            <FaTag /> {remark.category || 'General'}
                                        </span>
                                        <span style={{ color: remark.priority === 'Important' ? '#D97706' : '#64748B', background: remark.priority === 'Important' ? '#FEF3C7' : '#F1F5F9', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                            <FaFlag /> {remark.priority || 'Normal'}
                                        </span>
                                    </div>

                                    <div style={{ fontSize: '1rem', color: 'var(--text-primary)', lineHeight: '1.5', background: 'var(--bg)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                        {remark.message}
                                    </div>

                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>From: <strong>{remark.sender_name || 'Admin'}</strong> ({remark.sender_role})</span>
                                        <span>{new Date(remark.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)', width: '100%' }}>
                            <p style={{ fontSize: '1.1rem', margin: 0 }}>No remarks found for the selected filters.</p>
                        </div>
                    )}
                </div>

                {filteredRemarks.length > 0 && (
                    <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        End of remarks
                    </div>
                )}
            </div>
        </div>
    );
};

export default ParentRemarks;
