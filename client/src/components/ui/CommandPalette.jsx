import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaUserGraduate, FaChalkboardTeacher, FaBook, FaCog, FaChartLine, FaClipboardList, FaCommentDots } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import './css/CommandPalette.css';

export const CommandPalette = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    let commands = [];
    
    if (user?.role === 'ADMIN') {
        commands = [
            { id: 'dashboard', name: 'Go to Dashboard', path: '/admin/dashboard', icon: <FaSearch /> },
            { id: 'add-student', name: 'Add New Student', path: '/admin/students/add', icon: <FaUserGraduate /> },
            { id: 'students', name: 'View All Students', path: '/admin/students', icon: <FaUserGraduate /> },
            { id: 'add-teacher', name: 'Add New Teacher', path: '/admin/teachers/add', icon: <FaChalkboardTeacher /> },
            { id: 'teachers', name: 'View All Teachers', path: '/admin/teachers', icon: <FaChalkboardTeacher /> },
            { id: 'classes', name: 'Manage Classes', path: '/admin/classes', icon: <FaBook /> },
            { id: 'exams', name: 'Manage Examinations', path: '/admin/exams', icon: <FaBook /> },
            { id: 'settings', name: 'System Settings', path: '/admin/settings', icon: <FaCog /> },
        ];
    } else if (user?.role === 'CLASS_TEACHER' || user?.role === 'TEACHER') {
        commands = [
            { id: 'dashboard', name: 'Go to Dashboard', path: '/teacher/dashboard', icon: <FaSearch /> },
            { id: 'students', name: 'My Class Students', path: '/teacher/students', icon: <FaUserGraduate /> },
            { id: 'attendance', name: 'Mark Attendance', path: '/teacher/attendance', icon: <FaClipboardList /> },
            { id: 'marks', name: 'Enter Marks', path: '/teacher/marks', icon: <FaBook /> },
            { id: 'performance', name: 'Class Performance', path: '/teacher/performance', icon: <FaChartLine /> },
            { id: 'remarks', name: 'Manage Remarks', path: '/teacher/remarks', icon: <FaCommentDots /> },
            { id: 'settings', name: 'Settings', path: '/teacher/settings', icon: <FaCog /> },
        ];
    } else {
        // Fallback or Parent
        commands = [
            { id: 'dashboard', name: 'Go to Dashboard', path: '/dashboard', icon: <FaSearch /> }
        ];
    }

    const filteredCommands = commands.filter(cmd => 
        cmd.name.toLowerCase().includes(query.toLowerCase())
    );

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setActiveIndex(0);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    useEffect(() => {
        setActiveIndex(0);
    }, [query]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex(prev => (prev < filteredCommands.length - 1 ? prev + 1 : prev));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex(prev => (prev > 0 ? prev - 1 : 0));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredCommands[activeIndex]) {
                    handleSelect(filteredCommands[activeIndex].path);
                }
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, activeIndex, filteredCommands, onClose]);

    const handleSelect = (path) => {
        navigate(path);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="palette-overlay" onClick={onClose}>
                <motion.div 
                    className="palette-modal"
                    initial={{ opacity: 0, scale: 0.95, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    transition={{ duration: 0.15 }}
                    onClick={e => e.stopPropagation()}
                >
                    <div className="palette-search">
                        <FaSearch className="palette-icon" />
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search or jump to..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <div className="palette-hint">ESC to close</div>
                    </div>
                    
                    <div className="palette-results">
                        {filteredCommands.length > 0 ? (
                            filteredCommands.map((cmd, index) => (
                                <div
                                    key={cmd.id}
                                    className={`palette-item ${index === activeIndex ? 'active' : ''}`}
                                    onClick={() => handleSelect(cmd.path)}
                                    onMouseEnter={() => setActiveIndex(index)}
                                >
                                    <span className="item-icon">{cmd.icon}</span>
                                    <span className="item-name">{cmd.name}</span>
                                </div>
                            ))
                        ) : (
                            <div className="palette-empty">No results found for "{query}"</div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
