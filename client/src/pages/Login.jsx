import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import { Button } from '../components/ui/Button';
import './css/Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

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

    return (
        <div className="login-page-bg">
            <div className="login-split-card">
                
                <div className="login-brand-panel">
                    <div className="brand-header">
                        <div className="brand-icon">
                            <img src="/icon.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                    </div>
                    
                    <div className="brand-content">
                        <h1 className="brand-title">School<br/>Management<br/>System</h1>
                        <p className="brand-subtitle">Manage students, teachers, parents and academic activities efficiently.</p>
                    </div>
                    
                    <div className="brand-illustration">
                        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYA_qhyqNOCr2HQLs2CMPYwEWcz43Um75QwdtNN88zqhYA81aH4KvnGWAgzsNkWDNowahRyecakrf0kzLZICcQh6QUxR6Awnu08uF5Z791pt27A-A0hVH7jCd8D9xQ3Cbkus7cgAWnUMgc6TP9VnYLzDa0eB8hxfDt6SydULIyiym1V_SAeQ-YPdPeT_KYTkiiHm70-QoMyG1STlzK0_oEJEHLi5eVAOhnYftuYrzTpDiU03dPVqd_YQ" alt="School Illustration" />
                    </div>
                </div>

                <div className="login-form-panel">
                    <div className="login-form-inner">
                        <div className="form-header">
                            <h2>Welcome Back! 👋</h2>
                            <p>Sign in to continue</p>
                        </div>

                        {error && <div className="error-message">{error}</div>}     

                        <form onSubmit={handleLogin} className="login-form">
                            <div className="input-group">
                                <label htmlFor="email">Email</label>
                                <input 
                                    id="email"
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    disabled={loading}
                                />
                            </div>
                            
                            <div className="input-group password-group">
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
                            </div>
                            
                            <div className="form-options">
                                <label className="remember-me">
                                    <input type="checkbox" /> Remember me
                                </label>
                                <a href="#" className="forgot-password">Forgot Password?</a>
                            </div>
                            
                            <Button type="submit" variant="primary" className="login-btn" disabled={loading}>
                                {loading ? <span className="loader"></span> : 'Sign In'}
                            </Button>
                        </form>

                        <div className="form-footer">
                            <FaLock className="lock-icon" />
                            <span>Secure access for Admin, Teachers and Parents</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Login;
