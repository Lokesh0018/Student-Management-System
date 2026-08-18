import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './StudentList.css';

const MarkManagement = () => {
    const [exams, setExams] = useState([]);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);
    const [filters, setFilters] = useState({ exam_id: '', class_id: '', subject_id: '', max_marks: 100 });
    const [marksData, setMarksData] = useState({}); // { student_id: { marks_obtained, remarks } }
    
    // Notification state
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    
    const fetchDropdowns = async () => {
        try {
            const [e, c, s] = await Promise.all([
                api.get('/exams'),
                api.get('/classes'),
                api.get('/subjects')
            ]);
            setExams(e.data.data);
            setClasses(c.data.data);
            setSubjects(s.data.data);
        } catch (error) {
            console.error('Error fetching dropdowns', error);
        }
    };

    useEffect(() => {
        fetchDropdowns();
    }, []);

    const fetchStudentsAndMarks = async () => {
        if (!filters.exam_id || !filters.class_id || !filters.subject_id) {
            showNotification('Please select Exam, Class, and Subject first.', 'error');
            return;
        }
        
        try {
            const [studentsRes, marksRes] = await Promise.all([
                api.get('/students'),
                api.get(`/marks?exam_id=${filters.exam_id}&class_id=${filters.class_id}&subject_id=${filters.subject_id}`)
            ]);
            
            const classStudents = studentsRes.data.data.filter(s => s.class_id == filters.class_id);
            setStudents(classStudents);
            
            const existingMarks = {};
            marksRes.data.data.forEach(m => {
                existingMarks[m.student_id] = {
                    marks_obtained: m.marks_obtained,
                    remarks: m.remarks || ''
                };
            });
            
            // Initialize empty rows for students without marks
            classStudents.forEach(s => {
                if (!existingMarks[s.id]) {
                    existingMarks[s.id] = { marks_obtained: '', remarks: '' };
                }
            });
            
            setMarksData(existingMarks);
        } catch (error) {
            console.error('Error fetching marks', error);
        }
    };

    const handleMarkChange = (studentId, field, value) => {
        setMarksData(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [field]: value
            }
        }));
    };

    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };

    const handleSaveMarks = async () => {
        const payload = Object.keys(marksData).map(studentId => ({
            student_id: studentId,
            exam_id: filters.exam_id,
            subject_id: filters.subject_id,
            marks_obtained: marksData[studentId].marks_obtained,
            max_marks: filters.max_marks,
            remarks: marksData[studentId].remarks
        }));

        if (payload.length === 0) {
            showNotification('No marks entered to save.', 'error');
            return;
        }

        try {
            await api.post('/marks', { marksData: payload });
            showNotification('Marks saved successfully!', 'success');
            fetchStudentsAndMarks();
        } catch (error) {
            console.error('Error saving marks', error);
            showNotification('Failed to save marks.', 'error');
        }
    };

    return (
        <div className="student-list-page">
            <div className="page-header-row">
                <div className="page-header-left">
                    <h1 className="page-title">Marks Management</h1>
                    <div className="breadcrumbs">
                        <span className="crumb-link">Dashboard</span>
                        <span className="crumb-separator">&gt;</span>
                        <span className="current-crumb">Marks Management</span>
                    </div>
                </div>
            </div>
            
            <div className="filter-card" style={{ gap: '16px', display: 'flex', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '150px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px', display: 'block' }}>Exam</label>
                    <select className="filter-select" style={{ width: '100%' }} value={filters.exam_id} onChange={e => setFilters({...filters, exam_id: e.target.value})}>
                        <option value="">Select Exam</option>
                        {exams.map(e => <option key={e.id} value={e.id}>{e.exam_name}</option>)}
                    </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '150px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px', display: 'block' }}>Class</label>
                    <select className="filter-select" style={{ width: '100%' }} value={filters.class_id} onChange={e => setFilters({...filters, class_id: e.target.value})}>
                        <option value="">Select Class</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}-{c.section}</option>)}
                    </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '150px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px', display: 'block' }}>Subject</label>
                    <select className="filter-select" style={{ width: '100%' }} value={filters.subject_id} onChange={e => setFilters({...filters, subject_id: e.target.value})}>
                        <option value="">Select Subject</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.subject_name}</option>)}
                    </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0, width: '120px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px', display: 'block' }}>Max Marks</label>
                    <input 
                        type="number" 
                        className="filter-select" 
                        style={{ width: '100%' }} 
                        value={filters.max_marks} 
                        onChange={e => setFilters({...filters, max_marks: e.target.value})}
                    />
                </div>
                <button className="btn-primary" onClick={fetchStudentsAndMarks}>
                    Load Students
                </button>
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
            
            {students.length > 0 && (
                <div className="table-card">
                    <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>Enter Marks</h3>
                        <button className="btn-primary" onClick={handleSaveMarks}>Save All Marks</button>
                    </div>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ROLL NO</th>
                                <th>NAME</th>
                                <th>MARKS OBTAINED</th>
                                <th>REMARKS</th>
                                <th className="text-right">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(s => (
                                <tr key={s.id} className="clickable-row">
                                    <td className="fw-500">{s.roll_number}</td>
                                    <td>
                                        <div className="student-name-cell">
                                            {s.first_name} {s.last_name}
                                        </div>
                                    </td>
                                    <td>
                                        <input 
                                            type="number" 
                                            value={marksData[s.id]?.marks_obtained || ''} 
                                            onChange={e => handleMarkChange(s.id, 'marks_obtained', e.target.value)}
                                            style={{width: '120px', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '4px'}}
                                            placeholder={`Out of ${filters.max_marks}`}
                                        />
                                    </td>
                                    <td>
                                        <input 
                                            type="text" 
                                            value={marksData[s.id]?.remarks || ''} 
                                            onChange={e => handleMarkChange(s.id, 'remarks', e.target.value)}
                                            placeholder="Optional remarks"
                                            style={{width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '4px'}}
                                        />
                                    </td>
                                    <td className="text-right">
                                        <button 
                                            className="btn-secondary" 
                                            style={{padding: '4px 8px', fontSize: '12px'}} 
                                            onClick={() => {
                                                handleMarkChange(s.id, 'marks_obtained', '');
                                                handleMarkChange(s.id, 'remarks', '');
                                            }}
                                            title="Clear mark to delete it on save"
                                        >
                                            Clear
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MarkManagement;
