import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaSearch, FaPlus, FaEye, FaPen, FaTrash } from 'react-icons/fa';
import './StudentList.css'; 

const MOCK_EXAMS = [
    { id: '1', name: 'Unit Test - 1', type: 'Unit Test', classes: '6th - 12th', startDate: '24 May 2024', endDate: '29 May 2024', status: 'Upcoming' },
    { id: '2', name: 'Mid Term Exam', type: 'Mid Term', classes: '6th - 12th', startDate: '10 Jun 2024', endDate: '15 Jun 2024', status: 'Upcoming' },
    { id: '3', name: 'Quarterly Exam', type: 'Quarterly', classes: '6th - 12th', startDate: '22 Jun 2024', endDate: '27 Jun 2024', status: 'Upcoming' },
    { id: '4', name: 'Half Yearly Exam', type: 'Half Yearly', classes: '6th - 12th', startDate: '05 Sep 2024', endDate: '15 Sep 2024', status: 'Upcoming' },
    { id: '5', name: 'Pre-Final Exam', type: 'Pre-Final', classes: '10th, 12th', startDate: '10 Nov 2024', endDate: '20 Nov 2024', status: 'Upcoming' },
    { id: '6', name: 'Final Exam', type: 'Final', classes: '6th - 12th', startDate: '25 Feb 2025', endDate: '15 Mar 2025', status: 'Upcoming' }
];

const ExaminationsList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

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
                        {MOCK_EXAMS.map(exam => (
                            <tr key={exam.id} className="clickable-row">
                                <td className="fw-500">{exam.name}</td>
                                <td>{exam.type}</td>
                                <td>{exam.classes}</td>
                                <td>{exam.startDate}</td>
                                <td>{exam.endDate}</td>
                                <td>
                                    <span className={`status-badge status-${exam.status.toLowerCase()}`}>
                                        {exam.status}
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
                    <span className="pagination-info">Showing 1 to 6 of 24 results</span>
                    <div className="pagination-controls">
                        <button className="page-btn disabled">&lt;</button>
                        <button className="page-btn active">1</button>
                        <button className="page-btn">2</button>
                        <button className="page-btn">3</button>
                        <span className="page-dots">...</span>
                        <button className="page-btn">4</button>
                        <button className="page-btn">&gt;</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExaminationsList;
