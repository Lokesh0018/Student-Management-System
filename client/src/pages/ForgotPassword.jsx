import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { FaEnvelope, FaArrowRight } from "react-icons/fa";

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

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
        <>
            <motion.div className="form-header" variants={itemVariants}>
                <h2 className="gradient-text">Forgot Password</h2>
                <p>Enter your email to receive a password reset link.</p>
            </motion.div>

            {error && <motion.div className="error-message" variants={itemVariants} initial="hidden" animate="visible">{error}</motion.div>}
            {message && <motion.div className="success-message" variants={itemVariants} initial="hidden" animate="visible">{message}</motion.div>}     

            <form onSubmit={handleSubmit} className="login-form">
                <motion.div className="input-group" variants={itemVariants}>
                    <label htmlFor="email">Email</label>
                    <div className="input-icon-wrapper">
                        <FaEnvelope className="input-icon" />
                        <input 
                            id="email"
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            disabled={loading}
                            required
                        />
                    </div>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                    <Button type="submit" variant="primary" className="login-btn premium-btn" disabled={loading} style={{ width: '100%', marginTop: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}>
                            {loading ? 'Sending...' : 'Send OTP'}
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

export default ForgotPassword;
