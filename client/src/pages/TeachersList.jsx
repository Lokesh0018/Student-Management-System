import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaSearch, FaPlus, FaEye, FaPen, FaTrash } from 'react-icons/fa';
import api from '../utils/api';
import './css/StudentList.css'; // Reusing the same CSS for consistency

const TeachersList = () => {
    const [teachers, setTeachers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSubject, setFilterSubject] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [teacherToDelete, setTeacherToDelete] = useState(null);
    const navigate = useNavigate();

    const fetchTeachers = async () => {
        try {
            const res = await api.get('/teachers');
            setTeachers(res.data.data);
        } catch (error) {
            console.error('Error fetching teachers', error);
        }
    };

    useEffect(() => {
        fetchTeachers();
    }, []);

    const openDeleteModal = (e, id) => {
        e.stopPropagation();
        setTeacherToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!teacherToDelete) return;
        try {
            await api.delete(`/teachers/${teacherToDelete}`);
            fetchTeachers();
            setIsDeleteModalOpen(false);
            setTeacherToDelete(null);
        } catch (error) {
            console.error('Error deleting teacher', error);
            alert("Failed to delete teacher");
        }
    };

    const filteredTeachers = teachers.filter(teacher => {
        const matchesSearch = teacher.name?.toLowerCase().includes(searchTerm.toLowerCase()) || String(teacher.id).includes(searchTerm);
        const matchesSubject = filterSubject ? teacher.department === filterSubject : true;
        return matchesSearch && matchesSubject;
    });

    const handleRowClick = (teacherId) => {
        navigate(`/admin/teachers/${teacherId}`);
    };

    const getTeacherAvatar = (name) => {
        const names = String(name).trim().split(" ");
        if(names.length > 1){
            return names[0].charAt(0) + names[1].charAt(0);
        }else if(names.length === 1){
            return names[0].charAt(0);
        }else{
            return "T";
        }
    };

    const availableDepartments = [...new Set(teachers.map(t => t.department).filter(Boolean))].sort();

    return (
        <div className="student-list-page">
            <div className="page-header-row">
                <div className="page-header-left">
                    <h1 className="page-title">Teachers</h1>
                    </div>
                <button className="btn-primary" onClick={() => navigate('/admin/teachers/add')}>
                    <FaPlus /> Add Teacher
                </button>
            </div>

            <div className="filter-card">
                <div className="search-input-wrap">
                    <FaSearch className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search teachers by name..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-dropdowns">
                    <select className="filter-select" value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
                        <option value="">All Departments</option>
                        {availableDepartments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="table-card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>NAME</th>
                            <th>EMAIL</th>
                            <th>DEPARTMENT</th>
                            <th>PHONE</th>
                            <th className="text-right">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTeachers.map(teacher => (
                            <tr key={teacher.id} onClick={() => handleRowClick(teacher.id)} className="clickable-row">
                                <td className="text-secondary">{teacher.id}</td>
                                <td>
                                    <div className="student-name-cell">
                                        <div className="table-avatar-placeholder" style={{ backgroundColor: '#818cf8' }}>
                                            {getTeacherAvatar(teacher.name)}
                                        </div>
                                        <span className="fw-500">{teacher.name}</span>
                                    </div>
                                </td>
                                <td>{teacher.email}</td>
                                <td>{teacher.department || '-'}</td>
                                <td>{teacher.phone || '-'}</td>
                                <td className="text-right">
                                    <div className="action-buttons-group">
                                        <button className="action-btn-icon text-blue" onClick={(e) => { e.stopPropagation(); navigate(`/admin/teachers/${teacher.id}`); }}>
                                            <FaEye />
                                        </button>
                                        <button className="action-btn-icon text-gray" onClick={(e) => { e.stopPropagation(); navigate(`/admin/teachers/${teacher.id}/edit`); }}>
                                            <FaPen />
                                        </button>
                                        <button className="action-btn-icon text-red" onClick={(e) => openDeleteModal(e, teacher.id)}>
                                            <FaTrash />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                <div className="pagination-footer">
                    <span className="pagination-info">Showing {filteredTeachers.length} results</span>
                </div>
            </div>

            {isDeleteModalOpen && (
                <div className="modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Confirm Deletion</h3>
                        <p>Are you sure you want to delete this teacher? This action cannot be undone.</p>
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

export default TeachersList;
