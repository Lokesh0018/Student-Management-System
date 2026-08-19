import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './css/StudentList.css';

const MarkManagement = () => {
    const [exams, setExams] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);
    const [filters, setFilters] = useState({ exam_id: '', subject_id: '' });
    const [marksData, setMarksData] = useState({}); // { student_id: marks_obtained }
    const [maxMarks, setMaxMarks] = useState(100);
    
    // Notification state
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    
    const fetchDropdowns = async () => {
        try {
            const [e, s] = await Promise.all([
                api.get('/exams'),
                api.get('/subjects')
            ]);
            setExams(e.data.data);
            setSubjects(s.data.data);
        } catch (error) {
            console.error('Error fetching dropdowns', error);
        }
    };

    useEffect(() => {
        fetchDropdowns();
    }, []);

    // Load mock students to match the UI state when Exam and Subject are selected
    useEffect(() => {
        if (filters.exam_id && filters.subject_id) {
            // In a real app we'd fetch this based on the logged-in teacher's class
            const mockStudents = [
                { id: 1, roll_number: 1001, first_name: 'Rohan', last_name: 'Mehta' },
                { id: 2, roll_number: 1002, first_name: 'Ananya', last_name: 'Singh' },
                { id: 3, roll_number: 1003, first_name: 'Vivaan', last_name: 'Patel' },
                { id: 4, roll_number: 1004, first_name: 'Kavya', last_name: 'Joshi' },
                { id: 5, roll_number: 1005, first_name: 'Aryan', last_name: 'Verma' },
                { id: 6, roll_number: 1006, first_name: 'Ishita', last_name: 'Sharma' },
                { id: 7, roll_number: 1007, first_name: 'Aditya', last_name: 'Gupta' },
                { id: 8, roll_number: 1008, first_name: 'Meera', last_name: 'Nair' }
            ];
            setStudents(mockStudents);
            
            // Mock previously saved data for the UI
            const mockMarks = {
                1: '65', 2: '68', 3: '72', 4: '88', 5: '90', 6: '85', 7: '92', 8: '95'
            };
            setMarksData(mockMarks);
        } else {
            setStudents([]);
        }
    }, [filters.exam_id, filters.subject_id]);

    const handleMarkChange = (studentId, value) => {
        setMarksData(prev => ({
            ...prev,
            [studentId]: value
        }));
    };
    
    const calculateGrade = (marks) => {
        if (!marks || isNaN(marks)) return '-';
        const num = Number(marks);
        const percent = (num / maxMarks) * 100;
        if (percent >= 90) return 'A+';
        if (percent >= 80) return 'A';
        if (percent >= 70) return 'B+';
        if (percent >= 60) return 'B';
        if (percent >= 50) return 'C';
        if (percent >= 40) return 'D';
        return 'F';
    };

    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };

    const handleSaveMarks = () => {
        // Just show success to match the prototype
        showNotification('Marks saved successfully!', 'success');
    };

    return (
        <div className="student-list-page">
            <div className="page-header-row" style={{ marginBottom: '24px' }}>
                <div className="page-header-left">
                    <h1 className="page-title">Enter Marks</h1>
                    <p className="page-subtitle">Dashboard &gt; Marks &gt; Enter Marks</p>
                </div>
            </div>
            
            {notification.show && (
                <div style={{
                    padding: '12px 24px', 
                    marginBottom: '16px', 
                    borderRadius: '8px',
                    backgroundColor: notification.type === 'success' ? '#dcfce7' : '#fee2e2',
                    color: notification.type === 'success' ? '#16a34a' : '#dc2626',
                    border: `1px solid ${notification.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                    display: 'flex',
                    alignItems: 'center',
                    fontWeight: '500'
                }}>
                    {notification.message}
                </div>
            )}
            
            <div className="table-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 24px', alignItems: 'flex-end', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <div className="form-group" style={{ marginBottom: 0, width: '200px' }}>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '8px', display: 'block' }}>Select Exam</label>
                            <select className="filter-select" style={{ width: '100%' }} value={filters.exam_id} onChange={e => setFilters({...filters, exam_id: e.target.value})}>
                                <option value="">Select Exam</option>
                                <option value="1">Unit Test - 1</option>
                                <option value="2">Mid Term</option>
                                {exams.map(e => <option key={e.id} value={e.id}>{e.exam_name}</option>)}
                            </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0, width: '200px' }}>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '8px', display: 'block' }}>Select Subject</label>
                            <select className="filter-select" style={{ width: '100%' }} value={filters.subject_id} onChange={e => setFilters({...filters, subject_id: e.target.value})}>
                                <option value="">Select Subject</option>
                                <option value="1">Mathematics</option>
                                <option value="2">Science</option>
                                {subjects.map(s => <option key={s.id} value={s.id}>{s.subject_name}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <button className="btn-primary" onClick={handleSaveMarks}>Save Marks</button>
                </div>
                
                {students.length > 0 ? (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Roll No.</th>
                                <th>Student Name</th>
                                <th>Max Marks</th>
                                <th>Marks Obtained</th>
                                <th>Grade</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(s => (
                                <tr key={s.id} className="clickable-row">
                                    <td className="fw-500">{s.roll_number}</td>
                                    <td>
                                        <div className="student-name-cell fw-500 text-primary">
                                            {s.first_name} {s.last_name}
                                        </div>
                                    </td>
                                    <td>{maxMarks}</td>
                                    <td>
                                        <input 
                                            type="text" 
                                            value={marksData[s.id] || ''} 
                                            onChange={e => handleMarkChange(s.id, e.target.value)}
                                            style={{
                                                width: '80px', 
                                                padding: '8px', 
                                                border: '1px solid #e2e8f0', 
                                                borderRadius: '6px',
                                                outline: 'none',
                                                color: '#0f172a',
                                                fontWeight: '500'
                                            }}
                                        />
                                    </td>
                                    <td className="fw-600">{calculateGrade(marksData[s.id])}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
                        Please select an exam and subject to enter marks.
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarkManagement;
