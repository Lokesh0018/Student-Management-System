import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import './Management.css';

const MarkManagement = () => {
    const [exams, setExams] = useState([]);
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [filters, setFilters] = useState({ exam_id: '', class_id: '' });
    const [marksData, setMarksData] = useState({}); // { student_id: { marks_obtained, max_marks, remarks } }
    
    const fetchDropdowns = async () => {
        try {
            const [e, c] = await Promise.all([
                api.get('/exams'),
                api.get('/classes')
            ]);
            setExams(e.data.data);
            setClasses(c.data.data);
        } catch (error) {
            console.error('Error fetching dropdowns', error);
        }
    };

    useEffect(() => {
        fetchDropdowns();
    }, []);

    const fetchStudentsAndMarks = async () => {
        if (!filters.exam_id || !filters.class_id) return;
        
        try {
            const [studentsRes, marksRes] = await Promise.all([
                api.get('/students'),
                api.get(`/marks?exam_id=${filters.exam_id}&class_id=${filters.class_id}`)
            ]);
            
            const classStudents = studentsRes.data.data.filter(s => s.class_id == filters.class_id);
            setStudents(classStudents);
            
            const existingMarks = {};
            marksRes.data.data.forEach(m => {
                existingMarks[m.student_id] = {
                    marks_obtained: m.marks_obtained,
                    max_marks: m.max_marks || 100,
                    remarks: m.remarks || ''
                };
            });
            
            // Initialize empty rows for students without marks
            classStudents.forEach(s => {
                if (!existingMarks[s.id]) {
                    existingMarks[s.id] = { marks_obtained: '', max_marks: 100, remarks: '' };
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

    const handleSaveMarks = async () => {
        const payload = Object.keys(marksData).map(studentId => ({
            student_id: studentId,
            exam_id: filters.exam_id,
            marks_obtained: marksData[studentId].marks_obtained,
            max_marks: marksData[studentId].max_marks,
            remarks: marksData[studentId].remarks
        })).filter(m => m.marks_obtained !== '');

        if (payload.length === 0) {
            alert('No marks entered to save.');
            return;
        }

        try {
            await api.post('/marks', { marksData: payload });
            alert('Marks saved successfully!');
            fetchStudentsAndMarks();
        } catch (error) {
            console.error('Error saving marks', error);
            alert('Failed to save marks.');
        }
    };

    return (
        <Layout>
            <div className="management-container" style={{flexDirection: 'column'}}>
                <div className="form-panel" style={{display: 'flex', gap: '1rem', alignItems: 'flex-end'}}>
                    <div className="form-group" style={{marginBottom: 0, flex: 1}}>
                        <label>Exam</label>
                        <select value={filters.exam_id} onChange={e => setFilters({...filters, exam_id: e.target.value})}>
                            <option value="">Select Exam</option>
                            {exams.map(e => <option key={e.id} value={e.id}>{e.exam_name}</option>)}
                        </select>
                    </div>
                    <div className="form-group" style={{marginBottom: 0, flex: 1}}>
                        <label>Class</label>
                        <select value={filters.class_id} onChange={e => setFilters({...filters, class_id: e.target.value})}>
                            <option value="">Select Class</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}-{c.section}</option>)}
                        </select>
                    </div>
                    <button className="btn-primary" onClick={fetchStudentsAndMarks}>Load Students</button>
                </div>
                
                {students.length > 0 && (
                    <div className="list-panel">
                        <h3>Enter Marks</h3>
                        <div className="table-responsive">
                            <table className="crud-table">
                                <thead>
                                    <tr>
                                        <th>Roll No</th>
                                        <th>Name</th>
                                        <th>Marks Obtained</th>
                                        <th>Max Marks</th>
                                        <th>Remarks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map(s => (
                                        <tr key={s.id}>
                                            <td>{s.roll_number}</td>
                                            <td>{s.first_name} {s.last_name}</td>
                                            <td>
                                                <input 
                                                    type="number" 
                                                    value={marksData[s.id]?.marks_obtained || ''} 
                                                    onChange={e => handleMarkChange(s.id, 'marks_obtained', e.target.value)}
                                                    style={{width: '80px'}}
                                                />
                                            </td>
                                            <td>
                                                <input 
                                                    type="number" 
                                                    value={marksData[s.id]?.max_marks || 100} 
                                                    onChange={e => handleMarkChange(s.id, 'max_marks', e.target.value)}
                                                    style={{width: '80px'}}
                                                />
                                            </td>
                                            <td>
                                                <input 
                                                    type="text" 
                                                    value={marksData[s.id]?.remarks || ''} 
                                                    onChange={e => handleMarkChange(s.id, 'remarks', e.target.value)}
                                                    placeholder="Optional remarks"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div style={{marginTop: '1.5rem', textAlign: 'right'}}>
                            <button className="btn-primary" onClick={handleSaveMarks}>Save All Marks</button>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default MarkManagement;
