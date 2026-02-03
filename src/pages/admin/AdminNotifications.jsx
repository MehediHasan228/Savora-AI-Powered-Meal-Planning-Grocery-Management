import React, { useState, useEffect } from 'react';
import { Send, Users, Activity, AlertCircle, BarChart3, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { notificationService } from '../../services/api';

const AdminNotifications = () => {
    const [stats, setStats] = useState(null);
    const [systemStatus, setSystemStatus] = useState('ACTIVE');
    const [isLoading, setIsLoading] = useState(true);
    const [broadcastData, setBroadcastData] = useState({
        title: '',
        message: '',
        segment: 'ALL',
        dietPreference: '',
        activityLink: ''
    });
    const [isSending, setIsSending] = useState(false);
    const [feedback, setFeedback] = useState(null);

    useEffect(() => {
        fetchStats();
        fetchSystemStatus();
    }, []);

    const fetchSystemStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/admin/notifications/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // We'll actually add a dedicated status check or reuse stats if we include it there
            // For now, let's just assume we need to fetch the system flag
        } catch (error) {
            console.error(error);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await notificationService.getStats();
            setStats(response.data);
            setSystemStatus(response.data.systemStatus || 'ACTIVE');
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBroadcast = async (e) => {
        e.preventDefault();
        setIsSending(true);
        setFeedback(null);
        try {
            const response = await notificationService.sendBroadcast(broadcastData);
            setFeedback({
                type: 'success',
                message: `Broadcast sent successfully! Target: ${response.data.results.sent} users.`
            });
            setBroadcastData({ title: '', message: '', segment: 'ALL', dietPreference: '', activityLink: '' });
            fetchStats();
        } catch (error) {
            setFeedback({ type: 'error', message: 'Failed to send broadcast.' });
        } finally {
            setIsSending(false);
        }
    };

    const handleEmergencyStop = async () => {
        const newStatus = systemStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
        if (window.confirm(`${newStatus === 'PAUSED' ? 'HALT' : 'RESUME'} ALL NOTIFICATIONS?`)) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/admin/notifications/emergency-stop`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ status: newStatus })
                });
                const data = await response.json();
                setSystemStatus(newStatus);
                alert(data.message);
            } catch (error) {
                console.error(error);
                alert('Action failed.');
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Notification Command Center</h1>
                    <p className="text-gray-500 mt-1">Manage broadcasts, segments, and system-wide alerts</p>
                </div>
                <button
                    onClick={handleEmergencyStop}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all shadow-sm border ${systemStatus === 'ACTIVE'
                            ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
                            : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                        }`}
                >
                    <ShieldAlert className="w-5 h-5" />
                    {systemStatus === 'ACTIVE' ? 'EMERGENCY STOP' : 'RESUME SYSTEM'}
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400 font-medium">Total Sent</p>
                            <h3 className="text-2xl font-bold text-gray-800">{stats?.total || 0}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400 font-medium">Read Rate</p>
                            <h3 className="text-2xl font-bold text-gray-800">{stats?.readRate || '0%'}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400 font-medium">Active Campaigns</p>
                            <h3 className="text-2xl font-bold text-gray-800">{stats?.typeStats?.length || 0}</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Broadcast Composer */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                        <Send className="w-5 h-5 text-primary" />
                        <h3 className="font-bold text-gray-800">Compose Broadcast</h3>
                    </div>
                    <form onSubmit={handleBroadcast} className="p-6 space-y-4">
                        {feedback && (
                            <div className={`p-4 rounded-xl flex items-center gap-3 ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                <span className="text-sm font-medium">{feedback.message}</span>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Target Segment</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['ALL', 'DIET', 'INACTIVE'].map(seg => (
                                    <button
                                        key={seg}
                                        type="button"
                                        onClick={() => setBroadcastData({ ...broadcastData, segment: seg })}
                                        className={`py-2 text-xs font-bold rounded-lg border transition-all ${broadcastData.segment === seg ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                                    >
                                        {seg}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {broadcastData.segment === 'DIET' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine Preference</label>
                                <select
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                                    value={broadcastData.dietPreference}
                                    onChange={(e) => setBroadcastData({ ...broadcastData, dietPreference: e.target.value })}
                                >
                                    <option value="">Select Cuisine...</option>
                                    <option value="Italian">Italian</option>
                                    <option value="Asian">Asian</option>
                                    <option value="Mexican">Mexican</option>
                                    <option value="Vegan">Vegan</option>
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                                required
                                type="text"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                                placeholder="e.g., Happy Lunar New Year! 🐉"
                                value={broadcastData.title}
                                onChange={(e) => setBroadcastData({ ...broadcastData, title: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Message Body</label>
                            <textarea
                                required
                                rows="4"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-sm"
                                placeholder="What would you like to say to your users?"
                                value={broadcastData.message}
                                onChange={(e) => setBroadcastData({ ...broadcastData, message: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Activity Link (Optional)</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                                placeholder="/recipes or /inventory"
                                value={broadcastData.activityLink}
                                onChange={(e) => setBroadcastData({ ...broadcastData, activityLink: e.target.value })}
                            />
                        </div>

                        <button
                            disabled={isSending}
                            type="submit"
                            className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSending ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    SEND BROADCAST
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Analytics Segment */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        <h3 className="font-bold text-gray-800">Notification Volume by Type</h3>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {stats?.typeStats?.map((type, i) => {
                                const percentage = ((type._count._all / stats.total) * 100).toFixed(0);
                                return (
                                    <div key={i} className="space-y-1.5">
                                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                                            <span className="text-gray-500">{type.type}</span>
                                            <span className="text-gray-900">{type._count._all} ({percentage}%)</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${type.type === 'EXPIRY' ? 'bg-red-500' :
                                                    type.type === 'GROCERY' ? 'bg-blue-500' :
                                                        type.type === 'MEAL' ? 'bg-emerald-500' :
                                                            'bg-purple-500'
                                                    }`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}

                            {!stats?.typeStats?.length && (
                                <div className="text-center py-10">
                                    <p className="text-gray-400 text-sm">No data available yet</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 p-4 bg-primary/5 rounded-xl border border-primary/10">
                            <div className="flex gap-3">
                                <Users className="w-5 h-5 text-primary" />
                                <div>
                                    <h4 className="text-sm font-bold text-gray-800">Audience Reach</h4>
                                    <p className="text-xs text-gray-500 mt-1">Based on current segments, a broadcast to "ALL" will reach approximately 100% of your active user base.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminNotifications;
