import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import './css/Login.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

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

        if (!email) {
            setError('Please enter your email address.');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
            
            if (response.data.success) {
                navigate('/verify-otp', { state: { email } });
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
                        <h2>Forgot Password</h2>
                        <p>Enter your email to receive a password reset link.</p>
                    </motion.div>

                    {error && <motion.div className="error-message" variants={itemVariants} style={{ color: 'var(--danger)', marginBottom: '16px', padding: '12px', background: 'var(--danger-bg)', borderRadius: '8px' }}>{error}</motion.div>}
                    {message && <motion.div className="success-message" variants={itemVariants} style={{ color: 'var(--success)', marginBottom: '16px', padding: '12px', background: 'var(--success-bg)', borderRadius: '8px', wordBreak: 'break-word' }}>{message}</motion.div>}     

                    <form onSubmit={handleSubmit} className="login-form">
                        <motion.div className="input-group" variants={itemVariants} style={{ marginBottom: '24px' }}>
                            <label htmlFor="email" style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-primary)' }}>Email</label>
                            <input 
                                id="email"
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                disabled={loading}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                            />
                        </motion.div>
                        
                        <motion.div variants={itemVariants}>
                            <Button type="submit" variant="primary" className="login-btn" disabled={loading} style={{ width: '100%', padding: '12px', marginBottom: '16px' }}>
                                {loading ? 'Sending...' : 'Send OTP'}
                            </Button>
                        </motion.div>

                        <motion.div variants={itemVariants} style={{ textAlign: 'center', marginTop: '16px' }}>
                            <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500', marginRight: '16px' }}>Have password?</Link>
                            <Link to="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: '500' }}>Back to Login</Link>
                        </motion.div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
