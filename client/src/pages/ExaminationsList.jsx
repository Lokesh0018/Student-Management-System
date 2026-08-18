import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaSearch, FaPlus, FaEye, FaPen, FaTrash } from 'react-icons/fa';
import api from '../utils/api';
import './StudentList.css'; 

const ExaminationsList = () => {
    const [exams, setExams] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [examToDelete, setExamToDelete] = useState(null);
    const navigate = useNavigate();

    const fetchExams = async () => {
        try {
            const res = await api.get('/exams');
            if (res.data.success) {
                setExams(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching exams:', error);
        }
    };

    useEffect(() => {
        fetchExams();
    }, []);

    const openDeleteModal = (e, id) => {
        e.stopPropagation();
        setExamToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!examToDelete) return;
        try {
            await api.delete(`/exams/${examToDelete}`);
            fetchExams();
            setIsDeleteModalOpen(false);
            setExamToDelete(null);
        } catch (error) {
            console.error('Error deleting exam:', error);
            alert('Failed to delete exam');
        }
    };

    const filteredExams = exams.filter(e => 
        e.exam_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="student-list-page">
            <div className="page-header-row">
                <div className="page-header-left">
                    <h1 className="page-title">Examinations</h1>
                    <div className="breadcrumbs">
                        <Link to="/admin/dashboard" className="crumb-link">Dashboard</Link>
                        <span className="crumb-separator">&gt;</span>
                        <span className="current-crumb">Examinations</span>
                    </div>
                </div>
                <button className="btn-primary" onClick={() => navigate('/admin/exams/add')}>
                    <FaPlus /> Add Examination
                </button>
            </div>

            <div className="filter-card">
                <div className="search-input-wrap">
                    <FaSearch className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search exams..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>EXAM NAME</th>
                            <th>TYPE</th>
                            <th>CLASSES</th>
                            <th>START DATE</th>
                            <th>END DATE</th>
                            <th>STATUS</th>
                            <th className="text-right">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredExams.map(exam => (
                            <tr key={exam.id} className="clickable-row">
                                <td className="fw-500">{exam.exam_name}</td>
                                <td>{exam.exam_type || 'Regular'}</td>
                                <td>{exam.class_name ? `${exam.class_name} - ${exam.section}` : 'Common'}</td>
                                <td className="text-secondary">{exam.start_date ? new Date(exam.start_date).toLocaleDateString() : '-'}</td>
                                <td className="text-secondary">{exam.end_date ? new Date(exam.end_date).toLocaleDateString() : '-'}</td>
                                <td>
                                    <span className={`status-badge status-${(exam.status || 'Upcoming').toLowerCase()}`}>
                                        {exam.status || 'Upcoming'}
                                    </span>
                                </td>
                                <td className="text-right">
                                    <div className="action-buttons-group">
                                        <button className="action-btn-icon text-gray" onClick={(e) => { e.stopPropagation(); navigate(`/admin/exams/${exam.id}/edit`); }}>
                                            <FaPen />
                                        </button>
                                        <button className="action-btn-icon text-red" onClick={(e) => openDeleteModal(e, exam.id)}>
                                            <FaTrash />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                <div className="pagination-footer">
                    <span className="pagination-info">Showing {filteredExams.length} results</span>
                </div>
            </div>

            {isDeleteModalOpen && (
                <div className="modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Confirm Deletion</h3>
                        <p>Are you sure you want to delete this exam? This action cannot be undone.</p>
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

export default ExaminationsList;
