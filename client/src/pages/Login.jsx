import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaEye, FaEyeSlash, FaLock, FaEnvelope, FaArrowRight } from "react-icons/fa";
import { motion } from "framer-motion";
import { Button } from '../components/ui/Button';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

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

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                email,
                password
            });

            if (response.data.success) {
                login(response.data.user, response.data.token);
                
                const role = response.data.user.role;
                if (role === 'ADMIN') {
                    navigate('/admin/dashboard');
                } else if (role === 'TEACHER') {
                    navigate('/teacher/dashboard');
                } else if (role === 'PARENT') {
                    navigate('/parent/dashboard');
                } else {
                    navigate('/');
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <motion.div className="form-header" variants={itemVariants}>
                <h2 className="gradient-text">Welcome Back!</h2>
                <p>Sign in to continue</p>
            </motion.div>

            {error && <motion.div className="error-message" variants={itemVariants} initial="hidden" animate="visible">{error}</motion.div>}     

            <form onSubmit={handleLogin} className="login-form">
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
                
                <motion.div className="input-group password-group" variants={itemVariants}>
                    <label htmlFor="password">Password</label>
                    <div className="input-icon-wrapper password-input-wrapper">
                        <FaLock className="input-icon" />
                        <input 
                            id="password"
                            type={showPassword ? "text" : "password"} 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            disabled={loading}
                            required
                            minLength="4"
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
                
                <motion.div className="form-options" variants={itemVariants}>
                    <label className="remember-me">
                        <input type="checkbox" /> Remember me
                    </label>
                    <Link to="/forgot-password" className="forgot-password">Forgot Password?</Link>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                    <Button type="submit" variant="primary" className="login-btn premium-btn" disabled={loading} style={{ width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}>
                            {loading ? 'Signing In...' : 'Sign In'}
                            {!loading && <FaArrowRight className="btn-arrow" />}
                        </div>
                    </Button>
                </motion.div>
            </form>

            <motion.div className="form-footer" variants={itemVariants}>
                <FaLock className="lock-icon" />
                <span>Secure access for Admin, Teachers and Parents</span>
            </motion.div>
        </>
    );
};

export default Login;
