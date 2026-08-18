import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaSearch, FaPlus, FaEye, FaPen, FaTrash } from 'react-icons/fa';
import './StudentList.css'; // Reusing the same CSS for consistency

const MOCK_CLASSES = [
    { id: '1', name: '6th', section: 'A', teacher: 'Amit Mehta', students: '45', status: 'Active' },
    { id: '2', name: '7th', section: 'A', teacher: 'Neha Verma', students: '42', status: 'Active' },
    { id: '3', name: '8th', section: 'A', teacher: 'Sneha Iyer', students: '40', status: 'Active' },
    { id: '4', name: '9th', section: 'A', teacher: 'Priya Sharma', students: '44', status: 'Active' },
    { id: '5', name: '10th', section: 'A', teacher: 'Rahul Kumar', students: '42', status: 'Active' },
    { id: '6', name: '11th', section: 'B', teacher: 'Rohit Singh', students: '40', status: 'Active' }
];

const ClassesList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    return (
        <div className="student-list-page">
            <div className="page-header-row">
                <div className="page-header-left">
                    <h1 className="page-title">Classes</h1>
                    <div className="breadcrumbs">
                        <Link to="/admin/dashboard" className="crumb-link">Dashboard</Link>
                        <span className="crumb-separator">&gt;</span>
                        <span className="current-crumb">Classes</span>
                    </div>
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
                        {MOCK_CLASSES.map(cls => (
                            <tr key={cls.id} className="clickable-row">
                                <td className="fw-500">{cls.name}</td>
                                <td>{cls.section}</td>
                                <td>{cls.teacher}</td>
                                <td>{cls.students}</td>
                                <td>
                                    <span className={`status-badge status-${cls.status.toLowerCase()}`}>
                                        {cls.status}
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
                    <span className="pagination-info">Showing 1 to 6 of 32 results</span>
                    <div className="pagination-controls">
                        <button className="page-btn disabled">&lt;</button>
                        <button className="page-btn active">1</button>
                        <button className="page-btn">2</button>
                        <button className="page-btn">3</button>
                        <span className="page-dots">...</span>
                        <button className="page-btn">6</button>
                        <button className="page-btn">&gt;</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClassesList;
