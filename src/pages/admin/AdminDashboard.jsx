import React, { useState, useEffect } from 'react';
import {
    Users,
    Activity,
    DollarSign,
    TrendingUp,
    ShoppingCart,
    Clock,
    AlertCircle,
    ExternalLink,
    RefreshCw,
    Calendar,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { adminDashboardService } from '../../services/api';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    Cell
} from 'recharts';

const AdminDashboard = () => {
    const [kpis, setKpis] = useState(null);
    const [trends, setTrends] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [kpiRes, trendRes] = await Promise.all([
                    adminDashboardService.getKpis(),
                    adminDashboardService.getTrends()
                ]);
                setKpis(kpiRes.data);
                setTrends(trendRes.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [refreshKey]);

    const stats = [
        {
            label: 'Daily Active Users',
            value: kpis?.users?.dau || 0,
            total: kpis?.users?.total || 0,
            icon: Users,
            color: 'blue',
            trend: '+12%',
            trendUp: true
        },
        {
            label: 'Grocery Conversion',
            value: kpis?.activity?.groceryConversion || '0%',
            sub: 'Total items bought',
            icon: ShoppingCart,
            color: 'emerald',
            trend: '+5.4%',
            trendUp: true
        },
        {
            label: 'Monthly API Cost',
            value: kpis?.finances?.estimatedApiCost || '$0.00',
            sub: `${kpis?.finances?.billableCalls || 0} billable calls`,
            icon: DollarSign,
            color: 'amber',
            trend: '-2.1%',
            trendUp: false
        },
        {
            label: 'Inventory Waste',
            value: kpis?.health?.inventoryWaste || '0%',
            sub: 'Items expired',
            icon: AlertCircle,
            color: 'red',
            trend: '-8%',
            trendUp: false
        }
    ];

    if (isLoading && !kpis) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-gray-500 font-medium italic">Loading Command Center...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Executive Dashboard</h1>
                    <p className="text-gray-500 mt-1 font-medium">Real-time platform KPIs and system health metrics</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setRefreshKey(prev => prev + 1)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-semibold text-gray-700 shadow-sm"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh Data
                    </button>
                    <div className="h-10 w-px bg-gray-200 hidden md:block" />
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-400 bg-gray-100 px-3 py-2 rounded-xl">
                        <Clock className="w-4 h-4" />
                        Last Sync: {new Date().toLocaleTimeString()}
                    </div>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-bold ${stat.trendUp ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'} px-2 py-1 rounded-full`}>
                                {stat.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {stat.trend}
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-gray-900">{stat.value}</h3>
                        <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-wider">{stat.label}</p>
                        {stat.total > 0 && (
                            <div className="mt-4 flex items-center gap-2">
                                <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                    <div className={`bg-${stat.color}-500 h-full`} style={{ width: `${(stat.value / stat.total) * 100}%` }}></div>
                                </div>
                                <span className="text-[10px] font-bold text-gray-400">Total: {stat.total}</span>
                            </div>
                        )}
                        {stat.sub && <p className="text-xs text-gray-400 mt-4 font-medium italic">{stat.sub}</p>}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Trend Chart */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <TrendingUp className="w-6 h-6 text-primary" />
                                Growth & Activity
                            </h3>
                            <p className="text-sm text-gray-400 font-medium">New users vs. platform engagement</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-lg">
                                <div className="w-2 h-2 rounded-full bg-primary"></div>
                                Activity
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-600 text-xs font-bold rounded-lg">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                New Users
                            </div>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trends}>
                                <defs>
                                    <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#41c98c" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#41c98c" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="activity"
                                    stroke="#41c98c"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorActivity)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="newUsers"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorUsers)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* System Efficiency */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Efficiency Scoring</h3>
                    <p className="text-sm text-gray-400 font-medium mb-8">Platform-wide optimization metrics</p>

                    <div className="space-y-6 flex-1">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm font-bold">
                                <span className="text-gray-500">Meal Plan Conversion</span>
                                <span className="text-primary">{kpis?.activity?.groceryConversion}</span>
                            </div>
                            <div className="w-full h-3 bg-gray-50 rounded-full overflow-hidden p-0.5 border border-gray-100">
                                <div
                                    className="h-full bg-primary rounded-full"
                                    style={{ width: kpis?.activity?.groceryConversion }}
                                ></div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm font-bold">
                                <span className="text-gray-500">Notification Open Rate</span>
                                <span className="text-blue-600">{kpis?.health?.notificationOpenRate}</span>
                            </div>
                            <div className="w-full h-3 bg-gray-50 rounded-full overflow-hidden p-0.5 border border-gray-100">
                                <div
                                    className="h-full bg-blue-500 rounded-full"
                                    style={{ width: kpis?.health?.notificationOpenRate }}
                                ></div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm font-bold">
                                <span className="text-gray-500">Avg. Inventory Health</span>
                                <span className="text-emerald-600">84%</span>
                            </div>
                            <div className="w-full h-3 bg-gray-50 rounded-full overflow-hidden p-0.5 border border-gray-100">
                                <div
                                    className="h-full bg-emerald-500 rounded-full"
                                    style={{ width: '84%' }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-colors flex items-center justify-center gap-2 group">
                            Generate Full Audit Report
                            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
