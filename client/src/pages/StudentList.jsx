import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaSearch, FaPlus, FaEye, FaPen, FaTrash } from 'react-icons/fa';
import api from '../utils/api';
import './StudentList.css';

const StudentList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterClass, setFilterClass] = useState('');
    const [filterSection, setFilterSection] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [students, setStudents] = useState([]);
    const navigate = useNavigate();

    const fetchStudents = async () => {
        try {
            const res = await api.get('/students');
            if (res.data.success) {
                setStudents(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching students:", error);
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

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this student?")) {
            try {
                await api.delete(`/students/${id}`);
                fetchStudents();
            } catch (error) {
                console.error("Error deleting student:", error);
                alert("Failed to delete student");
            }
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

    return (
        <div className="student-list-page">
            <div className="page-header-row">
                <div className="page-header-left">
                    <h1 className="page-title">Students</h1>
                    <div className="breadcrumbs">
                        <Link to="/admin/dashboard" className="crumb-link">Dashboard</Link>
                        <span className="crumb-separator">&gt;</span>
                        <span className="current-crumb">Students</span>
                    </div>
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
                        <option value="1">Class 10</option>
                        <option value="2">Class 9</option>
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
                        {filteredStudents.map(student => (
                            <tr key={student.id} onClick={() => handleRowClick(student.id)} className="clickable-row">
                                <td className="text-secondary">#{student.admission_number}</td>
                                <td>
                                    <div className="student-name-cell">
                                        {student.photo ? (
                                            <img src={`http://localhost:5000/api/students/${student.id}/photo`} alt={`${student.first_name}`} className="table-avatar" />
                                        ) : (
                                            <div className="table-avatar-placeholder" style={{ backgroundColor: '#818cf8' }}>
                                                {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                                            </div>
                                        )}
                                        <span className="fw-500">{student.first_name} {student.last_name}</span>
                                    </div>
                                </td>
                                <td>{student.class_name ? `${student.class_name}-${student.section || ''}` : 'N/A'}</td>
                                <td>{student.roll_number}</td>
                                <td>N/A</td>
                                <td>
                                    <span className="status-badge status-active">
                                        Active
                                    </span>
                                </td>
                                <td className="text-right">
                                    <div className="action-buttons-group">
                                        <button className="action-btn-icon text-blue" onClick={(e) => { e.stopPropagation(); navigate(`/admin/students/${student.id}`); }}>
                                            <FaEye />
                                        </button>
                                        <button className="action-btn-icon text-gray" onClick={(e) => { e.stopPropagation(); navigate(`/admin/students/${student.id}/edit`); }}>
                                            <FaPen />
                                        </button>
                                        <button className="action-btn-icon text-red" onClick={(e) => handleDelete(e, student.id)}>
                                            <FaTrash />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                <div className="pagination-footer">
                    <span className="pagination-info">Showing 1 to 5 of 45 results</span>
                    <div className="pagination-controls">
                        <button className="page-btn disabled">&lt;</button>
                        <button className="page-btn active">1</button>
                        <button className="page-btn">2</button>
                        <button className="page-btn">3</button>
                        <span className="page-dots">...</span>
                        <button className="page-btn">9</button>
                        <button className="page-btn">&gt;</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentList;
