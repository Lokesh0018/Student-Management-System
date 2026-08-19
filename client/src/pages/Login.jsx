import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import { motion } from "framer-motion";
import { Button } from '../components/ui/Button';
import './css/Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = React.useState(true);
    const navigate = useNavigate();
    const { login } = useAuth();

    // Framer Motion Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1, 
            transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.1 }
        }
    };

    const leftPanelVariants = {
        hidden: { x: -50, opacity: 0 },
        visible: { x: 0, opacity: 1, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } }
    };

    const rightPanelVariants = {
        hidden: { x: 50, opacity: 0 },
        visible: { x: 0, opacity: 1, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
    };

    const floatVariants = {
        float: { 
            y: [0, -15, 0], 
            transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }
    };

    React.useEffect(() => {
        // Simulate a short loading delay for the splash screen
        const timer = setTimeout(() => {
            setPageLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                email,
                password
            });

            if (response.data.success) {
                const user = response.data.data;
                login(user);
                
                if (user.role === 'ADMIN') {
                    navigate('/admin/dashboard');
                } else if (user.role === 'CLASS_TEACHER') {
                    navigate('/teacher/dashboard');
                } else if (user.role === 'PARENT') {
                    navigate('/parent/dashboard');
                } else {
                    setError('Invalid role assignment.');
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to connect to the server.');
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) {
        return (
            <div className="login-splash-screen">
                <img src="/icon.png" alt="Loading..." className="splash-logo light-mode-img" />
                <img src="/logo.png" alt="Loading..." className="splash-logo dark-mode-img" />
            </div>
        );
    }

    return (
        <div className="login-page-bg">
            <motion.div 
                className="login-split-card"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                
                <motion.div className="login-brand-panel" variants={leftPanelVariants}>
                    <motion.div className="brand-header" variants={itemVariants}>
                        <div className="brand-icon">
                            <img src="/icon.png" alt="Logo" className="light-mode-img" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            <img src="/logo.png" alt="Logo" className="dark-mode-img" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                    </motion.div>
                    
                    <motion.div className="brand-content" variants={itemVariants}>
                        <h1 className="brand-title">School<br/>Management<br/>System</h1>
                        <p className="brand-subtitle">Manage students, teachers, parents and academic activities efficiently.</p>
                    </motion.div>
                    
                    <motion.div 
                        className="brand-illustration" 
                        variants={floatVariants}
                        animate="float"
                    >
                        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYA_qhyqNOCr2HQLs2CMPYwEWcz43Um75QwdtNN88zqhYA81aH4KvnGWAgzsNkWDNowahRyecakrf0kzLZICcQh6QUxR6Awnu08uF5Z791pt27A-A0hVH7jCd8D9xQ3Cbkus7cgAWnUMgc6TP9VnYLzDa0eB8hxfDt6SydULIyiym1V_SAeQ-YPdPeT_KYTkiiHm70-QoMyG1STlzK0_oEJEHLi5eVAOhnYftuYrzTpDiU03dPVqd_YQ" alt="School Illustration" />
                    </motion.div>
                </motion.div>

                <motion.div className="login-form-panel" variants={rightPanelVariants}>
                    <div className="login-form-inner">
                        <motion.div className="form-header" variants={itemVariants}>
                            <h2>Welcome Back! 👋</h2>
                            <p>Sign in to continue</p>
                        </motion.div>

                        {error && <motion.div className="error-message" variants={itemVariants} initial="hidden" animate="visible">{error}</motion.div>}     

                        <form onSubmit={handleLogin} className="login-form">
                            <motion.div className="input-group" variants={itemVariants}>
                                <label htmlFor="email">Email</label>
                                <input 
                                    id="email"
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    disabled={loading}
                                />
                            </motion.div>
                            
                            <motion.div className="input-group password-group" variants={itemVariants}>
                                <label htmlFor="password">Password</label>
                                <div className="password-input-wrapper">
                                    <input 
                                        id="password"
                                        type={showPassword ? "text" : "password"} 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        disabled={loading}
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
                                <a href="#" className="forgot-password">Forgot Password?</a>
                            </motion.div>
                            
                            <motion.div variants={itemVariants}>
                                <Button type="submit" variant="primary" className="login-btn" disabled={loading} style={{ width: '100%' }}>
                                    {loading ? 'Signing In...' : 'Sign In'}
                                </Button>
                            </motion.div>
                        </form>

                        <motion.div className="form-footer" variants={itemVariants}>
                            <FaLock className="lock-icon" />
                            <span>Secure access for Admin, Teachers and Parents</span>
                        </motion.div>
                    </div>
                </motion.div>

            </motion.div>
        </div>
    );
};

export default Login;
