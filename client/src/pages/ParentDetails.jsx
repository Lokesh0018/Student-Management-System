import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaUserGraduate } from 'react-icons/fa';
import api from '../utils/api';
import './css/StudentProfile.css';

const ParentDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [parent, setParent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchParent = async () => {
            try {
                const res = await api.get(`/parents/${id}`);
                setParent(res.data.data);
            } catch (error) {
                console.error("Error fetching parent details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchParent();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (!parent) return <div>Parent not found</div>;

    const getParentAvatar = (name) => {
        const names = String(name || '').trim().split(" ");
        if(names.length > 1){
            return names[0].charAt(0) + names[1].charAt(0);
        }else if(names.length === 1 && names[0]){
            return names[0].charAt(0);
        }else{
            return "P";
        }
    };

    return (
        <div className="student-profile-page">
            <div className="page-header-row">
                <div className="page-header-left">
                    <h1 className="page-title">Parent Details</h1>
                    <div className="breadcrumbs">
                        <Link to="/admin/dashboard" className="crumb-link">Dashboard</Link>
                        <span className="crumb-separator">&gt;</span>
                        <Link to="/admin/parents" className="crumb-link">Parents</Link>
                        <span className="crumb-separator">&gt;</span>
                        <span className="current-crumb">{parent.name}</span>
                    </div>
                </div>
                <div className="action-buttons-group">
                    <button className="btn-primary" onClick={() => navigate(`/admin/parents/${id}/edit`)}>Edit Parent</button>
                </div>
            </div>

            <div className="profile-content-split">
                <div className="profile-main">
                    <div className="profile-card profile-summary-card">
                        <div className="summary-left">
                            <div className="table-avatar-placeholder" style={{ backgroundColor: '#2dd4bf', width: '100px', height: '100px', fontSize: '36px', flexShrink: 0 }}>
                                {getParentAvatar(parent.name)}
                            </div>
                            <div className="profile-identity">
                                <h2>{parent.name}</h2>
                                <p>{parent.relationship || 'Parent / Guardian'}</p>
                            </div>
                        </div>
                        <div className="summary-right">
                            <div className="info-grid-clean">
                                <div className="info-item-clean">
                                    <span className="info-label-clean"><FaEnvelope /> Email</span>
                                    <span className="info-val-clean text-blue">{parent.email}</span>
                                </div>
                                <div className="info-item-clean">
                                    <span className="info-label-clean"><FaPhone /> Phone</span>
                                    <span className="info-val-clean text-blue">{parent.phone || '-'}</span>
                                </div>
                                <div className="info-item-clean" style={{ gridColumn: '1 / -1' }}>
                                    <span className="info-label-clean"><FaMapMarkerAlt /> Address</span>
                                    <span className="info-val-clean">{parent.address || '-'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="overview-tab-content">
                        <div className="overview-grid">
                            <div className="overview-section" style={{ gridColumn: '1 / -1' }}>
                                <h3 className="overview-section-title"><FaUserGraduate style={{marginRight: '8px', color: '#64748b'}}/>Linked Children</h3>
                                <div className="info-grid-2">
                                    <div className="info-block full-width">
                                        <strong className="text-blue" style={{ fontSize: '16px' }}>{parent.children_names || 'No children linked to this account.'}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParentDetails;
