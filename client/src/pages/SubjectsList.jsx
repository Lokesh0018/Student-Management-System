import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaSearch, FaPlus, FaPen, FaTrash } from 'react-icons/fa';
import api from '../utils/api';
import './css/StudentList.css'; 

const SubjectsList = () => {
    const [subjects, setSubjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [subjectToDelete, setSubjectToDelete] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const navigate = useNavigate();

    const fetchSubjects = async () => {
        try {
            const res = await api.get('/subjects');
            if (res.data.success) {
                setSubjects(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, []);

    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };

    const openDeleteModal = (e, id) => {
        e.stopPropagation();
        setSubjectToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!subjectToDelete) return;
        try {
            await api.delete(`/subjects/${subjectToDelete}`);
            fetchSubjects();
            setIsDeleteModalOpen(false);
            setSubjectToDelete(null);
            showNotification('Subject deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting subject:', error);
            showNotification('Failed to delete subject', 'error');
        }
    };

    const filteredSubjects = subjects.filter(sub => 
        sub.subject_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        sub.subject_code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="student-list-page">
            <div className="page-header-row">
                <div className="page-header-left">
                    <h1 className="page-title">Subjects</h1>
                    <div className="breadcrumbs">
                        <Link to="/admin/dashboard" className="crumb-link">Dashboard</Link>
                        <span className="crumb-separator">&gt;</span>
                        <span className="current-crumb">Subjects</span>
                    </div>
                </div>
                <button className="btn-primary" onClick={() => navigate('/admin/subjects/add')}>
                    <FaPlus /> Add Subject
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

            <div className="filter-card">
                <div className="search-input-wrap">
                    <FaSearch className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search subjects..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>SUBJECT</th>
                            <th>CODE</th>
                            <th>TEACHER</th>
                            <th className="text-right">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSubjects.map(sub => (
                            <tr key={sub.id} className="clickable-row">
                                <td className="fw-500">{sub.subject_name}</td>
                                <td>{sub.subject_code}</td>
                                <td>{sub.teacher_name || '-'}</td>
                                <td className="text-right">
                                    <div className="action-buttons-group">
                                        <button className="action-btn-icon text-gray" onClick={(e) => { e.stopPropagation(); navigate(`/admin/subjects/${sub.id}/edit`); }}>
                                            <FaPen />
                                        </button>
                                        <button className="action-btn-icon text-red" onClick={(e) => openDeleteModal(e, sub.id)}>
                                            <FaTrash />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                <div className="pagination-footer">
                    <span className="pagination-info">Showing {filteredSubjects.length} results</span>
                </div>
            </div>

            {isDeleteModalOpen && (
                <div className="modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Confirm Deletion</h3>
                        <p>Are you sure you want to delete this subject? This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
                            <button className="btn-primary" style={{backgroundColor: '#ef4444', borderColor: '#ef4444'}} onClick={confirmDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubjectsList;
