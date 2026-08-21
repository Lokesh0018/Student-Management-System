import React, { useState, useEffect } from 'react';
import { FaSearch, FaPlus, FaEye } from 'react-icons/fa';
import api from '../utils/api';
import toast from 'react-hot-toast';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import './css/StudentList.css';
import { useAuth } from '../context/AuthContext';

const RemarkManagement = () => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [remarks, setRemarks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [viewingRemark, setViewingRemark] = useState(null);
    const [students, setStudents] = useState([]);
    const [newRemark, setNewRemark] = useState({
        student_id: '',
        title: '',
        category: 'Academic',
        priority: 'Normal',
        message: ''
    });

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [remarksRes, studentsRes] = await Promise.all([
                api.get('/remarks'),
                api.get('/students')
            ]);
            
            // Format dates and names
            const formattedRemarks = remarksRes.data.data.map(r => ({
                id: r.id,
                student_name: r.student_first ? `${r.student_first} ${r.student_last}` : 'General',
                title: r.title,
                category: r.category || 'General',
                priority: r.priority || 'Normal',
                date: new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
                status: r.is_read ? 'Read' : 'Unread',
                sender_id: r.sender_id,
                message: r.message
            }));
            
            setRemarks(formattedRemarks);
            setStudents(studentsRes.data.data);
        } catch (error) {
            console.error('Error fetching remarks', error);
            toast.error('Failed to load remarks');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredRemarks = remarks.filter(remark => {
        const matchesSearch = remark.student_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              remark.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter ? remark.category === categoryFilter : true;
        const matchesStatus = statusFilter ? remark.status === statusFilter : true;
        
        let matchesTab = true;
        if (activeTab === 'sent') matchesTab = remark.sender_id === user?.id;
        if (activeTab === 'important') matchesTab = remark.priority === 'Important';

        return matchesSearch && matchesCategory && matchesStatus && matchesTab;
    });

    const getPriorityStyle = (priority) => {
        if (priority === 'Important') return { color: '#f59e0b', bg: '#fffbeb' }; // Orange
        if (priority === 'Normal') return { color: '#10b981', bg: '#ecfdf5' }; // Green
        return { color: '#3b82f6', bg: '#eff6ff' }; // Low - Blue
    };

    const getStatusStyle = (status) => {
        if (status === 'Unread') return { color: '#f59e0b' }; // Orange
        return { color: '#10b981' }; // Read - Green
    };

    const handleAddRemark = async (e) => {
        e.preventDefault();
        if (!newRemark.title || !newRemark.message) {
            toast.error("Please fill required fields");
            return;
        }
        try {
            await api.post('/remarks', newRemark);
            toast.success("Remark added successfully");
            setIsAddModalOpen(false);
            setNewRemark({ student_id: '', title: '', category: 'Academic', priority: 'Normal', message: '' });
            fetchData();
        } catch (error) {
            toast.error("Failed to add remark");
        }
    };

    return (
        <div className="student-list-page">
            <div className="page-header-row" style={{ marginBottom: '24px' }}>
                <div className="page-header-left">
                    <h1 className="page-title">Remarks</h1>
                </div>
            </div>

            <div className="table-card" style={{ paddingTop: '0' }}>
                {/* Tabs & Add Button */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', padding: '0 24px' }}>
                    <div style={{ display: 'flex', gap: '24px' }}>
                        <button 
                            style={{ padding: '16px 0', border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: activeTab === 'all' ? '600' : '500', color: activeTab === 'all' ? '#2563eb' : '#64748b', borderBottom: activeTab === 'all' ? '2px solid #2563eb' : '2px solid transparent' }}
                            onClick={() => setActiveTab('all')}
                        >
                            All Remarks
                        </button>
                        <button 
                            style={{ padding: '16px 0', border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: activeTab === 'sent' ? '600' : '500', color: activeTab === 'sent' ? '#2563eb' : '#64748b', borderBottom: activeTab === 'sent' ? '2px solid #2563eb' : '2px solid transparent' }}
                            onClick={() => setActiveTab('sent')}
                        >
                            Sent by Me
                        </button>
                        <button 
                            style={{ padding: '16px 0', border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: activeTab === 'important' ? '600' : '500', color: activeTab === 'important' ? '#2563eb' : '#64748b', borderBottom: activeTab === 'important' ? '2px solid #2563eb' : '2px solid transparent' }}
                            onClick={() => setActiveTab('important')}
                        >
                            Important
                        </button>
                    </div>
                    <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }} onClick={() => setIsAddModalOpen(true)}>
                        <FaPlus size={12} /> Add Remark
                    </button>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '16px', padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
                    <div className="search-input-wrap" style={{ margin: 0, width: '300px' }}>
                        <FaSearch className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Search remarks..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <select className="filter-select" style={{ minWidth: '150px' }} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                        <option value="">All Categories</option>
                        <option value="Academic">Academic</option>
                        <option value="General">General</option>
                        <option value="Behavioral">Behavioral</option>
                    </select>
                    
                    <select className="filter-select" style={{ minWidth: '150px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="">All Status</option>
                        <option value="Read">Read</option>
                        <option value="Unread">Unread</option>
                    </select>
                </div>

                {/* Table */}
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Priority</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            Array(6).fill(0).map((_, i) => (
                                <tr key={`skeleton-${i}`}>
                                    <td><Skeleton width={120} /></td>
                                    <td><Skeleton width={150} /></td>
                                    <td><Skeleton width={80} /></td>
                                    <td><Skeleton width={60} /></td>
                                    <td><Skeleton width={80} /></td>
                                    <td><Skeleton width={60} /></td>
                                    <td className="text-right"><Skeleton width={30} /></td>
                                </tr>
                            ))
                        ) : filteredRemarks.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center" style={{ padding: '32px' }}>
                                    <p className="text-secondary">No remarks found.</p>
                                </td>
                            </tr>
                        ) : (
                            filteredRemarks.map(remark => {
                                const prioStyle = getPriorityStyle(remark.priority);
                                const statStyle = getStatusStyle(remark.status);
                                
                                return (
                                    <tr key={remark.id} className="clickable-row">
                                        <td data-label="Student" className="fw-500 text-primary">{remark.student_name}</td>
                                        <td data-label="Title">{remark.title}</td>
                                        <td data-label="Category">
                                            <span style={{ color: '#3b82f6', fontWeight: '500' }}>{remark.category}</span>
                                        </td>
                                        <td data-label="Priority">
                                            <span style={{ color: prioStyle.color, fontWeight: '600', fontSize: '13px' }}>
                                                {remark.priority}
                                            </span>
                                        </td>
                                        <td data-label="Date" className="text-secondary">{remark.date}</td>
                                        <td data-label="Status">
                                            <span style={{ color: statStyle.color, fontWeight: '600', fontSize: '13px' }}>
                                                {remark.status}
                                            </span>
                                        </td>
                                        <td data-label="Actions" className="text-right">
                                            <div className="action-buttons-group">
                                                <button className="action-btn-icon text-blue" onClick={(e) => { e.stopPropagation(); setViewingRemark(remark); }} title="View Details">
                                                    <FaEye />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
                
                <div className="pagination-footer">
                    <span className="pagination-info">Showing {filteredRemarks.length} of {filteredRemarks.length} remarks</span>
                </div>
            </div>

            {/* Add Remark Modal */}
            {isAddModalOpen && (
                <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <h3>Add New Remark</h3>
                        <form onSubmit={handleAddRemark} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                            <div className="form-group">
                                <label>Student</label>
                                <select 
                                    className="filter-select" 
                                    style={{ width: '100%' }}
                                    value={newRemark.student_id} 
                                    onChange={e => setNewRemark({...newRemark, student_id: e.target.value})}
                                >
                                    <option value="">Select Student (Optional)</option>
                                    {students.map(s => (
                                        <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.roll_number})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Title *</label>
                                <input 
                                    type="text" 
                                    required 
                                    placeholder="Remark Title"
                                    value={newRemark.title}
                                    onChange={e => setNewRemark({...newRemark, title: e.target.value})}
                                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Category</label>
                                    <select 
                                        className="filter-select" 
                                        style={{ width: '100%' }}
                                        value={newRemark.category} 
                                        onChange={e => setNewRemark({...newRemark, category: e.target.value})}
                                    >
                                        <option value="Academic">Academic</option>
                                        <option value="General">General</option>
                                        <option value="Behavioral">Behavioral</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Priority</label>
                                    <select 
                                        className="filter-select" 
                                        style={{ width: '100%' }}
                                        value={newRemark.priority} 
                                        onChange={e => setNewRemark({...newRemark, priority: e.target.value})}
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Normal">Normal</option>
                                        <option value="Important">Important</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Message *</label>
                                <textarea 
                                    required 
                                    maxLength="500"
                                    placeholder="Enter remark details..."
                                    value={newRemark.message}
                                    onChange={e => setNewRemark({...newRemark, message: e.target.value})}
                                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', minHeight: '100px', resize: 'vertical' }}
                                />
                            </div>
                            <div className="modal-actions" style={{ marginTop: '8px' }}>
                                <button type="button" className="btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Save Remark</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Remark Modal */}
            {viewingRemark && (
                <div className="modal-overlay" onClick={() => setViewingRemark(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <h3 style={{ margin: 0 }}>{viewingRemark.title}</h3>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>{viewingRemark.date}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                                <div>
                                    <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Student</span>
                                    <strong style={{ color: '#0f172a' }}>{viewingRemark.student_name}</strong>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Sender</span>
                                    <strong style={{ color: '#0f172a' }}>{viewingRemark.sender_id === user?.id ? 'Me' : 'Staff / Admin'}</strong>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', backgroundColor: '#eff6ff', color: '#3b82f6' }}>{viewingRemark.category}</span>
                                <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', ...getPriorityStyle(viewingRemark.priority) }}>{viewingRemark.priority}</span>
                                <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', ...getStatusStyle(viewingRemark.status), backgroundColor: viewingRemark.status === 'Unread' ? '#fffbeb' : '#ecfdf5' }}>{viewingRemark.status}</span>
                            </div>
                            <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '6px', minHeight: '100px', whiteSpace: 'pre-wrap', color: '#334155', lineHeight: '1.5' }}>
                                {viewingRemark.message}
                            </div>
                        </div>
                        <div className="modal-actions" style={{ marginTop: '24px', display: 'flex', gap: '16px', justifyContent: 'space-between' }}>
                            {viewingRemark.sender_id !== user?.id ? (
                                <button 
                                    className={viewingRemark.status === 'Unread' ? "btn-primary" : "btn-secondary"}
                                    style={{ flex: 1, backgroundColor: viewingRemark.status === 'Unread' ? '#10b981' : undefined }}
                                    onClick={async () => {
                                        try {
                                            if (viewingRemark.status === 'Unread') {
                                                await api.put(`/remarks/${viewingRemark.id}/read`);
                                                toast.success('Marked as read');
                                                setViewingRemark({...viewingRemark, status: 'Read'});
                                            } else {
                                                await api.put(`/remarks/${viewingRemark.id}/unread`);
                                                toast.success('Marked as unread');
                                                setViewingRemark({...viewingRemark, status: 'Unread'});
                                            }
                                            fetchData();
                                        } catch (error) {
                                            toast.error('Failed to update status');
                                        }
                                    }}
                                >
                                    {viewingRemark.status === 'Unread' ? 'Mark as Read' : 'Mark as Unread'}
                                </button>
                            ) : null}
                            <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setViewingRemark(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RemarkManagement;
