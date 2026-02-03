import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, MoreHorizontal, Ban, CheckCircle, Download, UserPlus, Trash2, Edit2, X, ChevronLeft, ChevronRight, Mail, User, Lock, Key, Camera } from 'lucide-react';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';
import { compressImage } from '../utils/imageUtils';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { searchQuery, setSearchQuery, debouncedSearchQuery } = useUI();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const { authUser } = useAuth();
    const isAdmin = authUser?.role?.toLowerCase() === 'admin';
    const isManager = authUser?.role?.toLowerCase() === 'manager';

    // Filter State
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState({
        role: 'All',
        status: 'All',
        plan: 'All'
    });

    const [editingUser, setEditingUser] = useState(null);
    const [selectedDetailUser, setSelectedDetailUser] = useState(null);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const fileInputRef = useRef(null);

    // Form State for Add/Edit
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'User', plan: 'Free', status: 'Active', avatar: '' });
    const [resetData, setResetData] = useState({ userId: null, username: '', password: '', confirmPassword: '' });

    // Fetch users on mount
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const response = await userService.getAll();
            setUsers(response.data.map(u => ({
                ...u,
                joined: new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
                engagementScore: Math.floor(Math.random() * 40) + 60, // Mock for now
                totalItems: Math.floor(Math.random() * 50) + 10,
                wasteRate: (Math.random() * 15).toFixed(1) + '%'
            })));
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Filter Logic
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
        const matchesRole = filters.role === 'All' || user.role === filters.role;
        const matchesStatus = filters.status === 'All' || user.status === filters.status;
        const matchesPlan = filters.plan === 'All' || user.plan === filters.plan;

        return matchesSearch && matchesRole && matchesStatus && matchesPlan;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

    // Handlers
    const handleAddUser = () => {
        setEditingUser(null);
        setFormData({ name: '', email: '', password: '', role: 'User', plan: 'Free', status: 'Active' });
        setIsModalOpen(true);
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setFormData({ ...user, password: '' });
        setIsModalOpen(true);
        setActiveDropdown(null);
    };

    const handleOpenResetModal = (user) => {
        setResetData({ userId: user.id, username: user.name, password: '', confirmPassword: '' });
        setIsResetModalOpen(true);
        setActiveDropdown(null);
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (resetData.password !== resetData.confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        try {
            await userService.resetPassword(resetData.userId, resetData.password);
            alert("Password updated successfully");
            setIsResetModalOpen(false);
        } catch (error) {
            console.error('Failed to reset password:', error);
            alert(error.response?.data?.message || 'Failed to reset password');
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await userService.delete(id);
                setUsers(users.filter(u => u.id !== id));
            } catch (error) {
                console.error('Failed to delete user:', error);
            }
        }
        setActiveDropdown(null);
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
        try {
            await userService.update(id, { status: newStatus });
            setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));
        } catch (error) {
            console.error('Failed to update status:', error);
        }
        setActiveDropdown(null);
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const compressed = await compressImage(file);
                setFormData(prev => ({ ...prev, avatar: compressed }));
            } catch (err) {
                console.error("Compression failed:", err);
                // Fallback to original if compression fails
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFormData(prev => ({ ...prev, avatar: reader.result }));
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                const response = await userService.update(editingUser.id, formData);
                setUsers(users.map(u => u.id === editingUser.id ? {
                    ...response.data,
                    joined: u.joined
                } : u));
            } else {
                const response = await userService.create(formData);
                setUsers([{
                    ...response.data,
                    joined: new Date(response.data.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
                }, ...users]);
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error('Failed to save user:', error);
            alert(error.response?.data?.message || 'Failed to save user');
        }
    };

    const resetFilters = () => {
        setFilters({ role: 'All', status: 'All', plan: 'All' });
        setIsFilterOpen(false);
    };

    const handleExport = () => {
        const headers = ["ID,Name,Email,Plan,Status,Role,Joined"];
        const rows = users.map(u => `${u.id},${u.name},${u.email},${u.plan},${u.status},${u.role}, "${u.joined}"`);
        const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "savora_users.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="relative" onClick={() => { setActiveDropdown(null); setIsFilterOpen(false); }}>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
                    <p className="text-gray-500 mt-1">Manage user access and details</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExport}
                        className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </button>
                    {isAdmin && (
                        <button
                            onClick={handleAddUser}
                            className="bg-primary text-white px-5 py-2.5 rounded-lg font-medium shadow-sm hover:bg-emerald-600 transition-colors flex items-center"
                        >
                            <UserPlus className="w-5 h-5 mr-2" />
                            Add User
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="relative flex-1 w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>

                    <div className="relative">
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsFilterOpen(!isFilterOpen); }}
                            className={`flex items-center px-4 py-2.5 border rounded-lg transition-colors ${isFilterOpen || Object.values(filters).some(v => v !== 'All')
                                ? 'border-primary text-primary bg-primary/5'
                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <Filter className="w-5 h-5 mr-2" />
                            Filters
                            {Object.values(filters).some(v => v !== 'All') && (
                                <span className="ml-2 w-2 h-2 bg-primary rounded-full"></span>
                            )}
                        </button>

                        {/* Filter Dropdown */}
                        {isFilterOpen && (
                            <div
                                className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-30 p-4 animate-in fade-in slide-in-from-top-2 duration-200"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Role</label>
                                        <select
                                            className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-primary focus:outline-none"
                                            value={filters.role}
                                            onChange={e => setFilters({ ...filters, role: e.target.value })}
                                        >
                                            <option value="All">All Roles</option>
                                            <option value="Admin">Admin</option>
                                            <option value="Manager">Manager</option>
                                            <option value="User">User</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Status</label>
                                        <select
                                            className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-primary focus:outline-none"
                                            value={filters.status}
                                            onChange={e => setFilters({ ...filters, status: e.target.value })}
                                        >
                                            <option value="All">All Statuses</option>
                                            <option value="Active">Active</option>
                                            <option value="Suspended">Suspended</option>
                                            <option value="Banned">Banned</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Plan</label>
                                        <select
                                            className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-primary focus:outline-none"
                                            value={filters.plan}
                                            onChange={e => setFilters({ ...filters, plan: e.target.value })}
                                        >
                                            <option value="All">All Plans</option>
                                            <option value="Free">Free</option>
                                            <option value="Pro">Pro</option>
                                            <option value="Premium">Premium</option>
                                        </select>
                                    </div>
                                    <div className="pt-2 flex justify-between items-center border-t border-gray-100">
                                        <button onClick={resetFilters} className="text-xs text-red-500 hover:text-red-600 font-medium">Reset All</button>
                                        <button onClick={() => setIsFilterOpen(false)} className="text-xs text-primary font-medium hover:underline">Done</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto min-h-[400px]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                            <p className="mt-4 text-gray-500">Loading users...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium text-sm">
                                <tr>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Plan</th>
                                    <th className="px-6 py-4">Joined On</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedUsers.length > 0 ? paginatedUsers.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                                        onClick={() => setSelectedDetailUser(user)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <img
                                                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff`}
                                                    alt={user.name}
                                                    className="w-10 h-10 rounded-full mr-3 object-cover"
                                                />
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'Active' ? 'bg-green-100 text-green-800' :
                                                user.status === 'Banned' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {user.status === 'Active' ? <CheckCircle className="w-3 h-3 mr-1" /> : <Ban className="w-3 h-3 mr-1" />}
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{user.role}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <span className="px-2 py-1 bg-gray-100 rounded text-xs border border-gray-200">{user.plan}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{user.joined}</td>
                                        <td className="px-6 py-4 text-right relative">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === user.id ? null : user.id); }}
                                                className="text-gray-400 hover:text-gray-700 p-2 rounded-md hover:bg-gray-100 transition-colors"
                                            >
                                                <MoreHorizontal className="w-5 h-5" />
                                            </button>

                                            {/* Dropdown Menu */}
                                            {activeDropdown === user.id && isAdmin && (
                                                <div className="absolute right-8 top-8 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                                    <button onClick={() => handleEditUser(user)} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                                        <Edit2 className="w-4 h-4 text-blue-500" /> Edit Details
                                                    </button>
                                                    <button onClick={() => handleOpenResetModal(user)} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                                        <Key className="w-4 h-4 text-emerald-500" /> Reset Password
                                                    </button>
                                                    <button onClick={() => handleToggleStatus(user.id, user.status)} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                                        <Ban className="w-4 h-4 text-orange-500" /> {user.status === 'Active' ? 'Suspend Access' : 'Activate User'}
                                                    </button>
                                                    <div className="h-px bg-gray-100 my-1"></div>
                                                    <button onClick={() => handleDeleteUser(user.id)} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                                                        <Trash2 className="w-4 h-4" /> Delete User
                                                    </button>
                                                </div>
                                            )}
                                            {activeDropdown === user.id && !isAdmin && (
                                                <div className="absolute right-8 top-8 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-20 p-4 text-xs text-gray-500 italic">
                                                    View-only access for {authUser?.role}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-12 text-gray-400">
                                            No users found matching filters
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <span className="text-sm text-gray-500">
                        Showing <span className="font-medium text-gray-800">{Math.min(startIndex + 1, filteredUsers.length)}</span> to <span className="font-medium text-gray-800">{Math.min(startIndex + itemsPerPage, filteredUsers.length)}</span> of <span className="font-medium text-gray-800">{filteredUsers.length}</span> results
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <span className="flex items-center px-4 font-medium text-gray-600 ml-2 mr-2 bg-white border border-gray-200 rounded-lg">
                            {currentPage}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Reset Password Modal */}
            {isResetModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={(e) => e.stopPropagation()}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg text-gray-800">Reset Password</h3>
                            <button onClick={() => setIsResetModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleResetPassword} className="p-6 space-y-4">
                            <p className="text-sm text-gray-500">
                                Set a new password for <span className="font-semibold text-gray-700">{resetData.username}</span>.
                            </p>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        required
                                        type="password"
                                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                                        placeholder="••••••••"
                                        value={resetData.password}
                                        onChange={e => setResetData({ ...resetData, password: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                <div className="relative">
                                    <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        required
                                        type="password"
                                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                                        placeholder="••••••••"
                                        value={resetData.confirmPassword}
                                        onChange={e => setResetData({ ...resetData, confirmPassword: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsResetModalOpen(false)} className="flex-1 py-2 border rounded-lg hover:bg-gray-50 text-gray-600 font-medium">Cancel</button>
                                <button type="submit" className="flex-1 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium">Reset Password</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Add/Edit Modal */}
            {
                isModalOpen && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold text-lg text-gray-800">{editingUser ? 'Edit User Profile' : 'Add New User'}</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                                <div className="flex justify-center mb-6">
                                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                        <img
                                            src={formData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'User')}&background=random&color=fff`}
                                            alt="Preview"
                                            className="w-20 h-20 rounded-full object-cover border-4 border-gray-50 shadow-sm group-hover:border-primary/20 transition-all"
                                        />
                                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera className="w-6 h-6 text-white" />
                                        </div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                        <div className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full shadow-md border border-gray-100">
                                            <Camera className="w-3.5 h-3.5 text-primary" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input
                                                required
                                                type="text"
                                                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                                                placeholder="John Doe"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input
                                                required
                                                type="email"
                                                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                                                placeholder="john@example.com"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    {!editingUser && (
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Initial Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                <input
                                                    required
                                                    type="password"
                                                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                                                    placeholder="Minimum 8 characters"
                                                    value={formData.password}
                                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                        <select
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white"
                                            value={formData.role}
                                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                                        >
                                            <option value="User">User</option>
                                            <option value="Admin">Admin</option>
                                            <option value="Manager">Manager</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                                        <select
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white"
                                            value={formData.plan}
                                            onChange={e => setFormData({ ...formData, plan: e.target.value })}
                                        >
                                            <option value="Free">Free</option>
                                            <option value="Pro">Pro</option>
                                            <option value="Premium">Premium</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 border rounded-lg hover:bg-gray-50 text-gray-600 font-medium">Cancel</button>
                                    <button type="submit" className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-emerald-600 font-medium">{editingUser ? 'Save Changes' : 'Create User'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Detailed User Profile View (Slide-over / Sidebar) */}
            {selectedDetailUser && (
                <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelectedDetailUser(null)} />
                    <div className="relative w-full max-w-md bg-white h-screen shadow-2xl animate-in slide-in-from-right duration-500 overflow-y-auto">
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-8">
                                <h3 className="text-xl font-bold text-gray-900 border-b-2 border-primary pb-1">Detailed Activity Profile</h3>
                                <button onClick={() => setSelectedDetailUser(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <X className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>

                            <div className="flex flex-col items-center mb-10">
                                <img
                                    src={selectedDetailUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedDetailUser.name)}&background=random&color=fff`}
                                    className="w-24 h-24 rounded-3xl object-cover shadow-lg border-4 border-white mb-4"
                                    alt="Avatar"
                                />
                                <h4 className="text-xl font-black text-gray-900">{selectedDetailUser.name}</h4>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-tighter">{selectedDetailUser.plan} Plan Member</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-10">
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Engagement</p>
                                    <p className="text-2xl font-black text-primary">{selectedDetailUser.engagementScore}%</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Waste Rate</p>
                                    <p className="text-2xl font-black text-red-500">{selectedDetailUser.wasteRate}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h5 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Summary Statistics</h5>
                                <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><ShoppingCart className="w-4 h-4" /></div>
                                        <span className="text-sm font-bold text-gray-600">Total Items Tracked</span>
                                    </div>
                                    <span className="text-sm font-black text-gray-900">{selectedDetailUser.totalItems}</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Mail className="w-4 h-4" /></div>
                                        <span className="text-sm font-bold text-gray-600">Account Status</span>
                                    </div>
                                    <span className={`text-xs font-black px-2 py-1 rounded-full ${selectedDetailUser.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {selectedDetailUser.status.toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Calendar className="w-4 h-4" /></div>
                                        <span className="text-sm font-bold text-gray-600">Member Since</span>
                                    </div>
                                    <span className="text-sm font-black text-gray-900">{selectedDetailUser.joined}</span>
                                </div>
                            </div>

                            <div className="mt-12 space-y-3">
                                <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-colors flex items-center justify-center gap-2">
                                    <Lock className="w-4 h-4" />
                                    Send Temporary Password
                                </button>
                                <button className="w-full py-4 bg-white border border-red-200 text-red-600 rounded-2xl font-black text-sm hover:bg-red-50 transition-colors">
                                    Force Account Suspension
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
