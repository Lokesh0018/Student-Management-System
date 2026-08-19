import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './css/StudentList.css';
import './css/StudentList.css';

const MarkManagement = () => {
    const { user } = useAuth();
    const isTeacher = user?.role === 'CLASS_TEACHER';
    const [exams, setExams] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [filters, setFilters] = useState({ exam_id: '', subject_id: '', class_id: '' });
    const [marksData, setMarksData] = useState({}); // { student_id: marks_obtained }
    const [maxMarks, setMaxMarks] = useState(100);
    
    // Notification state
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    
    const fetchDropdowns = async () => {
        try {
            const promises = [api.get('/exams'), api.get('/subjects')];
            if (!isTeacher) {
                promises.push(api.get('/classes'));
            }
            
            const [e, s, c] = await Promise.all(promises);
            setExams(e.data.data);
            setSubjects(s.data.data);
            if (!isTeacher && c) {
                setClasses(c.data.data);
            }
        } catch (error) {
            console.error('Error fetching dropdowns', error);
        }
    };

    useEffect(() => {
        fetchDropdowns();
    }, []);

    useEffect(() => {
        const fetchStudentsAndMarks = async () => {
            if (!filters.exam_id || !filters.subject_id) {
                setStudents([]);
                return;
            }
            if (!isTeacher && !filters.class_id) {
                setStudents([]);
                return;
            }
            
            try {
                const res = await api.get(`/marks?exam_id=${filters.exam_id}&subject_id=${filters.subject_id}&class_id=${filters.class_id}`);
                
                const fetchedStudents = res.data.data.map(item => ({
                    id: item.student_id,
                    first_name: item.first_name,
                    last_name: item.last_name,
                    roll_number: item.roll_number
                }));
                
                setStudents(fetchedStudents);
                
                const existingMarks = {};
                res.data.data.forEach(s => {
                    if (s.marks_obtained !== null && s.marks_obtained !== undefined && s.marks_obtained !== '') {
                        existingMarks[s.student_id] = s.marks_obtained;
                    }
                });
                setMarksData(existingMarks);
            } catch (error) {
                console.error('Error fetching marks', error);
                showNotification('Failed to load students and marks.', 'error');
            }
        };

        fetchStudentsAndMarks();
    }, [filters.exam_id, filters.subject_id, filters.class_id, isTeacher]);

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

    const handleSaveMarks = async () => {
        const payload = students.map(s => ({
            student_id: s.id,
            exam_id: filters.exam_id,
            subject_id: filters.subject_id,
            marks_obtained: marksData[s.id] || '',
            max_marks: maxMarks,
            remarks: ''
        }));
        
        try {
            await api.post('/marks', { marksData: payload });
            showNotification('Marks saved successfully!', 'success');
        } catch (error) {
            console.error('Error saving marks', error);
            showNotification('Failed to save marks.', 'error');
        }
    };

    return (
        <div className="student-list-page">
            <div className="page-header-row" style={{ marginBottom: '24px' }}>
                <div className="page-header-left">
                    <h1 className="page-title">Enter Marks</h1>
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
                        {!isTeacher && (
                            <div className="form-group" style={{ marginBottom: 0, width: '200px' }}>
                                <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '8px', display: 'block' }}>Select Class</label>
                                <select className="filter-select" style={{ width: '100%' }} value={filters.class_id} onChange={e => setFilters({...filters, class_id: e.target.value})}>
                                    <option value="">Select Class</option>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}-{c.section}</option>)}
                                </select>
                            </div>
                        )}
                        <div className="form-group" style={{ marginBottom: 0, width: '200px' }}>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '8px', display: 'block' }}>Select Exam</label>
                            <select className="filter-select" style={{ width: '100%' }} value={filters.exam_id} onChange={e => setFilters({...filters, exam_id: e.target.value})}>
                                <option value="">Select Exam</option>
                                {exams.map(e => <option key={e.id} value={e.id}>{e.exam_name}</option>)}
                            </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0, width: '200px' }}>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '8px', display: 'block' }}>Select Subject</label>
                            <select className="filter-select" style={{ width: '100%' }} value={filters.subject_id} onChange={e => setFilters({...filters, subject_id: e.target.value})}>
                                <option value="">Select Subject</option>
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
