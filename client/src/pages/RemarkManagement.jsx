import React, { useState, useEffect } from 'react';
import { FaSearch, FaPlus, FaEye } from 'react-icons/fa';
import api from '../utils/api';
import toast from 'react-hot-toast';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import './css/StudentList.css';

const RemarkManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [remarks, setRemarks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Mocking the data fetching for prototype
        setTimeout(() => {
            setRemarks([
                { id: 1, student_name: 'Rohan Mehta', title: 'Improve Homework', category: 'Academic', priority: 'Important', date: '18 May 2024', status: 'Unread' },
                { id: 2, student_name: 'Ananya Singh', title: 'Good Participation', category: 'General', priority: 'Normal', date: '17 May 2024', status: 'Unread' },
                { id: 3, student_name: 'Vivaan Patel', title: 'Focus in Class', category: 'Academic', priority: 'Important', date: '16 May 2024', status: 'Read' },
                { id: 4, student_name: 'Kavya Joshi', title: 'Excellent Progress', category: 'Academic', priority: 'Low', date: '15 May 2024', status: 'Read' },
                { id: 5, student_name: 'Aryan Verma', title: 'Need More Practice', category: 'Academic', priority: 'Normal', date: '15 May 2024', status: 'Read' },
                { id: 6, student_name: 'Ishita Sharma', title: 'Good Improvement', category: 'Academic', priority: 'Low', date: '14 May 2024', status: 'Read' },
            ]);
            setIsLoading(false);
        }, 800);
    }, []);

    const filteredRemarks = remarks.filter(remark => {
        const matchesSearch = remark.student_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              remark.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter ? remark.category === categoryFilter : true;
        const matchesStatus = statusFilter ? remark.status === statusFilter : true;
        
        let matchesTab = true;
        if (activeTab === 'sent') matchesTab = true; // For prototype, all are sent by me
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
                    <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}>
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
                                            <button className="action-btn-icon text-blue">
                                                <FaEye />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
                
                <div className="pagination-footer">
                    <span className="pagination-info">Showing 1 to {filteredRemarks.length} of 8 remarks</span>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <button className="btn-outline" style={{ padding: '4px 8px', border: 'none' }}>&lt;</button>
                        <button className="btn-primary" style={{ padding: '4px 10px', minWidth: '32px' }}>1</button>
                        <button className="btn-outline" style={{ padding: '4px 10px', border: 'none', color: '#64748b' }}>2</button>
                        <button className="btn-outline" style={{ padding: '4px 8px', border: 'none' }}>&gt;</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RemarkManagement;
