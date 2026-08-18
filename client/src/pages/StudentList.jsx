import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaPlus, FaEye, FaPen, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './StudentList.css';

const MOCK_STUDENTS = [
    { id: '#S001', name: 'Aarav Sharma', classSec: '10-A', rollNo: '1023', parents: 'Rajesh Kumar', status: 'Active', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
    { id: '#S002', name: 'Isha Patel', classSec: '10-A', rollNo: '1024', parents: 'Sanjay Patel', status: 'Active', avatar: 'IP' },
    { id: '#S003', name: 'Rohan Gupta', classSec: '9-B', rollNo: '9045', parents: 'Amit Gupta', status: 'Inactive', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { id: '#S004', name: 'Meera Singh', classSec: '10-B', rollNo: '1056', parents: 'Vikram Singh', status: 'Pending', avatar: 'MS' },
    { id: '#S005', name: 'Kabir Khan', classSec: '8-A', rollNo: '8012', parents: 'Imran Khan', status: 'Active', avatar: 'https://randomuser.me/api/portraits/women/68.jpg' },
];

const StudentList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterClass, setFilterClass] = useState('');
    const [filterSection, setFilterSection] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const navigate = useNavigate();

    const filteredStudents = MOCK_STUDENTS.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || student.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesClass = filterClass ? student.classSec.startsWith(filterClass) : true;
        const matchesSection = filterSection ? student.classSec.endsWith(filterSection) : true;
        const matchesStatus = filterStatus ? student.status === filterStatus : true;
        return matchesSearch && matchesClass && matchesSection && matchesStatus;
    });

    const clearFilters = () => {
        setSearchTerm('');
        setFilterClass('');
        setFilterSection('');
        setFilterStatus('');
    };

    const handleRowClick = (studentId) => {
        // Remove the '#' before navigating
        const id = studentId.replace('#', '');
        navigate(`/admin/students/${id}`);
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
                        <option value="10">Class 10</option>
                        <option value="9">Class 9</option>
                        <option value="8">Class 8</option>
                    </select>
                    <select className="filter-select" value={filterSection} onChange={(e) => setFilterSection(e.target.value)}>
                        <option value="">Section</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                    </select>
                    <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="">Status</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Pending">Pending</option>
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
                                <td className="text-secondary">{student.id}</td>
                                <td>
                                    <div className="student-name-cell">
                                        {student.avatar.length > 2 ? (
                                            <img src={student.avatar} alt={student.name} className="table-avatar" />
                                        ) : (
                                            <div className="table-avatar-placeholder" style={{ backgroundColor: student.status === 'Pending' ? '#be123c' : '#818cf8' }}>
                                                {student.avatar}
                                            </div>
                                        )}
                                        <span className="fw-500">{student.name}</span>
                                    </div>
                                </td>
                                <td>{student.classSec}</td>
                                <td>{student.rollNo}</td>
                                <td>{student.parents}</td>
                                <td>
                                    <span className={`status-badge status-${student.status.toLowerCase()}`}>
                                        {student.status}
                                    </span>
                                </td>
                                <td className="text-right">
                                    <div className="action-buttons-group">
                                        <button className="action-btn-icon text-blue" onClick={(e) => { e.stopPropagation(); navigate(`/admin/students/${student.id.replace('#', '')}`); }}>
                                            <FaEye />
                                        </button>
                                        <button className="action-btn-icon text-gray" onClick={(e) => { e.stopPropagation(); navigate(`/admin/students/${student.id.replace('#', '')}/edit`); }}>
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
