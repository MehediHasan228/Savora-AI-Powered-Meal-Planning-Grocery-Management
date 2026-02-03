import React, { useEffect } from 'react';
import { Menu, Bell, Search, LogOut, User, ChevronDown, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';

const GlobalHeader = ({ title = 'Dashboard' }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        toggleSidebar,
        searchQuery,
        setSearchQuery,
        notifications,
        unreadCount,
        isNotificationOpen,
        toggleNotifications,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        showProfileMenu,
        toggleProfileMenu,
        setShowProfileMenu,
        setIsNotificationOpen
    } = useUI();
    const { logout } = useAuth();
    const { user } = useUser();

    const [isMobileSearchOpen, setIsMobileSearchOpen] = React.useState(false);

    // Close menus on route change
    useEffect(() => {
        setIsNotificationOpen(false);
        setShowProfileMenu(false);
        setIsMobileSearchOpen(false);
    }, [location.pathname, setIsNotificationOpen, setShowProfileMenu]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsNotificationOpen(false);
                setShowProfileMenu(false);
                setIsMobileSearchOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [setIsNotificationOpen, setShowProfileMenu]);

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            logout();
            navigate('/login');
        }
    };

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 shadow-sm sticky top-0 z-30 w-full">
            {/* Left Section */}
            <div className={`flex items-center gap-4 flex-1 ${isMobileSearchOpen ? 'hidden md:flex' : 'flex'}`}>
                {/* Mobile Hamburger */}
                <button
                    onClick={toggleSidebar}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
                    aria-label="Toggle menu"
                >
                    <Menu className="w-6 h-6" />
                </button>

                {/* Desktop Toggle */}
                <button
                    onClick={toggleSidebar}
                    className="hidden lg:flex p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Toggle sidebar"
                >
                    <Menu className="w-5 h-5" />
                </button>

                {/* Search Bar (Desktop) */}
                <div className="hidden md:flex items-center relative max-w-md w-full ml-4">
                    <Search className="absolute left-3 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search anything..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 p-0.5 hover:bg-gray-200 rounded-full transition-colors"
                        >
                            <X className="w-3 h-3 text-gray-400" />
                        </button>
                    )}
                </div>

                {/* Page Title (Mobile) */}
                <h2 className="text-lg font-semibold text-gray-800 md:hidden truncate">{title}</h2>
            </div>

            {/* Mobile Search Input (Visible when toggled) */}
            {isMobileSearchOpen && (
                <div className="flex-1 md:hidden flex items-center gap-2 px-1">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            autoFocus
                            type="text"
                            placeholder="Search..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => { setIsMobileSearchOpen(false); setSearchQuery(''); }}
                        className="p-2 text-gray-500 hover:text-gray-700"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Right Section */}
            <div className={`flex items-center gap-2 sm:gap-4 ml-4 ${isMobileSearchOpen ? 'hidden md:flex' : 'flex'}`}>
                {/* Mobile Search Toggle */}
                <button
                    onClick={() => setIsMobileSearchOpen(true)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors md:hidden"
                >
                    <Search className="w-5 h-5" />
                </button>

                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={toggleNotifications}
                        className={`p-2 rounded-lg transition-colors relative ${isNotificationOpen ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Notifications Dropdown */}
                    {isNotificationOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsNotificationOpen(false)} />
                            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                    <h3 className="font-bold text-gray-800">Notifications</h3>
                                    <div className="flex gap-3">
                                        <button onClick={markAllAsRead} className="text-xs text-primary hover:underline font-medium">Mark all read</button>
                                        <button onClick={clearNotifications} className="text-xs text-gray-400 hover:text-red-500 font-medium">Clear</button>
                                    </div>
                                </div>
                                <div className="max-h-[400px] overflow-y-auto">
                                    {notifications.length > 0 ? (
                                        notifications.map((notif) => (
                                            <button
                                                key={notif.id}
                                                onClick={() => { markAsRead(notif.id); if (notif.activityLink) navigate(notif.activityLink); setIsNotificationOpen(false); }}
                                                className={`w-full px-5 py-4 text-left border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors flex gap-4 ${!notif.isRead ? 'bg-primary/5' : ''}`}
                                            >
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${notif.type === 'MEAL' ? 'bg-amber-100 text-amber-600' :
                                                        notif.type === 'EXPIRY' ? 'bg-red-100 text-red-600' :
                                                            notif.type === 'GROCERY' ? 'bg-blue-100 text-blue-600' :
                                                                'bg-purple-100 text-purple-600'
                                                    }`}>
                                                    <Bell className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <p className={`text-sm font-semibold truncate ${!notif.isRead ? 'text-gray-900' : 'text-gray-600'}`}>{notif.title}</p>
                                                        <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{new Date(notif.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{notif.message}</p>
                                                </div>
                                                {!notif.isRead && <div className="w-2 h-2 bg-primary rounded-full mt-2" />}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="py-12 text-center">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Bell className="w-8 h-8 text-gray-300" />
                                            </div>
                                            <p className="text-gray-500 text-sm">No notifications yet</p>
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                                    <button className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors">
                                        View all notifications
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                    <button
                        onClick={toggleProfileMenu}
                        className={`flex items-center gap-2 p-1.5 rounded-xl transition-all ${showProfileMenu ? 'bg-gray-100' : 'hover:bg-gray-100'}`}
                    >
                        <img
                            src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random&color=fff`}
                            alt="Profile"
                            className="w-8 h-8 rounded-lg object-cover border-2 border-white shadow-sm"
                        />
                        <div className="hidden lg:block text-left mr-1">
                            <span className="block text-xs font-bold text-gray-900 uppercase tracking-wider leading-none mb-0.5">{user?.name || 'User'}</span>
                            <span className="block text-[10px] text-gray-400 font-medium leading-none">
                                {user?.role?.toLowerCase() === 'admin' ? 'Super Administrator' : `${user?.plan || 'Free'} Member`}
                            </span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-gray-400 hidden md:block transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Profile Dropdown Menu */}
                    {showProfileMenu && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                                    <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                </div>
                                <div className="p-2">
                                    <button
                                        onClick={() => { navigate('/settings'); setShowProfileMenu(false); }}
                                        className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-600 hover:text-primary hover:bg-primary/5 rounded-xl flex items-center gap-3 transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                            <User className="w-4 h-4" />
                                        </div>
                                        My Profile
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-3 transition-colors mt-1"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                                            <LogOut className="w-4 h-4" />
                                        </div>
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default GlobalHeader;
