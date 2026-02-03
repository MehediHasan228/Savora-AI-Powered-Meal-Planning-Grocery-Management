import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const { authUser } = useAuth();

    // Core Profile Data
    const [user, setUser] = useState({
        name: 'Admin User',
        email: 'admin@savora.com',
        role: 'admin',
        avatar: '' // Default will be handled in UI
    });

    // Sync user with authUser from AuthContext
    useEffect(() => {
        if (authUser) {
            setUser(prev => ({
                ...prev,
                name: authUser.name || prev.name,
                email: authUser.email || prev.email,
                role: authUser.role || prev.role,
                avatar: authUser.avatar || '',
                openaiKey: authUser.openaiKey,
                spoonacularKey: authUser.spoonacularKey,
                preferences: authUser.preferences
            }));

            setApiKeys({
                openai: authUser.openaiKey || '',
                spoonacular: authUser.spoonacularKey || ''
            });

            if (authUser.preferences) {
                setUserPreferences(authUser.preferences);
            }
        }
    }, [authUser]);

    // API Configuration
    const [apiKeys, setApiKeys] = useState({
        spoonacular: '',
        openai: ''
    });

    // Notification Preferences
    const [notifications, setNotifications] = useState({
        newUserAlerts: true,
        systemErrors: true
    });

    // AI Controls Configuration
    const [aiConfig, setAiConfig] = useState({
        model: 'GPT-4 (Recommended)',
        temperature: 0.7,
        systemPrompt: "You are an expert chef and nutritional planner. Create meal plans that are efficient, cost-effective, and adhere strictly to the user's dietary restrictions."
    });

    // User Preferences for Recipe Matching
    const [userPreferences, setUserPreferences] = useState({
        dietaryPreferences: ['seafood', 'gluten-free'],
        cuisinePreferences: ['Italian', 'Asian', 'Mediterranean'],
        maxCookTime: 60, // minutes
        maxCalories: 800  // kcal
    });

    const updateProfile = (updates) => {
        setUser(prev => ({ ...prev, ...updates }));
    };

    const updateApiKeys = (keys) => {
        setApiKeys(prev => ({ ...prev, ...keys }));
    };

    const updateNotifications = (prefs) => {
        setNotifications(prev => ({ ...prev, ...prefs }));
    };

    const updateAiConfig = (config) => {
        setAiConfig(prev => ({ ...prev, ...config }));
    };

    const updateUserPreferences = (prefs) => {
        setUserPreferences(prev => ({ ...prev, ...prefs }));
    };

    const logout = () => {
        if (window.confirm("Are you sure you want to log out?")) {
            alert("Logging out... (This would redirect to login)");
        }
    };

    return (
        <UserContext.Provider value={{
            user,
            updateProfile,
            apiKeys,
            updateApiKeys,
            notifications,
            updateNotifications,
            aiConfig,
            updateAiConfig,
            userPreferences,
            updateUserPreferences,
            logout
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
