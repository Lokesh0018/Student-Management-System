import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { FaArrowRight } from "react-icons/fa";
import { MdKey } from "react-icons/md";

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

        if (!otp || otp.length !== 4) {
            setError('Please enter the 4-digit OTP.');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/auth/verify-otp', { token: otp });
            
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
        <>
            <motion.div className="form-header" variants={itemVariants}>
                <h2 className="gradient-text">Verify OTP</h2>
                <p>Enter the 4-digit code sent to {email}</p>
            </motion.div>

            {error && <motion.div className="error-message" variants={itemVariants} initial="hidden" animate="visible">{error}</motion.div>}

            <form onSubmit={handleSubmit} className="login-form">
                <motion.div className="input-group" variants={itemVariants}>
                    <label htmlFor="otp">4-Digit OTP</label>
                    <div className="input-icon-wrapper">
                        <MdKey className="input-icon" style={{ fontSize: '18px' }} />
                        <input 
                            id="otp"
                            type="text" 
                            maxLength="4"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                            placeholder="----"
                            disabled={loading}
                            required
                            pattern="\d{4}"
                            title="Please enter exactly 4 digits"
                            style={{ letterSpacing: '8px', textAlign: 'center', fontSize: '20px', fontWeight: 'bold' }}
                        />
                    </div>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                    <Button type="submit" variant="primary" className="login-btn premium-btn" disabled={loading} style={{ width: '100%', marginTop: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}>
                            {loading ? 'Verifying...' : 'Verify OTP'}
                            {!loading && <FaArrowRight className="btn-arrow" />}
                        </div>
                    </Button>
                </motion.div>

                <motion.div variants={itemVariants} style={{ textAlign: 'center', marginTop: '24px' }}>
                    <Link to="/forgot-password" state={{ direction: 'back' }} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: '500', transition: 'color 0.2s ease' }} onMouseOver={(e) => e.target.style.color = 'var(--primary)'} onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}>
                        Cancel
                    </Link>
                </motion.div>
            </form>
        </>
    );
};

export default VerifyOTP;
