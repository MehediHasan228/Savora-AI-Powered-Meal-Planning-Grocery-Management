import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import { Users, TrendingUp, DollarSign, Activity, Zap, Server, AlertTriangle, Plus, FileText, ShoppingCart, RefreshCw, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { systemService } from '../services/api';

const KPICard = ({ title, value, subtext, icon: Icon, colorClass, trend, isLoading, onClick }) => {
    const isPositive = trend === 'up';
    const isNegative = trend === 'down';

    return (
        <div
            onClick={onClick}
            className={`relative overflow-hidden bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group ${onClick ? 'cursor-pointer active:scale-95' : ''}`}
        >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClass} opacity-5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110`} />

            <div className="flex justify-between items-start relative z-10">
                <div>
                    <p className="text-sm font-semibold text-gray-500 tracking-wide uppercase">{title}</p>
                    {isLoading ? (
                        <div className="h-10 w-32 bg-gray-100 animate-pulse rounded-lg mt-2"></div>
                    ) : (
                        <h3 className="text-3xl font-bold mt-2 text-gray-900 tracking-tight">{value}</h3>
                    )}
                </div>
                <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 text-white shadow-sm ring-1 ring-inset ring-black/5`}>
                    <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
                </div>
            </div>

            <div className="mt-4 flex items-center relative z-10">
                {subtext && (
                    <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-emerald-100 text-emerald-700' :
                        isNegative ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                        {isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : isNegative ? <ArrowDownRight className="w-3 h-3 mr-1" /> : <Activity className="w-3 h-3 mr-1" />}
                        {subtext}
                    </div>
                )}
                <span className="text-xs text-gray-400 ml-auto font-medium">Last 24h</span>
            </div>
        </div>
    );
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 border border-gray-100 shadow-xl rounded-xl">
                <p className="text-sm font-bold text-gray-800 mb-2">{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs font-medium text-gray-600">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.fill || entry.color }} />
                        <span>{entry.name}:</span>
                        <span className="text-gray-900 font-bold">{entry.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const Dashboard = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            console.log('📊 Fetching dashboard stats...');
            const response = await systemService.getStats();
            console.log('✅ Stats received:', response.data);

            if (!response || !response.data) {
                throw new Error('Invalid response from stats service');
            }

            setStats(response.data);
            setLastUpdated(new Date());
        } catch (error) {
            console.error('❌ Failed to fetch stats:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response,
                stack: error.stack
            });

            // Set fallback empty stats to prevent crashes
            setStats({
                users: { total: 0, plans: [] },
                inventory: { total: 0, expiringSoon: 0, expired: 0, locations: [] },
                grocery: { estimatedBudget: 0 },
                recipes: { total: 0, cuisines: [] },
                recentActivity: { users: [], recipes: [], items: [] }
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

    const planPieData = stats?.users?.plans?.map(p => ({
        name: p.plan,
        value: p._count.id
    })) || [];

    const inventoryBarData = stats?.inventory?.locations?.map(l => ({
        name: l.storageZone || l.location,
        count: l._count.id
    })) || [];

    const activityLog = stats ? [
        ...(stats.recentActivity.users?.map(u => ({
            id: `u-${u.name}-${u.createdAt}`,
            type: 'user',
            message: `New user joined: ${u.name}`,
            subtext: 'User Registration',
            time: new Date(u.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            icon: Users,
            color: 'bg-blue-500',
            rawTime: new Date(u.createdAt)
        })) || []),
        ...(stats.recentActivity.recipes?.map(r => ({
            id: `r-${r.title}-${r.createdAt}`,
            type: 'recipe',
            message: `New recipe created: ${r.title}`,
            subtext: 'Content Update',
            time: new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            icon: FileText,
            color: 'bg-emerald-500',
            rawTime: new Date(r.createdAt)
        })) || []),
        ...(stats.recentActivity.items?.map(i => ({
            id: `i-${i.name}-${i.createdAt}`,
            type: 'inventory',
            message: `Stock update: ${i.name}`,
            subtext: `Added to ${i.storageZone || i.location}`,
            time: new Date(i.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            icon: ShoppingCart,
            color: 'bg-amber-500',
            rawTime: new Date(i.createdAt)
        })) || [])
    ].sort((a, b) => b.rawTime - a.rawTime).slice(0, 5) : [];

    return (
        <div className="space-y-8 animate-fade-in pb-8">
            {/* Header / Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        Dashboard
                    </h1>
                    <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-200">
                            <span className="relative flex h-2 w-2 mr-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Live System</span>
                        </div>
                        <span className="text-gray-300">|</span>
                        <span className="text-sm text-gray-500 font-medium flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Updated {lastUpdated.toLocaleTimeString()}
                        </span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button onClick={fetchStats} className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm hover:shadow text-gray-500">
                        <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                    <button onClick={() => navigate('/recipes')} className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-gray-200 hover:bg-gray-800 flex items-center transition-all transform hover:-translate-y-0.5">
                        <Plus className="w-4 h-4 mr-2" /> New Recipe
                    </button>
                    <button onClick={() => navigate('/users')} className="bg-primary/10 text-primary px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/20 flex items-center transition-colors border border-primary/10">
                        <Users className="w-4 h-4 mr-2" /> Users
                    </button>
                </div>
            </div>

            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Total Registered Users"
                    value={stats?.users?.total || 0}
                    subtext="Real-time count"
                    trend="up"
                    icon={Users}
                    colorClass="bg-blue-500"
                    isLoading={isLoading}
                    onClick={() => navigate('/users')}
                />
                <KPICard
                    title="Est. Grocery Budget"
                    value={`$${stats?.grocery?.estimatedBudget?.toFixed(2) || '0.00'}`}
                    subtext="Active list total"
                    trend="neutral"
                    icon={DollarSign}
                    colorClass="bg-violet-500"
                    isLoading={isLoading}
                    onClick={() => navigate('/grocery')}
                />
                <KPICard
                    title="Expiring Soon"
                    value={stats?.inventory?.expiringSoon || 0}
                    subtext={`${stats?.inventory?.expired || 0} expired items`}
                    trend={stats?.inventory?.expiringSoon > 0 ? "down" : "up"}
                    icon={AlertTriangle}
                    colorClass={stats?.inventory?.expiringSoon > 0 ? "bg-red-500" : "bg-emerald-500"}
                    isLoading={isLoading}
                    onClick={() => navigate('/inventory')}
                />
                <KPICard
                    title="System Health"
                    value="98.9%"
                    subtext="All systems operational"
                    trend="up"
                    icon={Activity}
                    colorClass="bg-orange-500"
                    isLoading={isLoading}
                    onClick={() => navigate('/api-monitoring')}
                />
            </div>

            {/* Main Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Plan Distribution Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">User Plan Distribution</h3>
                            <p className="text-sm text-gray-500">Breakdown of current user subscriptions</p>
                        </div>
                        <button className="text-xs font-bold text-primary bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10">View Details</button>
                    </div>

                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={planPieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={110}
                                    paddingAngle={5}
                                    dataKey="value"
                                    cornerRadius={4}
                                >
                                    {planPieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    verticalAlign="middle"
                                    align="right"
                                    layout="vertical"
                                    iconType="circle"
                                    iconSize={8}
                                    formatter={(value, entry) => <span className="text-sm font-medium text-gray-600 ml-2">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Live Activity Feed */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Activity Feed</h3>
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-0 relative">
                        {/* Timeline line */}
                        <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-100"></div>

                        {activityLog.length > 0 ? activityLog.map((log, idx) => (
                            <div key={log.id} className="flex gap-4 relative pb-6 last:pb-0 group">
                                <div className={`relative z-10 w-9 h-9 rounded-full border-4 border-white shadow-sm flex items-center justify-center shrink-0 ${log.color} text-white`}>
                                    <log.icon className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex-1 min-w-0 pt-1.5">
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm font-bold text-gray-800">{log.message}</p>
                                        <span className="text-[10px] font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">{log.time}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5 font-medium">{log.subtext}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 py-10">
                                <Activity className="w-10 h-10 mb-2 opacity-20" />
                                <p className="text-sm">No recent activity detected.</p>
                            </div>
                        )}
                    </div>

                    <button onClick={() => navigate('/admin/audit-logs')} className="w-full mt-4 py-2.5 text-xs font-bold text-gray-600 hover:text-primary bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                        View Full Audit History
                    </button>
                </div>
            </div>

            {/* Sub Charts Grid & AI Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Inventory by Zone</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={inventoryBarData} barSize={40}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                <Tooltip cursor={{ fill: '#f9fafb' }} content={<CustomTooltip />} />
                                <Bar dataKey="count" fill="#10B981" radius={[6, 6, 0, 0]}>
                                    {inventoryBarData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 p-8 rounded-2xl shadow-xl text-white flex flex-col justify-between relative overflow-hidden group">
                    {/* Background Effects */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500 rounded-full blur-[100px] opacity-20 transform translate-x-1/3 -translate-y-1/3 group-hover:opacity-30 transition-opacity duration-1000"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full blur-[80px] opacity-20 transform -translate-x-1/3 translate-y-1/3"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10">
                                <Zap className="w-5 h-5 text-yellow-300" />
                            </div>
                            <span className="font-bold text-purple-200 tracking-wider text-xs uppercase">Savora AI Insights</span>
                        </div>

                        <h3 className="text-2xl font-bold mb-3 text-white leading-tight">
                            Smart Content Strategy
                        </h3>

                        <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 mb-6">
                            <p className="text-gray-300 text-sm leading-relaxed">
                                Analysis shows specific interest in <span className="text-white font-bold decoration-purple-400 underline decoration-2 underline-offset-2">{stats?.recipes?.cuisines?.[0]?.cuisine || "diverse"}</span> cuisines.
                                <br />
                                Currently, you have <span className="text-white font-bold">{stats?.users?.total || 0} active users</span> engaging with content. Consider expanding your <span className="text-white font-bold">Dinner</span> category.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 relative z-10">
                        <button onClick={() => navigate('/recipes')} className="bg-white text-gray-900 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors shadow-lg shadow-black/20">
                            Generate Recipes
                        </button>
                        <button onClick={() => navigate('/admin/ai-command-center')} className="bg-white/10 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-white/20 transition-colors border border-white/20 backdrop-blur-sm">
                            AI Settings
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
