import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [authUser, setAuthUser] = useState(null);

    // Check for existing auth on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');

            if (token) {
                // Fetch fresh profile from backend
                const response = await authService.getProfile();
                setIsAuthenticated(true);
                setAuthUser(response.data);
            } else {
                setIsAuthenticated(false);
                setAuthUser(null);
            }
        } catch (error) {
            console.error('Auth check error:', error);
            // If profile fetch fails (e.g. token expired), clear storage
            localStorage.removeItem('token');
            setIsAuthenticated(false);
            setAuthUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    // Login function
    const login = async (email, password) => {
        setIsLoading(true);
        try {
            const response = await authService.login({ email, password });
            const { token, ...userData } = response.data;

            // Store in localStorage
            localStorage.setItem('token', token);

            setAuthUser(userData);
            setIsAuthenticated(true);
            setIsLoading(false);

            return { success: true };
        } catch (error) {
            setIsLoading(false);
            const message = error.response?.data?.message || error.message;
            return { success: false, error: message };
        }
    };

    // Update profile in context
    const updateUser = (userData) => {
        setAuthUser(prev => ({ ...prev, ...userData }));
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setAuthUser(null);
        return true;
    };

    // Get current token
    const getToken = () => {
        return localStorage.getItem('token');
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            isLoading,
            authUser,
            login,
            logout,
            updateUser,
            getToken,
            checkAuth
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
