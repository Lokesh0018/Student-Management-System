import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaSearch, FaPlus, FaEye, FaPen, FaTrash } from 'react-icons/fa';
import api from '../utils/api';
import './css/StudentList.css'; // Reusing the same CSS for consistency

const ClassesList = () => {
    const [classes, setClasses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [classToDelete, setClassToDelete] = useState(null);
    const navigate = useNavigate();

    const fetchClasses = async () => {
        try {
            const res = await api.get('/classes');
            if (res.data.success) {
                setClasses(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
        }
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    const openDeleteModal = (e, id) => {
        e.stopPropagation();
        setClassToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!classToDelete) return;
        try {
            await api.delete(`/classes/${classToDelete}`);
            fetchClasses();
            setIsDeleteModalOpen(false);
            setClassToDelete(null);
        } catch (error) {
            console.error('Error deleting class:', error);
            alert('Failed to delete class');
        }
    };

    const handleRowClick = (classId) => {
        navigate(`/admin/classes/${classId}`);
    };

    return (
        <div className="student-list-page">
            <div className="page-header-row">
                <div className="page-header-left">
                    <h1 className="page-title">Classes</h1>
                    </div>
                <button className="btn-primary" onClick={() => navigate('/admin/classes/add')}>
                    <FaPlus /> Add Class
                </button>
            </div>

            <div className="filter-card">
                <div className="search-input-wrap">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search classes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>CLASS</th>
                            <th>SECTION</th>
                            <th>CLASS TEACHER</th>
                            <th>STUDENTS</th>
                            <th>STATUS</th>
                            <th className="text-right">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {classes.map(cls => (
                            <tr key={cls.id} onClick={() => handleRowClick(cls.id)} className="clickable-row">
                                <td className="fw-500">{cls.class_name}</td>
                                <td>{cls.section}</td>
                                <td>{cls.teacher_name || '-'}</td>
                                <td>{cls.student_count || '0'}</td>
                                <td>
                                    <span className={`status-badge status-${(cls.status || 'Active').toLowerCase()}`}>
                                        {cls.status || 'Active'}
                                    </span>
                                </td>
                                <td className="text-right">
                                    <div className="action-buttons-group">
                                        <button className="action-btn-icon text-blue" onClick={(e) => { e.stopPropagation(); navigate(`/admin/classes/${cls.id}`); }}>
                                            <FaEye />
                                        </button>
                                        <button className="action-btn-icon text-gray" onClick={(e) => { e.stopPropagation(); navigate(`/admin/classes/${cls.id}/edit`); }}>
                                            <FaPen />
                                        </button>
                                        <button className="action-btn-icon text-red" onClick={(e) => openDeleteModal(e, cls.id)}>
                                            <FaTrash />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {classes.length === 0 && (
                    <div className="empty-state">
                        <p>No classes found.</p>
                    </div>
                )}

                <div className="pagination-footer">
                    <span className="pagination-info">Showing {classes.length} results</span>
                    {/* Pagination controls hidden until backend supports it */}
                </div>
            </div>

            {isDeleteModalOpen && (
                <div className="modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Confirm Deletion</h3>
                        <p>Are you sure you want to delete this class? This action cannot be undone.</p>
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

export default ClassesList;