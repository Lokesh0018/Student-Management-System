import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUserCircle, FaLock, FaCheckCircle, FaExclamationCircle, FaMoneyBillWave } from 'react-icons/fa';
import api from '../utils/api';
import AdminFeeSettings from './AdminFeeSettings';
import toast from 'react-hot-toast';
import './css/Settings.css';

const Settings = () => {
    const { user, login } = useAuth();
    const [profile, setProfile] = useState({ name: '', email: '' });
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/users/profile');
                setProfile({ name: res.data.data.name, email: res.data.data.email });
            } catch (error) {
                toast.error('Failed to load profile details.');
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
        setIsSaving(true);
        try {
            const res = await api.put('/users/profile', profile);
            toast.success('Profile updated successfully!');
            // Update auth context user
            const updatedUser = { ...user, name: res.data.data.name, email: res.data.data.email };
            login(updatedUser, localStorage.getItem('token'));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile.');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error('New passwords do not match.');
            return;
        }
        setIsSaving(true);
        try {
            await api.put('/users/profile', {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });
            toast.success('Password changed successfully!');
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change password.');
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

            <div className="settings-layout">
                <div className="settings-sidebar card">
                    <ul className="settings-nav">
                        <li className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
                            <FaUserCircle /> Profile Details
                        </li>
                        <li className={activeTab === 'security' ? 'active' : ''} onClick={() => setActiveTab('security')}>
                            <FaLock /> Account Security
                        </li>
                        {user?.role === 'ADMIN' && (
                            <li className={activeTab === 'fee-settings' ? 'active' : ''} onClick={() => setActiveTab('fee-settings')}>
                                <FaMoneyBillWave /> Fee & Payment Settings
                            </li>
                        )}
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
                                    <input type="password" name="newPassword" value={passwords.newPassword} onChange={handlePasswordChange} required minLength="4" />
                                </div>
                                <div className="form-group">
                                    <label>Confirm New Password</label>
                                    <input type="password" name="confirmPassword" value={passwords.confirmPassword} onChange={handlePasswordChange} required minLength="4" />
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="btn btn-primary" disabled={isSaving}>
                                        {isSaving ? 'Updating...' : 'Change Password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'fee-settings' && user?.role === 'ADMIN' && (
                        <div className="settings-section">
                            <h2>Fee & Payment Settings</h2>
                            <p className="section-desc">Configure UPI ID and payment instructions for parents.</p>
                            <AdminFeeSettings />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
