import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import FaceScanner from '../components/attendance/FaceScanner';
import './css/StudentList.css';

const AttendanceManagement = () => {
    const { user } = useAuth();
    const isTeacher = user?.role === 'CLASS_TEACHER';
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [activeTab, setActiveTab] = useState('MANUAL');
    const [confirmStudent, setConfirmStudent] = useState(null);
    const faceScannerRef = React.useRef(null);
    
    const [filters, setFilters] = useState({ 
        class_id: '', 
        date: new Date().toISOString().split('T')[0] 
    });
    const [attendanceData, setAttendanceData] = useState({}); // { student_id: status }
    
    useEffect(() => {
        if (!isTeacher) {
            const fetchClasses = async () => {
                try {
                    const res = await api.get('/classes');
                    setClasses(res.data.data);
                } catch (error) {
                    console.error('Error fetching classes', error);
                }
            };
            fetchClasses();
        }
    }, [isTeacher]);

    const fetchStudentsAndAttendance = async () => {
        if (!isTeacher && !filters.class_id) return;
        if (!filters.date) return;
        
        try {
            const res = await api.get(`/attendance?class_id=${filters.class_id}&date=${filters.date}`);
            
            const fetchedStudents = res.data.data.map(item => ({
                id: item.student_id || item.id, // Depending on the JOIN
                first_name: item.first_name,
                last_name: item.last_name,
                roll_number: item.roll_number,
                status: item.status || null // Only show status if marked
            }));
            
            // Clean up the data mapping
            // The API returns student details. If attendance exists, it has `status`.
            // We'll standardize this for the UI state.
            
            // Deduplicate in case of existing dirty data in the database
            const uniqueStudents = Array.from(new Map(fetchedStudents.map(item => [item.id, item])).values());
            
            setStudents(uniqueStudents);
            
            const existingAttendance = {};
            uniqueStudents.forEach(s => {
                existingAttendance[s.id] = s.status;
            });
            setAttendanceData(existingAttendance);

        } catch (error) {
            console.error('Error fetching attendance', error);
        }
    };

    useEffect(() => {
        if (isTeacher) {
            fetchStudentsAndAttendance();
        }
    }, [filters.date, isTeacher]);

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
            showNotification('Failed to save attendance', 'error');
        }
    };

    const handleFaceRecognized = (student) => {
        if (!filters.class_id) {
            showNotification('Please select a class first.', 'error');
            return;
        }
        
        setConfirmStudent(prevConfirm => {
            // If a popup is already open, do nothing
            if (prevConfirm) return prevConfirm;
            
            // Otherwise, show the confirmation modal
            return student;
        });
    };

    const confirmAttendance = async () => {
        if (!confirmStudent) return;
        const student = confirmStudent;
        
        try {
            await api.post('/attendance', { 
                class_id: filters.class_id,
                date: filters.date,
                attendanceData: [{ student_id: student.student_id, status: 'PRESENT' }]
            });
            showNotification(`Marked PRESENT: ${student.first_name} ${student.last_name}`, 'success');
            setAttendanceData(prev => ({ ...prev, [student.student_id]: 'PRESENT' }));
            
            if (faceScannerRef.current) {
                faceScannerRef.current.stopCamera();
            }
        } catch (error) {
            console.error('Error auto-saving attendance', error);
            showNotification(`Failed to mark attendance for ${student.first_name}`, 'error');
        } finally {
            setConfirmStudent(null);
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
                    <h2 className="page-title">Attendance</h2>
                </div>
            </div>

            <div className="tab-container" style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--border)' }}>
                <button 
                    style={{ padding: '8px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'MANUAL' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'MANUAL' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'MANUAL' ? '600' : '500', cursor: 'pointer' }}
                    onClick={() => setActiveTab('MANUAL')}
                >
                    Manual Attendance
                </button>
                <button 
                    style={{ padding: '8px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'FACE_RECOGNITION' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'FACE_RECOGNITION' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'FACE_RECOGNITION' ? '600' : '500', cursor: 'pointer' }}
                    onClick={() => setActiveTab('FACE_RECOGNITION')}
                >
                    Face Recognition
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

            {activeTab === 'MANUAL' && (
            <>
            <div className="filter-card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                {!isTeacher && (
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
                )}
                <div className="form-group" style={{ marginBottom: 0, minWidth: '200px' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#475569' }}>Date</label>
                    <input 
                        type="date" 
                        value={filters.date} 
                        onChange={e => setFilters({...filters, date: e.target.value})} 
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                    />
                </div>
                {!isTeacher && (
                <button className="btn-primary" onClick={fetchStudentsAndAttendance} style={{ padding: '0.5rem 1rem', height: '38px' }}>
                    Load Students
                </button>
                )}
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
                                    const currentStatus = attendanceData[s.id] || null;
                                    return (
                                        <tr key={s.id}>
                                            <td>{s.roll_number}</td>
                                            <td className="fw-500">{s.first_name} {s.last_name}</td>
                                            <td className="text-right">
                                                <div style={{ display: 'inline-flex', backgroundColor: 'var(--surface)', borderRadius: '6px', padding: '4px', gap: '4px', border: '1px solid var(--border)' }}>
                                                    <button 
                                                        onClick={() => handleStatusChange(s.id, 'PRESENT')}
                                                        style={{
                                                            border: 'none', background: currentStatus === 'PRESENT' ? '#10b981' : 'transparent', 
                                                            color: currentStatus === 'PRESENT' ? 'white' : 'var(--text-secondary)',
                                                            padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: currentStatus === 'PRESENT' ? '600' : '500',
                                                            transition: 'all 0.2s'
                                                        }}>
                                                        Present
                                                    </button>
                                                    <button 
                                                        onClick={() => handleStatusChange(s.id, 'ABSENT')}
                                                        style={{
                                                            border: 'none', background: currentStatus === 'ABSENT' ? '#ef4444' : 'transparent', 
                                                            color: currentStatus === 'ABSENT' ? 'white' : 'var(--text-secondary)',
                                                            padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: currentStatus === 'ABSENT' ? '600' : '500',
                                                            transition: 'all 0.2s'
                                                        }}>
                                                        Absent
                                                    </button>
                                                    <button 
                                                        onClick={() => handleStatusChange(s.id, 'LATE')}
                                                        style={{
                                                            border: 'none', background: currentStatus === 'LATE' ? '#f59e0b' : 'transparent', 
                                                            color: currentStatus === 'LATE' ? 'white' : 'var(--text-secondary)',
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
            </>
            )}

            {activeTab === 'FACE_RECOGNITION' && (
                <div className="form-section photo-upload-section">
                    <h3 className="form-section-title">Face Recognition Scanner</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.875rem' }}>
                        Make sure to select your class and date before starting the camera. Recognized students will automatically be marked PRESENT.
                    </p>
                    
                    <FaceScanner 
                        ref={faceScannerRef}
                        classId={filters.class_id || (classes[0]?.id)} 
                        date={filters.date} 
                        onStudentRecognized={handleFaceRecognized} 
                        controls={
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                                {!isTeacher && (
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#475569' }}>Class</label>
                                    <select 
                                        value={filters.class_id} 
                                        onChange={e => setFilters({...filters, class_id: e.target.value})}
                                        style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                    >
                                        <option value="">Select Class</option>
                                        {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}-{c.section}</option>)}
                                    </select>
                                </div>
                                )}
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#475569' }}>Date</label>
                                    <input 
                                        type="date" 
                                        value={filters.date} 
                                        onChange={e => setFilters({...filters, date: e.target.value})} 
                                        style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                    />
                                </div>
                            </div>
                        }
                    />
                </div>
            )}

            {/* Confirmation Modal */}
            {confirmStudent && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'var(--surface, white)', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '400px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}>
                        <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)' }}>Confirm Attendance</h3>
                        <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'var(--bg, #f8fafc)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)' }}>Student Name:</p>
                            <p style={{ margin: '0 0 16px 0', fontWeight: '600', fontSize: '1.125rem', color: 'var(--text-primary)' }}>
                                {confirmStudent.first_name} {confirmStudent.last_name}
                            </p>
                            <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)' }}>Roll Number:</p>
                            <p style={{ margin: 0, fontWeight: '600', color: 'var(--text-primary)' }}>{confirmStudent.roll_number}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button className="btn-secondary" onClick={() => setConfirmStudent(null)}>Cancel</button>
                            <button className="btn-primary" onClick={confirmAttendance}>Confirm Present</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendanceManagement;
