import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, ChefHat, ShoppingCart, Settings, List, Activity, LogOut, X, Database, Calendar, BarChart3, TrendingUp, AlertCircle, Cpu, History, ShieldCheck } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { user } = useUser();
    const { isSidebarOpen, isMobile, closeSidebar, setIsSidebarOpen } = useUI();
    const { logout, authUser } = useAuth();
    const navigate = useNavigate();

    const role = authUser?.role?.toLowerCase() || 'user';

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: TrendingUp, label: 'Executive Stats', path: '/admin/dashboard', allowedRoles: ['admin', 'manager'] },
        { icon: Users, label: 'Users', path: '/users', allowedRoles: ['admin', 'manager'] },
        { icon: ChefHat, label: 'Recipes', path: '/recipes' },
        { icon: Calendar, label: 'Meal Planner', path: '/meal-planner' },
        { icon: List, label: 'Inventory Data', path: '/inventory' },
        { icon: ShoppingCart, label: 'Grocery Lists', path: '/grocery' },
        { icon: Cpu, label: 'AI Command Center', path: '/admin/ai-command-center', allowedRoles: ['admin', 'manager'] },
        { icon: History, label: 'Audit Logs', path: '/admin/audit-logs', allowedRoles: ['admin'] },
        { icon: ShieldCheck, label: 'Notifications', path: '/admin/notifications', allowedRoles: ['admin', 'manager'] },
        { icon: Database, label: 'Database Panel', path: '/database', allowedRoles: ['admin'] },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ].filter(item => !item.allowedRoles || item.allowedRoles.includes(role));

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            logout();
            navigate('/login');
        }
    };

    const handleNavClick = () => {
        // Close sidebar on mobile after clicking a menu item
        closeSidebar();
    };

    return (
        <>
            {/* Overlay for mobile */}
            {isMobile && isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    bg-dark text-white flex flex-col transition-all duration-300 ease-in-out z-50
                    ${isMobile
                        ? `fixed inset-y-0 left-0 w-72 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
                        : `relative ${isSidebarOpen ? 'w-64' : 'w-20'}`
                    }
                `}
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-700 flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-primary rounded-lg mr-3 flex items-center justify-center font-bold text-white flex-shrink-0">S</div>
                        <span className={`text-xl font-bold tracking-wide transition-opacity duration-300 ${!isSidebarOpen && !isMobile ? 'opacity-0 hidden' : 'opacity-100'}`}>
                            {role === 'admin' ? 'Savora Admin' : 'Savora Dashboard'}
                        </span>
                    </div>

                    {/* Close button for mobile */}
                    {isMobile && (
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={handleNavClick}
                            className={({ isActive }) =>
                                `flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-primary/20 text-primary font-medium'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`
                            }
                            title={!isSidebarOpen && !isMobile ? item.label : undefined}
                        >
                            <item.icon className={`w-5 h-5 ${isSidebarOpen || isMobile ? 'mr-3' : ''} flex-shrink-0`} />
                            <span className={`transition-opacity duration-300 ${!isSidebarOpen && !isMobile ? 'opacity-0 hidden' : 'opacity-100'}`}>
                                {item.label}
                            </span>
                        </NavLink>
                    ))}
                </nav>

                {/* User Section */}
                <div className="p-4 border-t border-gray-700">
                    <div className={`flex items-center ${isSidebarOpen || isMobile ? 'justify-between' : 'justify-center'} p-3 rounded-xl hover:bg-gray-800/50 transition-all duration-300 border border-transparent hover:border-gray-700/50 group cursor-pointer relative overflow-hidden`}>
                        {/* subtle glow effect */}
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                        <NavLink
                            to="/settings"
                            onClick={handleNavClick}
                            className={`flex items-center gap-3 z-10 ${isSidebarOpen || isMobile ? 'w-auto' : 'w-full justify-center'}`}
                        >
                            <div className="relative flex-shrink-0">
                                <img
                                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'Admin')}&background=random&color=fff`}
                                    alt="User Avatar"
                                    className="w-10 h-10 rounded-full object-cover border-2 border-transparent group-hover:border-primary transition-colors"
                                />
                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-dark"></div>
                            </div>
                            <div className={`flex-1 min-w-0 transition-opacity duration-300 ${!isSidebarOpen && !isMobile ? 'opacity-0 hidden' : 'opacity-100'}`}>
                                <h4 className="text-sm font-semibold text-white truncate">{user.name}</h4>
                                <p className="text-xs text-gray-400 truncate group-hover:text-gray-300">{user.role}</p>
                            </div>
                        </NavLink>

                        {(isSidebarOpen || isMobile) && (
                            <button
                                onClick={handleLogout}
                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded-lg transition-all ml-2 z-10"
                                title="Sign Out"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
