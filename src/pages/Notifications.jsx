import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Settings, AlertTriangle, ShoppingCart, Utensils, Info } from 'lucide-react';
import { notificationService } from '../services/api';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [settings, setSettings] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all'); // 'all' or 'settings'

    useEffect(() => {
        fetchNotifications();
        fetchSettings();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await notificationService.getAll();
            setNotifications(response.data);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSettings = async () => {
        try {
            const response = await notificationService.getSettings();
            setSettings(response.data);
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markRead(id);
            setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleReadAll = async () => {
        try {
            await notificationService.markReadAll();
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        try {
            await notificationService.updateSettings(settings);
            alert('Settings updated successfully!');
            setActiveTab('all');
        } catch (error) {
            console.error('Failed to update settings:', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'EXPIRY': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
            case 'GROCERY': return <ShoppingCart className="w-5 h-5 text-blue-500" />;
            case 'MEAL': return <Utensils className="w-5 h-5 text-emerald-500" />;
            case 'ADMIN': return <Info className="w-5 h-5 text-purple-500" />;
            default: return <Bell className="w-5 h-5 text-gray-500" />;
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Smart Notifications</h1>
                    <p className="text-gray-500 mt-1">Stay updated on your food inventory and grocery Needs</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab(activeTab === 'settings' ? 'all' : 'settings')}
                        className={`p-2 rounded-lg border transition-colors ${activeTab === 'settings' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                    {activeTab === 'all' && (
                        <button
                            onClick={handleReadAll}
                            className="text-sm font-medium text-primary hover:underline px-3 py-2"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>
            </div>

            {activeTab === 'settings' ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Settings className="w-6 h-6 text-primary" />
                        Notification Preferences
                    </h2>
                    <form onSubmit={handleSaveSettings} className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <h4 className="font-semibold text-gray-800">Expiry Alerts</h4>
                                    <p className="text-xs text-gray-500">Get notified 7, 3, and 1 day before food expires</p>
                                </div>
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 accent-primary"
                                    checked={settings?.expiryAlerts}
                                    onChange={(e) => setSettings({ ...settings, expiryAlerts: e.target.checked })}
                                />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <h4 className="font-semibold text-gray-800">Grocery Reminders</h4>
                                    <p className="text-xs text-gray-500">Alerts when your "Buy Now" list grows or stock is low</p>
                                </div>
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 accent-primary"
                                    checked={settings?.groceryReminders}
                                    onChange={(e) => setSettings({ ...settings, groceryReminders: e.target.checked })}
                                />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <h4 className="font-semibold text-gray-800">Meal Suggestions</h4>
                                    <p className="text-xs text-gray-500">Smart recipes based on ingredients you already have</p>
                                </div>
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 accent-primary"
                                    checked={settings?.mealSuggestions}
                                    onChange={(e) => setSettings({ ...settings, mealSuggestions: e.target.checked })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Silent Hours Start</label>
                                <input
                                    type="time"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                                    value={settings?.silentHoursStart || ''}
                                    onChange={(e) => setSettings({ ...settings, silentHoursStart: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Silent Hours End</label>
                                <input
                                    type="time"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                                    value={settings?.silentHoursEnd || ''}
                                    onChange={(e) => setSettings({ ...settings, silentHoursEnd: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button
                                type="submit"
                                className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-lg"
                            >
                                Save Changes
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('all')}
                                className="px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                            <p className="mt-4 text-gray-500 font-medium">Loading notifications...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
                            <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bell className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">All caught up!</h3>
                            <p className="text-gray-500 max-w-xs mx-auto mt-2">No new notifications. We'll alert you when something needs your attention.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
                            {notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={`p-5 flex gap-4 transition-colors ${notif.isRead ? 'bg-white' : 'bg-primary/5 border-l-4 border-l-primary'}`}
                                >
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${notif.isRead ? 'bg-gray-50 text-gray-400' : 'bg-white shadow-sm'}`}>
                                        {getIcon(notif.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className={`font-bold ${notif.isRead ? 'text-gray-700' : 'text-gray-900'}`}>{notif.title}</h4>
                                            <span className="text-xs text-gray-400">{new Date(notif.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className={`text-sm ${notif.isRead ? 'text-gray-500' : 'text-gray-600'}`}>{notif.message}</p>
                                        {notif.activityLink && (
                                            <a
                                                href={notif.activityLink}
                                                className="inline-block mt-3 text-xs font-bold text-primary hover:underline uppercase tracking-wider"
                                            >
                                                View Details
                                            </a>
                                        )}
                                    </div>
                                    {!notif.isRead && (
                                        <button
                                            onClick={() => handleMarkAsRead(notif.id)}
                                            className="p-2 text-gray-400 hover:text-primary transition-colors self-center"
                                            title="Mark as read"
                                        >
                                            <Check className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Notifications;
