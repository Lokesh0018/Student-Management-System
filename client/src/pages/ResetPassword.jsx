import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { FaEye, FaEyeSlash, FaLock, FaArrowRight } from "react-icons/fa";

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

    const itemVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        visible: { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            transition: { 
                type: "spring", 
                stiffness: 100, 
                damping: 15
            } 
        }
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
            const response = await api.post('/auth/reset-password', { 
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
        <>
            <motion.div className="form-header" variants={itemVariants}>
                <h2 className="gradient-text">Reset Password</h2>
                <p>Set a new password for {email}</p>
            </motion.div>

            {error && <motion.div className="error-message" variants={itemVariants} initial="hidden" animate="visible">{error}</motion.div>}
            {message && <motion.div className="success-message" variants={itemVariants} initial="hidden" animate="visible">{message}</motion.div>}     

            <form onSubmit={handleSubmit} className="login-form">
                <motion.div className="input-group password-group" variants={itemVariants}>
                    <label htmlFor="newPassword">New Password</label>
                    <div className="input-icon-wrapper password-input-wrapper">
                        <FaLock className="input-icon" />
                        <input 
                            id="newPassword"
                            type={showPassword ? "text" : "password"} 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            disabled={loading}
                            required
                            minLength="6"
                        />
                        <button 
                            type="button" 
                            className="toggle-password"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                </motion.div>

                <motion.div className="input-group password-group" variants={itemVariants}>
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <div className="input-icon-wrapper password-input-wrapper">
                        <FaLock className="input-icon" />
                        <input 
                            id="confirmPassword"
                            type={showPassword ? "text" : "password"} 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            disabled={loading}
                            required
                            minLength="6"
                        />
                    </div>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                    <Button type="submit" variant="primary" className="login-btn premium-btn" disabled={loading} style={{ width: '100%', marginTop: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}>
                            {loading ? 'Resetting...' : 'Reset Password'}
                            {!loading && <FaArrowRight className="btn-arrow" />}
                        </div>
                    </Button>
                </motion.div>

                <motion.div variants={itemVariants} style={{ textAlign: 'center', marginTop: '24px' }}>
                    <Link to="/login" state={{ direction: 'back' }} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: '500', transition: 'color 0.2s ease' }} onMouseOver={(e) => e.target.style.color = 'var(--primary)'} onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}>
                        Back to Login
                    </Link>
                </motion.div>
            </form>
        </>
    );
};

export default ResetPassword;
