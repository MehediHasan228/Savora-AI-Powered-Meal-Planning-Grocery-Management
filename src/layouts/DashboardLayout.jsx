import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import GlobalHeader from '../components/GlobalHeader';
import { useUI } from '../context/UIContext';

// Map routes to page titles
const pageTitles = {
    '/': 'Dashboard',
    '/admin/dashboard': 'Executive Command Center',
    '/admin/ai-tuning': 'AI Logic Configuration',
    '/admin/audit-logs': 'System Audit Trail',
    '/users': 'User Management',
    '/recipes': 'Recipe Management',
    '/inventory': 'Inventory Management',
    '/grocery': 'Grocery Lists',
    '/notifications': 'Smart Notifications',
    '/ai-controls': 'AI Controls',
    '/settings': 'Settings',
    '/database': 'Database Panel',
    '/analytics': 'Behavioral Analytics'
};

const DashboardLayout = () => {
    const location = useLocation();
    const { isSidebarOpen, isMobile } = useUI();

    // Get current page title
    const pageTitle = pageTitles[location.pathname] || 'Overview';

    return (
        <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
            <Sidebar />
            <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300`}>
                <GlobalHeader title={pageTitle} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
