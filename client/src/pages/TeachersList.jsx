import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaSearch, FaPlus, FaEye, FaPen, FaTrash } from 'react-icons/fa';
import './StudentList.css'; // Reusing the same CSS for consistency

const MOCK_TEACHERS = [
    { id: '#T001', name: 'Rahul Kumar', email: 'rahul.k@email.com', subject: 'Mathematics', classes: '10-A, 10-B', status: 'Active', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { id: '#T002', name: 'Priya Sharma', email: 'priya.s@email.com', subject: 'Science', classes: '9-A, 9-B', status: 'Active', avatar: 'https://randomuser.me/api/portraits/women/68.jpg' },
    { id: '#T003', name: 'Amit Mehta', email: 'amit.m@email.com', subject: 'English', classes: '8-A, 8-B', status: 'Active', avatar: 'AM' },
    { id: '#T004', name: 'Neha Verma', email: 'neha.v@email.com', subject: 'Social Studies', classes: '6-A, 7-A', status: 'Inactive', avatar: 'NV' },
    { id: '#T005', name: 'Rohit Singh', email: 'rohit.s@email.com', subject: 'Computer', classes: '9-A, 11-A', status: 'Active', avatar: 'https://randomuser.me/api/portraits/men/46.jpg' },
    { id: '#T006', name: 'Sneha Iyer', email: 'sneha.i@email.com', subject: 'Physics', classes: '11-A, 12-A', status: 'Active', avatar: 'SI' }
];

const TeachersList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSubject, setFilterSubject] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const navigate = useNavigate();

    const filteredTeachers = MOCK_TEACHERS.filter(teacher => {
        const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) || teacher.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSubject = filterSubject ? teacher.subject === filterSubject : true;
        const matchesStatus = filterStatus ? teacher.status === filterStatus : true;
        return matchesSearch && matchesSubject && matchesStatus;
    });

    const handleRowClick = (teacherId) => {
        const id = teacherId.replace('#', '');
        navigate(`/admin/teachers/${id}`);
    };

    return (
        <div className="student-list-page">
            <div className="page-header-row">
                <div className="page-header-left">
                    <h1 className="page-title">Teachers</h1>
                    <div className="breadcrumbs">
                        <Link to="/admin/dashboard" className="crumb-link">Dashboard</Link>
                        <span className="crumb-separator">&gt;</span>
                        <span className="current-crumb">Teachers</span>
                    </div>
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
                        <option value="">All Subjects</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="Science">Science</option>
                        <option value="English">English</option>
                        <option value="Social Studies">Social Studies</option>
                        <option value="Computer">Computer</option>
                        <option value="Physics">Physics</option>
                    </select>
                    <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>
            </div>

            <div className="table-card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>PHOTO &amp; NAME</th>
                            <th>EMAIL</th>
                            <th>SUBJECT</th>
                            <th>CLASSES</th>
                            <th>STATUS</th>
                            <th className="text-right">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTeachers.map(teacher => (
                            <tr key={teacher.id} onClick={() => handleRowClick(teacher.id)} className="clickable-row">
                                <td className="text-secondary">{teacher.id}</td>
                                <td>
                                    <div className="student-name-cell">
                                        {teacher.avatar.length > 2 ? (
                                            <img src={teacher.avatar} alt={teacher.name} className="table-avatar" />
                                        ) : (
                                            <div className="table-avatar-placeholder" style={{ backgroundColor: teacher.status === 'Inactive' ? '#be123c' : '#818cf8' }}>
                                                {teacher.avatar}
                                            </div>
                                        )}
                                        <span className="fw-500">{teacher.name}</span>
                                    </div>
                                </td>
                                <td>{teacher.email}</td>
                                <td>{teacher.subject}</td>
                                <td>{teacher.classes}</td>
                                <td>
                                    <span className={`status-badge status-${teacher.status.toLowerCase()}`}>
                                        {teacher.status}
                                    </span>
                                </td>
                                <td className="text-right">
                                    <div className="action-buttons-group">
                                        <button className="action-btn-icon text-blue" onClick={(e) => { e.stopPropagation(); navigate(`/admin/teachers/${teacher.id.replace('#', '')}`); }}>
                                            <FaEye />
                                        </button>
                                        <button className="action-btn-icon text-gray" onClick={(e) => { e.stopPropagation(); navigate(`/admin/teachers/${teacher.id.replace('#', '')}/edit`); }}>
                                            <FaPen />
                                        </button>
                                        <button className="action-btn-icon text-red" onClick={(e) => { e.stopPropagation(); }}>
                                            <FaTrash />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                <div className="pagination-footer">
                    <span className="pagination-info">Showing 1 to 6 of 68 results</span>
                    <div className="pagination-controls">
                        <button className="page-btn disabled">&lt;</button>
                        <button className="page-btn active">1</button>
                        <button className="page-btn">2</button>
                        <button className="page-btn">3</button>
                        <span className="page-dots">...</span>
                        <button className="page-btn">12</button>
                        <button className="page-btn">&gt;</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeachersList;
