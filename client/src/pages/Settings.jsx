import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUserCircle, FaLock, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import api from '../utils/api';
import './css/Settings.css';

const Settings = () => {
    const { user, login } = useAuth();
    const [profile, setProfile] = useState({ name: '', email: '' });
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/users/profile');
                setProfile({ name: res.data.data.name, email: res.data.data.email });
            } catch (error) {
                setMessage({ type: 'error', text: 'Failed to load profile details.' });
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleProfileChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        setIsSaving(true);
        try {
            const res = await api.put('/users/profile', profile);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            // Update auth context user
            const updatedUser = { ...user, name: res.data.data.name, email: res.data.data.email };
            login(updatedUser, localStorage.getItem('token'));
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match.' });
            return;
        }
        setMessage({ type: '', text: '' });
        setIsSaving(true);
        try {
            await api.put('/users/profile', {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });
            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to change password.' });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return <div className="page-container flex-center">Loading Settings...</div>;
    }

    return (
        <div className="page-container settings-page">
            <div className="settings-header">
                <h1 className="page-title">Account Settings</h1>
                <p className="page-subtitle">Manage your profile and security preferences.</p>
            </div>

            {message.text && (
                <div className={`alert alert-${message.type}`}>
                    {message.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
                    <span>{message.text}</span>
                </div>
            )}

            <div className="settings-layout">
                <div className="settings-sidebar card">
                    <ul className="settings-nav">
                        <li className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
                            <FaUserCircle /> Profile Details
                        </li>
                        <li className={activeTab === 'security' ? 'active' : ''} onClick={() => setActiveTab('security')}>
                            <FaLock /> Account Security
                        </li>
                    </ul>
                </div>

                <div className="settings-content card">
                    {activeTab === 'profile' && (
                        <div className="settings-section">
                            <h2>Profile Details</h2>
                            <p className="section-desc">Update your personal information.</p>
                            <form onSubmit={handleProfileSubmit} className="settings-form">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input type="text" name="name" value={profile.name} onChange={handleProfileChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input type="email" name="email" value={profile.email} onChange={handleProfileChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Role</label>
                                    <input type="text" value={user?.role} disabled className="input-disabled" />
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="btn btn-primary" disabled={isSaving}>
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="settings-section">
                            <h2>Account Security</h2>
                            <p className="section-desc">Change your password to keep your account secure.</p>
                            <form onSubmit={handlePasswordSubmit} className="settings-form">
                                <div className="form-group">
                                    <label>Current Password</label>
                                    <input type="password" name="currentPassword" value={passwords.currentPassword} onChange={handlePasswordChange} required />
                                </div>
                                <div className="form-group">
                                    <label>New Password</label>
                                    <input type="password" name="newPassword" value={passwords.newPassword} onChange={handlePasswordChange} required minLength="6" />
                                </div>
                                <div className="form-group">
                                    <label>Confirm New Password</label>
                                    <input type="password" name="confirmPassword" value={passwords.confirmPassword} onChange={handlePasswordChange} required minLength="6" />
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="btn btn-primary" disabled={isSaving}>
                                        {isSaving ? 'Updating...' : 'Change Password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
