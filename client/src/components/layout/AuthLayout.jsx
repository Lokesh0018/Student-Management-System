import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import '../../pages/css/Login.css';

const leftPanelVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

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

const pageTransitionVariants = {
    initial: (direction) => ({ 
        opacity: 0, 
        x: direction === 'back' ? -100 : 100 
    }),
    animate: { 
        opacity: 1, 
        x: 0, 
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } 
    },
    exit: (direction) => ({ 
        opacity: 0, 
        x: direction === 'back' ? 100 : -100, 
        transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } 
    })
};

export const AuthLayout = () => {
    const location = useLocation();
    const direction = location.state?.direction || 'forward';

    return (
        <div className="login-page-bg full-bleed">
            <div className="login-split-screen">
                
                {/* Static Left Panel */}
                <motion.div 
                    className="login-left-panel" 
                    variants={leftPanelVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="login-left-overlay"></div>
                    <div className="login-left-content">
                        <motion.div className="brand-header" variants={itemVariants} initial="hidden" animate="visible">
                            <div className="brand-icon">
                                <img src="/icon.png" alt="Logo" className="light-mode-img" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                <img src="/logo.png" alt="Logo" className="dark-mode-img" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </div>
                        </motion.div>
                        
                        <motion.div className="brand-content" variants={itemVariants} initial="hidden" animate="visible">
                            <h1 className="brand-title">School<br/>Management<br/>System</h1>
                            <p className="brand-subtitle">Manage students, teachers, parents and academic activities effortlessly.</p>
                            
                            <div className="feature-widget mt-8">
                                <div className="feature-item">
                                    <span className="feature-icon">✓</span>
                                    <span>Seamless Attendance</span>
                                </div>
                                <div className="feature-item">
                                    <span className="feature-icon">✓</span>
                                    <span>Automated Grading</span>
                                </div>
                                <div className="feature-item">
                                    <span className="feature-icon">✓</span>
                                    <span>Parent Portal</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Animated Right Panel (Router Outlet) */}
                <div className="login-right-panel" style={{ overflow: 'hidden' }}>
                    <div className="right-panel-blob"></div>
                    
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={location.pathname}
                            custom={direction}
                            variants={pageTransitionVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="login-form-inner relative z-10"
                            style={{ width: '100%' }}
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
