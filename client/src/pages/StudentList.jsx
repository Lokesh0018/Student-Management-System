import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaSearch, FaPlus, FaEye, FaPen, FaTrash } from 'react-icons/fa';
import api from '../utils/api';
import StudentImage from '../components/StudentImage';
import toast from 'react-hot-toast';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import './css/StudentList.css';

const SESSION_CACHE_BUSTER = Date.now();

const StudentList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterClass, setFilterClass] = useState('');
    const [filterSection, setFilterSection] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const fetchStudents = async () => {
        try {
            setIsLoading(true);
            const res = await api.get('/students');
            if (res.data.success) {
                setStudents(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching students:", error);
            toast.error("Failed to load students");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const filteredStudents = students.filter(student => {
        const name = `${student.first_name} ${student.last_name}`;
        const className = `${student.class_name || ''} ${student.section || ''}`.trim();
        
        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              String(student.admission_number).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesClass = filterClass ? student.class_id == filterClass : true;
        // Skipping section and status filters since DB doesn't fully track them yet
        return matchesSearch && matchesClass;
    });

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);

    const openDeleteModal = (e, id) => {
        e.stopPropagation();
        setStudentToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!studentToDelete) return;
        try {
            await api.delete(`/students/${studentToDelete}`);
            fetchStudents();
            setIsDeleteModalOpen(false);
            setStudentToDelete(null);
            toast.success("Student deleted successfully");
        } catch (error) {
            console.error("Error deleting student:", error);
            toast.error("Failed to delete student");
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFilterClass('');
        setFilterSection('');
        setFilterStatus('');
    };

    const handleRowClick = (studentId) => {
        navigate(`/admin/students/${studentId}`);
    };

    const uniqueClasses = [];
    const classMap = new Map();
    students.forEach(s => {
        if (s.class_id && !classMap.has(s.class_id)) {
            classMap.set(s.class_id, true);
            uniqueClasses.push({ id: s.class_id, name: s.class_name });
        }
    });
    uniqueClasses.sort((a, b) => String(a.name).localeCompare(String(b.name)));

    return (
        <div className="student-list-page">
            <div className="page-header-row">
                <div className="page-header-left">
                    <h1 className="page-title">Students</h1>
                </div>
                <button className="btn-primary" onClick={() => navigate('/admin/students/add')}>
                    <FaPlus /> Add Student
                </button>
            </div>

            <div className="filter-card">
                <div className="search-input-wrap">
                    <FaSearch className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search students by name, ID..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-dropdowns">
                    <select className="filter-select" value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
                        <option value="">Class</option>
                        {uniqueClasses.map(c => (
                            <option key={c.id} value={c.id}>Class {c.name}</option>
                        ))}
                    </select>
                    <button className="btn-clear-filters" onClick={clearFilters}>Clear Filters</button>
                </div>
            </div>

            <div className="table-card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>STUDENT NAME</th>
                            <th>CLASS/SEC</th>
                            <th>ROLL NO.</th>
                            <th>PARENTS</th>
                            <th>STATUS</th>
                            <th className="text-right">ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            Array(5).fill(0).map((_, i) => (
                                <tr key={`skeleton-${i}`}>
                                    <td><Skeleton width={50} /></td>
                                    <td>
                                        <div className="student-name-cell">
                                            <Skeleton circle width={32} height={32} />
                                            <Skeleton width={120} />
                                        </div>
                                    </td>
                                    <td><Skeleton width={60} /></td>
                                    <td><Skeleton width={80} /></td>
                                    <td><Skeleton width={100} /></td>
                                    <td><Skeleton width={60} /></td>
                                    <td><Skeleton width={80} /></td>
                                </tr>
                            ))
                        ) : filteredStudents.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center" style={{ padding: '32px' }}>
                                    <p className="text-secondary">No students found.</p>
                                </td>
                            </tr>
                        ) : (
                            filteredStudents.map(student => (
                                <tr key={student.id} onClick={() => handleRowClick(student.id)} className="clickable-row">
                                    <td data-label="ID" className="text-secondary">#{student.admission_number}</td>
                                    <td data-label="STUDENT NAME">
                                        <div className="student-name-cell">
                                            {student.photo ? (
                                                <StudentImage 
                                                    studentId={student.id} 
                                                    studentName={`${student.first_name}`} 
                                                    className="table-avatar" 
                                                />
                                            ) : (
                                                <div className="table-avatar-placeholder" style={{ backgroundColor: '#818cf8' }}>
                                                    {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                                                </div>
                                            )}
                                            <span className="fw-500">{student.first_name} {student.last_name}</span>
                                        </div>
                                    </td>
                                    <td data-label="CLASS/SEC">{student.class_name ? `${student.class_name}-${student.section || ''}` : 'N/A'}</td>
                                    <td data-label="ROLL NO.">{student.roll_number}</td>
                                    <td data-label="PARENTS">{student.parent_name || 'N/A'}</td>
                                    <td data-label="STATUS">
                                        <span className="status-badge status-active">
                                            Active
                                        </span>
                                    </td>
                                    <td data-label="ACTION" className="text-right">
                                        <div className="action-buttons-group">
                                            <button className="action-btn-icon text-blue" onClick={(e) => { e.stopPropagation(); navigate(`/admin/students/${student.id}`); }}>
                                                <FaEye />
                                            </button>
                                            <button className="action-btn-icon text-gray" onClick={(e) => { e.stopPropagation(); navigate(`/admin/students/${student.id}/edit`); }}>
                                                <FaPen />
                                            </button>
                                            <button className="action-btn-icon text-red" onClick={(e) => openDeleteModal(e, student.id)}>
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                
                <div className="pagination-footer">
                    <span className="pagination-info">Showing {filteredStudents.length} results</span>
                    {/* Pagination controls hidden until backend supports it */}
                </div>
            </div>

            {isDeleteModalOpen && (
                <div className="modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Confirm Deletion</h3>
                        <p>Are you sure you want to delete this student? This action cannot be undone.</p>
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

export default StudentList;
