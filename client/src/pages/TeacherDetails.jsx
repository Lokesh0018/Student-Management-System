import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaEnvelope, FaPhone, FaBook, FaCalendarAlt } from 'react-icons/fa';
import api from '../utils/api';
import { useBreadcrumb } from '../context/BreadcrumbContext';
import './css/StudentProfile.css';

const TeacherDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setDynamicCrumb } = useBreadcrumb();
    const [teacher, setTeacher] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeacher = async () => {
            try {
                const res = await api.get(`/teachers/${id}`);
                const t = res.data.data;
                setTeacher(t);
                setDynamicCrumb(id, t.name);
            } catch (error) {
                console.error("Error fetching teacher details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTeacher();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (!teacher) return <div>Teacher not found</div>;

    const initials = teacher.name ? teacher.name.substring(0, 2).toUpperCase() : 'T';
    const getTeacherAvatar = (name) => {
        const names = String(name).trim().split(" ");
        if(names.length > 1){
            return names[0].charAt(0) + names[1].charAt(0);
        }else if(names.length === 1){
            return names[0].charAt(0);
        }else{
            return "T";
        }
    };
    return (
        <div className="student-profile-page">
            <div className="page-header-row">
                <div className="page-header-left">
                    <h1 className="page-title">Teacher Details</h1>
                    </div>
                <div className="action-buttons-group">
                    <button className="btn-primary" onClick={() => navigate(`/admin/teachers/${id}/edit`)}>Edit Teacher</button>
                </div>
            </div>

            <div className="profile-content-split">
                <div className="profile-main">
                    <div className="profile-card profile-summary-card">
                        <div className="summary-left">
                            <div className="table-avatar-placeholder" style={{ backgroundColor: '#818cf8', width: '100px', height: '100px', fontSize: '36px', flexShrink: 0 }}>
                                {getTeacherAvatar(teacher.name)}
                            </div>
                            <div className="profile-identity">
                                <h2>{teacher.name}</h2>
                                <p>{teacher.department || 'No Department'} Teacher</p>
                            </div>
                        </div>
                        <div className="summary-right">
                            <div className="info-grid-clean">
                                <div className="info-item-clean">
                                    <span className="info-label-clean"><FaEnvelope /> Email</span>
                                    <span className="info-val-clean text-blue">{teacher.email}</span>
                                </div>
                                <div className="info-item-clean">
                                    <span className="info-label-clean"><FaBook /> Department</span>
                                    <span className="info-val-clean">{teacher.department || '-'}</span>
                                </div>
                                <div className="info-item-clean">
                                    <span className="info-label-clean"><FaPhone /> Phone</span>
                                    <span className="info-val-clean text-blue">{teacher.phone || '-'}</span>
                                </div>
                                <div className="info-item-clean">
                                    <span className="info-label-clean">🎓 Qualification</span>
                                    <span className="info-val-clean">{teacher.qualification || '-'}</span>
                                </div>
                                <div className="info-item-clean">
                                    <span className="info-label-clean">🏢 Employee ID</span>
                                    <span className="info-val-clean">{teacher.employee_id || '-'}</span>
                                </div>
                                <div className="info-item-clean">
                                    <span className="info-label-clean"><FaCalendarAlt /> Joining Date</span>
                                    <span className="info-val-clean">{teacher.joining_date ? new Date(teacher.joining_date).toLocaleDateString() : '-'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="overview-tab-content">
                        <div className="overview-grid" style={{ marginTop: '24px' }}>
                            {/* About Teacher */}
                            <div className="overview-section" style={{ gridColumn: '1 / -1' }}>
                                <h3 className="overview-section-title">About Teacher</h3>
                                <p style={{ fontSize: '14px', color: '#334155', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-line' }}>
                                    {teacher.description || 'No description provided.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherDetails;
