import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import './css/StudentList.css';

const AttendanceManagement = () => {
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    
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

    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
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
            showNotification('No attendance data to save.', 'error');
            return;
        }

        try {
            await api.post('/attendance', { 
                class_id: filters.class_id,
                date: filters.date,
                attendanceData: payload 
            });
            showNotification('Attendance saved successfully!', 'success');
            fetchStudentsAndAttendance();
        } catch (error) {
            console.error('Error saving attendance', error);
            showNotification('Failed to save attendance.', 'error');
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
        <div className="student-list-page">
            <div className="page-header-row">
                <div className="page-header-left">
                    <h1 className="page-title">Attendance Management</h1>
                    <div className="breadcrumbs">
                        <Link to="/admin/dashboard" className="crumb-link">Dashboard</Link>
                        <span className="crumb-separator">&gt;</span>
                        <span className="current-crumb">Attendance</span>
                    </div>
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

            <div className="filter-card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ marginBottom: 0, minWidth: '200px' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#475569' }}>Class</label>
                    <select 
                        value={filters.class_id} 
                        onChange={e => setFilters({...filters, class_id: e.target.value})}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                    >
                        <option value="">Select Class</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}-{c.section}</option>)}
                    </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0, minWidth: '200px' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#475569' }}>Date</label>
                    <input 
                        type="date" 
                        value={filters.date} 
                        onChange={e => setFilters({...filters, date: e.target.value})} 
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                    />
                </div>
                <button className="btn-primary" onClick={fetchStudentsAndAttendance} style={{ padding: '0.5rem 1rem', height: '38px' }}>
                    Load Students
                </button>
            </div>
            
            {students.length > 0 && (
                <div className="table-card" style={{ marginTop: '1.5rem' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>Mark Attendance</h3>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button className="btn-secondary" onClick={() => markAll('PRESENT')} style={{ padding: '0.4rem 0.75rem', fontSize: '0.875rem' }}>Mark All Present</button>
                            <button className="btn-secondary" onClick={() => markAll('ABSENT')} style={{ padding: '0.4rem 0.75rem', fontSize: '0.875rem' }}>Mark All Absent</button>
                        </div>
                    </div>
                    
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ROLL NO</th>
                                    <th>NAME</th>
                                    <th className="text-right">ATTENDANCE STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(s => {
                                    const currentStatus = attendanceData[s.id] || 'PRESENT';
                                    return (
                                        <tr key={s.id}>
                                            <td>{s.roll_number}</td>
                                            <td className="fw-500">{s.first_name} {s.last_name}</td>
                                            <td className="text-right">
                                                <div style={{ display: 'inline-flex', backgroundColor: '#f1f5f9', borderRadius: '6px', padding: '4px', gap: '4px' }}>
                                                    <button 
                                                        onClick={() => handleStatusChange(s.id, 'PRESENT')}
                                                        style={{
                                                            border: 'none', background: currentStatus === 'PRESENT' ? '#10b981' : 'transparent', 
                                                            color: currentStatus === 'PRESENT' ? 'white' : '#64748b',
                                                            padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: currentStatus === 'PRESENT' ? '600' : '500',
                                                            transition: 'all 0.2s'
                                                        }}>
                                                        Present
                                                    </button>
                                                    <button 
                                                        onClick={() => handleStatusChange(s.id, 'ABSENT')}
                                                        style={{
                                                            border: 'none', background: currentStatus === 'ABSENT' ? '#ef4444' : 'transparent', 
                                                            color: currentStatus === 'ABSENT' ? 'white' : '#64748b',
                                                            padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: currentStatus === 'ABSENT' ? '600' : '500',
                                                            transition: 'all 0.2s'
                                                        }}>
                                                        Absent
                                                    </button>
                                                    <button 
                                                        onClick={() => handleStatusChange(s.id, 'LATE')}
                                                        style={{
                                                            border: 'none', background: currentStatus === 'LATE' ? '#f59e0b' : 'transparent', 
                                                            color: currentStatus === 'LATE' ? 'white' : '#64748b',
                                                            padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: currentStatus === 'LATE' ? '600' : '500',
                                                            transition: 'all 0.2s'
                                                        }}>
                                                        Late
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ padding: '1.5rem', borderTop: '1px solid #e2e8f0', textAlign: 'right' }}>
                        <button className="btn-primary" onClick={handleSaveAttendance} style={{ padding: '0.75rem 1.5rem' }}>
                            Save Attendance
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendanceManagement;
