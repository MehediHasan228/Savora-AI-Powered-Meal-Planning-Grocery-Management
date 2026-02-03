import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/api';

const UIContext = createContext();

export const UIProvider = ({ children }) => {
    // Sidebar state
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    // Check screen size on mount and resize
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            // Auto-close sidebar on mobile
            if (mobile) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);

        return () => clearTimeout(handler);
    }, [searchQuery]);

    // Unified Notification Logic
    const [notifications, setNotifications] = useState([]);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);

    const fetchNotifications = useCallback(async () => {
        try {
            const response = await notificationService.getAll();
            setNotifications(response.data);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        // Set up a refresh interval every 2 minutes
        const interval = setInterval(fetchNotifications, 120000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    // Toggle sidebar
    const toggleSidebar = () => {
        setIsSidebarOpen(prev => !prev);
    };

    // Notification actions
    const toggleNotifications = () => {
        setIsNotificationOpen(prev => !prev);
        if (showProfileMenu) setShowProfileMenu(false);
    };

    const markAsRead = async (id) => {
        try {
            await notificationService.markRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationService.markReadAll();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const clearNotifications = () => {
        setNotifications([]);
        setIsNotificationOpen(false);
    };

    // Profile state (moved to context for easier management)
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const toggleProfileMenu = () => {
        setShowProfileMenu(prev => !prev);
        if (isNotificationOpen) setIsNotificationOpen(false);
    };

    // Close sidebar (for mobile after clicking menu item)
    const closeSidebar = () => {
        if (isMobile) {
            setIsSidebarOpen(false);
        }
    };

    // Open sidebar
    const openSidebar = () => {
        setIsSidebarOpen(true);
    };

    return (
        <UIContext.Provider value={{
            isSidebarOpen,
            isMobile,
            searchQuery,
            setSearchQuery,
            debouncedSearchQuery,
            notifications,
            unreadCount,
            isNotificationOpen,
            setIsNotificationOpen,
            toggleNotifications,
            markAsRead,
            markAllAsRead,
            clearNotifications,
            showProfileMenu,
            setShowProfileMenu,
            toggleProfileMenu,
            toggleSidebar,
            closeSidebar,
            openSidebar,
            setIsSidebarOpen
        }}>
            {children}
        </UIContext.Provider>
    );
};

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
};
