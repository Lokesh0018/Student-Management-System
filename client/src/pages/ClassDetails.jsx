import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaBookOpen, FaUserTie, FaUsers } from 'react-icons/fa';
import api from '../utils/api';
import './StudentProfile.css';
import { getDirectImageUrl } from '../utils/imageUtils';

const ClassDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [classData, setClassData] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClassData = async () => {
            try {
                // Fetch class details and all students
                const [classRes, studentsRes] = await Promise.all([
                    api.get(`/classes/${id}`),
                    api.get('/students')
                ]);

                if (classRes.data.success) {
                    setClassData(classRes.data.data);
                }

                if (studentsRes.data.success) {
                    // Filter students that belong to this class
                    const classStudents = studentsRes.data.data.filter(s => String(s.class_id) === String(id));
                    setStudents(classStudents);
                }
            } catch (error) {
                console.error("Error fetching class details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchClassData();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (!classData) return <div>Class not found</div>;

    const classInitial = classData.class_name ? classData.class_name.charAt(0).toUpperCase() : 'C';

    return (
        <div className="student-profile-page">
            <div className="page-header-row">
                <div className="page-header-left">
                    <h1 className="page-title">Class Details</h1>
                    <div className="breadcrumbs">
                        <Link to="/admin/dashboard" className="crumb-link">Dashboard</Link>
                        <span className="crumb-separator">&gt;</span>
                        <Link to="/admin/classes" className="crumb-link">Classes</Link>
                        <span className="crumb-separator">&gt;</span>
                        <span className="current-crumb">{classData.class_name} - {classData.section}</span>
                    </div>
                </div>
                <div className="action-buttons-group">
                    <button className="btn-primary" onClick={() => navigate(`/admin/classes/${id}/edit`)}>Edit Class</button>
                </div>
            </div>

            <div className="profile-content-split">
                <div className="profile-main">
                    <div className="profile-card profile-summary-card">
                        <div className="summary-left">
                            <div className="table-avatar-placeholder" style={{ backgroundColor: '#10b981', width: '100px', height: '100px', fontSize: '36px', flexShrink: 0 }}>
                                {classInitial}
                            </div>
                            <div className="profile-identity">
                                <h2>Class {classData.class_name}</h2>
                                <p>Section {classData.section}</p>
                            </div>
                        </div>
                        <div className="summary-right">
                            <div className="info-grid-clean">
                                <div className="info-item-clean">
                                    <span className="info-label-clean"><FaUserTie /> Class Teacher</span>
                                    <span className="info-val-clean">{classData.teacher_name || 'Not Assigned'}</span>
                                </div>
                                <div className="info-item-clean">
                                    <span className="info-label-clean"><FaBookOpen /> Class Name</span>
                                    <span className="info-val-clean">{classData.class_name}</span>
                                </div>
                                <div className="info-item-clean">
                                    <span className="info-label-clean"><FaUsers /> Total Students</span>
                                    <span className="info-val-clean">{students.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="overview-tab-content">
                        <div className="overview-grid" style={{ marginTop: '24px' }}>
                            <div className="overview-section" style={{ gridColumn: '1 / -1' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <h3 className="overview-section-title" style={{ margin: 0 }}>Students in Class</h3>
                                </div>
                                
                                {students.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>STUDENT</th>
                                                    <th>ROLL NO</th>
                                                    <th>GENDER</th>
                                                    <th>PHONE</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {students.map(student => (
                                                    <tr key={student.id} onClick={() => navigate(`/admin/students/${student.id}`)} style={{ cursor: 'pointer' }} className="clickable-row">
                                                        <td>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                                {student.photo ? (
                                                                    <img src={getDirectImageUrl(student.photo)} alt="avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} onError={(e)=>{e.target.onerror = null; e.target.style.display='none'}} />
                                                                ) : (
                                                                    <div className="table-avatar-placeholder" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                                                                        {student.first_name.charAt(0)}
                                                                    </div>
                                                                )}
                                                                <span className="fw-500">{student.first_name} {student.last_name}</span>
                                                            </div>
                                                        </td>
                                                        <td>{student.roll_number}</td>
                                                        <td>{student.gender}</td>
                                                        <td>{student.phone}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="empty-state">
                                        <p>No students enrolled in this class yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClassDetails;
