import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import './css/Management.css';

const AttendanceManagement = () => {
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    
    const [filters, setFilters] = useState({ 
        class_id: '', 
        date: new Date().toISOString().split('T')[0] 
    });
    const [attendanceData, setAttendanceData] = useState({}); // { student_id: status }
    
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const res = await api.get('/classes');
                setClasses(res.data.data);
            } catch (error) {
                console.error('Error fetching classes', error);
            }
        };
        fetchClasses();
    }, []);

    const fetchStudentsAndAttendance = async () => {
        if (!filters.class_id || !filters.date) return;
        
        try {
            const res = await api.get(`/attendance?class_id=${filters.class_id}&date=${filters.date}`);
            
            const fetchedStudents = res.data.data.map(item => ({
                id: item.student_id || item.id, // Depending on the JOIN
                first_name: item.first_name,
                last_name: item.last_name,
                roll_number: item.roll_number,
                status: item.status || 'PRESENT' // Default to present if not marked
            }));
            
            // Clean up the data mapping
            // The API returns student details. If attendance exists, it has `status`.
            // We'll standardize this for the UI state.
            
            setStudents(fetchedStudents);
            
            const existingAttendance = {};
            fetchedStudents.forEach(s => {
                existingAttendance[s.id] = s.status;
            });
            setAttendanceData(existingAttendance);

        } catch (error) {
            console.error('Error fetching attendance', error);
        }
    };

    const handleStatusChange = (studentId, status) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const handleSaveAttendance = async () => {
        const payload = Object.keys(attendanceData).map(studentId => ({
            student_id: studentId,
            status: attendanceData[studentId]
        }));

        if (payload.length === 0) {
            alert('No attendance data to save.');
            return;
        }

        try {
            await api.post('/attendance', { 
                class_id: filters.class_id,
                date: filters.date,
                attendanceData: payload 
            });
            alert('Attendance saved successfully!');
            fetchStudentsAndAttendance();
        } catch (error) {
            console.error('Error saving attendance', error);
            alert('Failed to save attendance.');
        }
    };

    const markAll = (status) => {
        const newAttendance = {};
        students.forEach(s => {
            newAttendance[s.id] = status;
        });
        setAttendanceData(newAttendance);
    };

    return (
        <Layout>
            <div className="management-container" style={{flexDirection: 'column'}}>
                <div className="form-panel" style={{display: 'flex', gap: '1rem', alignItems: 'flex-end'}}>
                    <div className="form-group" style={{marginBottom: 0, flex: 1}}>
                        <label>Class</label>
                        <select value={filters.class_id} onChange={e => setFilters({...filters, class_id: e.target.value})}>
                            <option value="">Select Class</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}-{c.section}</option>)}
                        </select>
                    </div>
                    <div className="form-group" style={{marginBottom: 0, flex: 1}}>
                        <label>Date</label>
                        <input type="date" value={filters.date} onChange={e => setFilters({...filters, date: e.target.value})} />
                    </div>
                    <button className="btn-primary" onClick={fetchStudentsAndAttendance}>Load Students</button>
                </div>
                
                {students.length > 0 && (
                    <div className="list-panel">
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                            <h3 style={{margin: 0}}>Mark Attendance</h3>
                            <div>
                                <button className="btn-secondary" style={{marginRight: '0.5rem'}} onClick={() => markAll('PRESENT')}>Mark All Present</button>
                                <button className="btn-secondary" onClick={() => markAll('ABSENT')}>Mark All Absent</button>
                            </div>
                        </div>
                        
                        <div className="table-responsive">
                            <table className="crud-table">
                                <thead>
                                    <tr>
                                        <th>Roll No</th>
                                        <th>Name</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map(s => (
                                        <tr key={s.id}>
                                            <td>{s.roll_number}</td>
                                            <td>{s.first_name} {s.last_name}</td>
                                            <td>
                                                <select 
                                                    value={attendanceData[s.id] || 'PRESENT'}
                                                    onChange={(e) => handleStatusChange(s.id, e.target.value)}
                                                    style={{
                                                        padding: '0.25rem',
                                                        borderRadius: '4px',
                                                        border: '1px solid #CBD5E1',
                                                        backgroundColor: attendanceData[s.id] === 'PRESENT' ? '#D1FAE5' : (attendanceData[s.id] === 'ABSENT' ? '#FEE2E2' : '#FEF3C7')
                                                    }}
                                                >
                                                    <option value="PRESENT">Present</option>
                                                    <option value="ABSENT">Absent</option>
                                                    <option value="LATE">Late</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div style={{marginTop: '1.5rem', textAlign: 'right'}}>
                            <button className="btn-primary" onClick={handleSaveAttendance}>Save Attendance</button>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default AttendanceManagement;
