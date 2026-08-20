import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import './css/Login.css';

const VerifyOTP = () => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || '';

    useEffect(() => {
        if (!email) {
            navigate('/forgot-password');
        }
    }, [email, navigate]);

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

        if (!otp || otp.length !== 4) {
            setError('Please enter the 4-digit OTP.');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/auth/verify-otp', { token: otp });
            
            if (response.data.success) {
                navigate('/reset-password', { state: { email, otp } });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to verify OTP.');
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
                        <h2>Verify OTP</h2>
                        <p>Enter the 4-digit code sent to {email}</p>
                    </motion.div>

                    {error && <motion.div className="error-message" variants={itemVariants} style={{ color: 'var(--danger)', marginBottom: '16px', padding: '12px', background: 'var(--danger-bg)', borderRadius: '8px' }}>{error}</motion.div>}

                    <form onSubmit={handleSubmit} className="login-form">
                        <motion.div className="input-group" variants={itemVariants} style={{ marginBottom: '24px' }}>
                            <label htmlFor="otp" style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-primary)' }}>4-Digit OTP</label>
                            <input 
                                id="otp"
                                type="text" 
                                maxLength="4"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                placeholder="----"
                                disabled={loading}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', letterSpacing: '8px', textAlign: 'center', fontSize: '24px', fontWeight: 'bold' }}
                            />
                        </motion.div>
                        
                        <motion.div variants={itemVariants}>
                            <Button type="submit" variant="primary" className="login-btn" disabled={loading} style={{ width: '100%', padding: '12px', marginBottom: '16px' }}>
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </Button>
                        </motion.div>

                        <motion.div variants={itemVariants} style={{ textAlign: 'center', marginTop: '16px' }}>
                            <Link to="/forgot-password" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: '500' }}>Cancel</Link>
                        </motion.div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default VerifyOTP;
