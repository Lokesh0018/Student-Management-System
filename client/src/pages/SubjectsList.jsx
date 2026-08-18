import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaSearch, FaPlus, FaEye, FaPen, FaTrash } from 'react-icons/fa';
import './StudentList.css'; 

const MOCK_SUBJECTS = [
    { id: '1', name: 'Mathematics', code: 'MATH', classes: '6', teachers: '3', status: 'Active' },
    { id: '2', name: 'Science', code: 'SCI', classes: '6', teachers: '3', status: 'Active' },
    { id: '3', name: 'English', code: 'ENG', classes: '8', teachers: '2', status: 'Active' },
    { id: '4', name: 'Social Studies', code: 'SST', classes: '6', teachers: '2', status: 'Active' },
    { id: '5', name: 'Computer Science', code: 'CS', classes: '6', teachers: '2', status: 'Active' },
    { id: '6', name: 'Hindi', code: 'HIN', classes: '6', teachers: '2', status: 'Active' },
    { id: '7', name: 'Physics', code: 'PHY', classes: '4', teachers: '1', status: 'Active' }
];

const SubjectsList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const filteredSubjects = MOCK_SUBJECTS.filter(sub => 
        sub.name.toLowerCase().includes(searchTerm.toLowerCase()) || sub.code.toLowerCase().includes(searchTerm.toLowerCase())
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
                            <th>TOTAL CLASSES</th>
                            <th>TOTAL TEACHERS</th>
                            <th>STATUS</th>
                            <th className="text-right">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSubjects.map(sub => (
                            <tr key={sub.id} className="clickable-row">
                                <td className="fw-500">{sub.name}</td>
                                <td>{sub.code}</td>
                                <td>{sub.classes}</td>
                                <td>{sub.teachers}</td>
                                <td>
                                    <span className={`status-badge status-${sub.status.toLowerCase()}`}>
                                        {sub.status}
                                    </span>
                                </td>
                                <td className="text-right">
                                    <div className="action-buttons-group">
                                        <button className="action-btn-icon text-blue">
                                            <FaEye />
                                        </button>
                                        <button className="action-btn-icon text-gray">
                                            <FaPen />
                                        </button>
                                        <button className="action-btn-icon text-red">
                                            <FaTrash />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                <div className="pagination-footer">
                    <span className="pagination-info">Showing 1 to 7 of 12 results</span>
                    <div className="pagination-controls">
                        <button className="page-btn disabled">&lt;</button>
                        <button className="page-btn active">1</button>
                        <button className="page-btn">2</button>
                        <button className="page-btn">&gt;</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubjectsList;
