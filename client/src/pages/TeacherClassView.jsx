import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaEye, FaPen, FaPlus } from 'react-icons/fa';
import api from '../utils/api';
import toast from 'react-hot-toast';
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
                // In a real app with backend filtering, we'd only get this teacher's students.
                // For prototype, we will just use the first few to simulate the screenshot
                setStudents(res.data.data.slice(0, 10));
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
        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              String(student.roll_number).toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const getMockScore = (id) => {
        // Generating some mock stats based on ID to simulate the design
        const num = (id * 17) % 100;
        if (num < 65) return { att: 72 + (id%10), score: 62 + (id%10), status: 'Needs Attention', color: '#f59e0b', bg: '#fffbeb' };
        if (num < 85) return { att: 90 + (id%5), score: 82 + (id%8), status: 'Good', color: '#16a34a', bg: '#f0fdf4' };
        return { att: 96 + (id%4), score: 90 + (id%10), status: 'Excellent', color: '#3b82f6', bg: '#eff6ff' };
    };

    return (
        <div className="student-list-page">
            <div className="page-header-row" style={{ marginBottom: '24px' }}>
                <div className="page-header-left">
                    <h1 className="page-title">My Class Students</h1>
                    <p className="page-subtitle">Dashboard &gt; My Class &gt; Students</p>
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
                        
                        <select className="filter-select" style={{ minWidth: '120px' }} value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)}>
                            <option value="">All Sections</option>
                            <option value="A">Section A</option>
                            <option value="B">Section B</option>
                        </select>
                    </div>
                    
                    <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                                    <tr key={student.id} className="clickable-row">
                                        <td data-label="Roll No." className="fw-500">{1001 + index}</td>
                                        <td data-label="Name">
                                            <span className="fw-500 text-primary">{student.first_name} {student.last_name}</span>
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
                                                <button className="action-btn-icon text-blue" onClick={() => navigate(`/admin/students/${student.id}`)}>
                                                    <FaEye />
                                                </button>
                                                <button className="action-btn-icon text-blue" onClick={() => navigate(`/admin/students/${student.id}/edit`)}>
                                                    <FaPen />
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
                    <span className="pagination-info">Showing 1 to {filteredStudents.length} of 42 students</span>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <button className="btn-outline" style={{ padding: '4px 8px', border: 'none' }}>&lt;</button>
                        <button className="btn-primary" style={{ padding: '4px 10px', minWidth: '32px' }}>1</button>
                        <button className="btn-outline" style={{ padding: '4px 10px', border: 'none', color: '#64748b' }}>2</button>
                        <button className="btn-outline" style={{ padding: '4px 10px', border: 'none', color: '#64748b' }}>3</button>
                        <button className="btn-outline" style={{ padding: '4px 10px', border: 'none', color: '#64748b' }}>4</button>
                        <button className="btn-outline" style={{ padding: '4px 10px', border: 'none', color: '#64748b' }}>5</button>
                        <button className="btn-outline" style={{ padding: '4px 8px', border: 'none' }}>&gt;</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherClassView;
