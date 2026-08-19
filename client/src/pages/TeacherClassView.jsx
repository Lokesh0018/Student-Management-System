import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaEye, FaPen, FaPlus, FaTrash } from 'react-icons/fa';
import api from '../utils/api';
import toast from 'react-hot-toast';
import StudentImage from '../components/StudentImage';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import './css/StudentList.css';

const TeacherClassView = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sectionFilter, setSectionFilter] = useState('');
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

    const getMockScore = (id) => {
        // Generating some mock stats based on ID to simulate the design
        const num = ((id || 1) * 17) % 100;
        if (num < 65) return { att: 72 + ((id || 1)%10), score: 62 + ((id || 1)%10), status: 'Needs Attention', color: '#f59e0b', bg: '#fffbeb', filterVal: 'needs_attention' };
        if (num < 85) return { att: 90 + ((id || 1)%5), score: 82 + ((id || 1)%8), status: 'Good', color: '#16a34a', bg: '#f0fdf4', filterVal: 'good' };
        return { att: 96 + ((id || 1)%4), score: 90 + ((id || 1)%10), status: 'Excellent', color: '#3b82f6', bg: '#eff6ff', filterVal: 'excellent' };
    };

    const filteredStudents = students.filter((student, index) => {
        const name = `${student.first_name} ${student.last_name}`;
        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              String(student.roll_number).toLowerCase().includes(searchTerm.toLowerCase());
                              
        const mockData = getMockScore(student.id || index);
        const matchesStatus = statusFilter === '' || mockData.filterVal === statusFilter;

        return matchesSearch && matchesStatus;
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
            toast.error(error.response?.data?.message || "Failed to delete student");
        }
    };

    return (
        <div className="student-list-page">
            <div className="page-header-row" style={{ marginBottom: '24px' }}>
                <div className="page-header-left">
                    <h1 className="page-title">My Class Students</h1>
                </div>
            </div>

            <div className="table-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 24px', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div className="search-input-wrap" style={{ margin: 0, width: '250px' }}>
                            <FaSearch className="search-icon" />
                            <input 
                                type="text" 
                                placeholder="Search students..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        <select className="filter-select" style={{ minWidth: '120px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="">All Status</option>
                            <option value="needs_attention">Needs Attention</option>
                            <option value="good">Good</option>
                            <option value="excellent">Excellent</option>
                        </select>
                    </div>
                    
                    <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => navigate('/teacher/students/add')}>
                        <FaPlus /> Add Student
                    </button>
                </div>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Roll No.</th>
                            <th>Name</th>
                            <th>Section</th>
                            <th>Attendance</th>
                            <th>Average Score</th>
                            <th>Status</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            Array(5).fill(0).map((_, i) => (
                                <tr key={`skeleton-${i}`}>
                                    <td><Skeleton width={50} /></td>
                                    <td><Skeleton width={120} /></td>
                                    <td><Skeleton width={40} /></td>
                                    <td><Skeleton width={60} /></td>
                                    <td><Skeleton width={60} /></td>
                                    <td><Skeleton width={80} /></td>
                                    <td><Skeleton width={60} /></td>
                                </tr>
                            ))
                        ) : filteredStudents.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center" style={{ padding: '32px' }}>
                                    <p className="text-secondary">No students found.</p>
                                </td>
                            </tr>
                        ) : (
                            filteredStudents.map((student, index) => {
                                const mockData = getMockScore(student.id || index);
                                return (
                                    <tr key={student.id} className="clickable-row" onClick={() => navigate(`/teacher/students/${student.id}`)}>
                                        <td data-label="Roll No." className="fw-500">{1001 + index}</td>
                                        <td data-label="Name">
                                            <div className="student-name-cell" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                {student.photo ? (
                                                    <StudentImage 
                                                        studentId={student.id} 
                                                        studentName={`${student.first_name}`} 
                                                        className="table-avatar" 
                                                        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <div className="table-avatar-placeholder" style={{ backgroundColor: '#818cf8', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '12px' }}>
                                                        {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                                                    </div>
                                                )}
                                                <span className="fw-500 text-primary">{student.first_name} {student.last_name}</span>
                                            </div>
                                        </td>
                                        <td data-label="Section">{student.section || 'A'}</td>
                                        <td data-label="Attendance">{mockData.att}%</td>
                                        <td data-label="Average Score">{mockData.score}%</td>
                                        <td data-label="Status">
                                            <span style={{ 
                                                color: mockData.color, 
                                                fontWeight: '600',
                                                fontSize: '12px',
                                                padding: '4px 8px',
                                                borderRadius: '4px'
                                            }}>
                                                {mockData.status}
                                            </span>
                                        </td>
                                        <td data-label="Actions" className="text-right">
                                            <div className="action-buttons-group">
                                                <button className="action-btn-icon text-blue" onClick={(e) => { e.stopPropagation(); navigate(`/teacher/students/${student.id}`); }}>
                                                    <FaEye />
                                                </button>
                                                <button className="action-btn-icon text-blue" onClick={(e) => { e.stopPropagation(); navigate(`/teacher/students/${student.id}/edit`); }}>
                                                    <FaPen />
                                                </button>
                                                <button className="action-btn-icon text-red" onClick={(e) => openDeleteModal(e, student.id)}>
                                                    <FaTrash />
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
                    <span className="pagination-info">Showing {filteredStudents.length} students</span>
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

export default TeacherClassView;
