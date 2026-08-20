import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import './css/Login.css';

const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const token = location.state?.otp || '';
    const email = location.state?.email || '';
    
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token || !email) {
            navigate('/forgot-password');
        }
    }, [token, email, navigate]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1, 
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!token) {
            setError('Please provide the 6-digit OTP.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/auth/reset-password', { 
                token, 
                newPassword 
            });
            
            if (response.data.success) {
                setMessage('Password has been successfully reset! Redirecting to login...');
                setTimeout(() => navigate('/login'), 3000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to connect to the server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)' }}>
            <motion.div 
                className="login-form-panel" 
                style={{ width: '100%', maxWidth: '450px', borderRadius: '16px', boxShadow: 'var(--shadow-3)', background: 'var(--surface)' }}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="login-form-inner" style={{ padding: '40px' }}>
                    <motion.div className="form-header" variants={itemVariants}>
                        <h2>Reset Password</h2>
                        <p>Set a new password for {email}</p>
                    </motion.div>

                    {error && <motion.div className="error-message" variants={itemVariants} style={{ color: 'var(--danger)', marginBottom: '16px', padding: '12px', background: 'var(--danger-bg)', borderRadius: '8px' }}>{error}</motion.div>}
                    {message && <motion.div className="success-message" variants={itemVariants} style={{ color: 'var(--success)', marginBottom: '16px', padding: '12px', background: 'var(--success-bg)', borderRadius: '8px' }}>{message}</motion.div>}     

                    <form onSubmit={handleSubmit} className="login-form">
                        <motion.div className="input-group password-group" variants={itemVariants} style={{ marginBottom: '16px', position: 'relative' }}>
                            <label htmlFor="newPassword" style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-primary)' }}>New Password</label>
                            <div className="password-input-wrapper" style={{ position: 'relative' }}>
                                <input 
                                    id="newPassword"
                                    type={showPassword ? "text" : "password"} 
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    disabled={loading}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                                />
                                <button 
                                    type="button" 
                                    className="toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </motion.div>

                        <motion.div className="input-group password-group" variants={itemVariants} style={{ marginBottom: '24px', position: 'relative' }}>
                            <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-primary)' }}>Confirm Password</label>
                            <div className="password-input-wrapper" style={{ position: 'relative' }}>
                                <input 
                                    id="confirmPassword"
                                    type={showPassword ? "text" : "password"} 
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    disabled={loading}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                                />
                            </div>
                        </motion.div>
                        
                        <motion.div variants={itemVariants}>
                            <Button type="submit" variant="primary" className="login-btn" disabled={loading} style={{ width: '100%', padding: '12px', marginBottom: '16px' }}>
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </Button>
                        </motion.div>

                        <motion.div variants={itemVariants} style={{ textAlign: 'center' }}>
                            <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>Back to Login</Link>
                        </motion.div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
