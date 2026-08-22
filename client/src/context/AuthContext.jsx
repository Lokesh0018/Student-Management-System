import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('sms_user');
        try {
            return storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;
        } catch (e) {
            console.error("Failed to parse sms_user from localStorage", e);
            localStorage.removeItem('sms_user');
            return null;
        }
    });

    const [token, setToken] = useState(() => {
        return localStorage.getItem('sms_token') || null;
    });

    const login = (userData, authToken) => {
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('sms_user', JSON.stringify(userData));
        if (authToken) {
            localStorage.setItem('sms_token', authToken);
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('sms_user');
        localStorage.removeItem('sms_token');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
