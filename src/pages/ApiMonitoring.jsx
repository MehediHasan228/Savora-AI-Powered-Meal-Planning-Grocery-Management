import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, DollarSign, Database, Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import { systemService } from '../services/api';

const ApiMonitoring = () => {
    const [stats, setStats] = useState(null);
    const [cache, setCache] = useState([]);
    const [period, setPeriod] = useState('daily');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchStats();
        fetchCache();
    }, [period]);

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            const response = await systemService.getApiUsage(period);
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCache = async () => {
        try {
            const response = await systemService.getCacheStats();
            // Mock data structure might differ, ensure we handle it gracefully or update mock
            // In mockData, getCacheStats returns { hits, misses, size }, NOT recipes list.
            // Wait, looking at original code: it expects response.data.recipes for cache list.
            // My mock systemService.getCacheStats returned { hits, misses, size }.
            // I should double check mockData logic or update this component to match.
            // The original code used /api/admin/cache?limit=10.
            // Let's assume for now I should return a list in mock or handle it here.
            // In my mockData.js update, getCacheStats returned stats object. 
            // I might need to update mockData AGAIN to provide 'recipes' array if this component needs it.
            // OR I can just map what I have. 
            // Let's look at mockData again.
            // mockSystemService.getCacheStats = () => Promise.resolve({ data: { hits: 5000, misses: 200, size: '50MB' } })
            // This component expects `response.data.recipes`.
            // I will fix `mockData.js` as well in this turn or next to be safe. 
            // For now, let's write this file to use the service.

            // To be safe, I will modify THIS component to handle the data structure safely 
            // AND I will update mockData to include a dummy recipes array.
            setCache(response.data.recipes || []);
        } catch (error) {
            console.error('Failed to fetch cache:', error);
        }
    };

    const handleClearAll = async () => {
        if (!window.confirm('Clear entire recipe cache? This will increase API costs temporarily.')) return;

        try {
            await systemService.clearCache();
            alert('Cache cleared successfully');
            fetchCache();
        } catch (error) {
            alert('Failed to clear cache');
        }
    };

    const handleClearEntry = async (id) => {
        try {
            await systemService.clearCacheItem(id);
            fetchCache();
        } catch (error) {
            alert('Failed to remove cache entry');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">API Monitoring & Cache</h1>
                <p className="text-gray-500 mt-1">Track Spoonacular API usage and manage recipe cache</p>
            </div>

            {/* Period Selector */}
            <div className="flex gap-2">
                <button
                    onClick={() => setPeriod('daily')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${period === 'daily' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Last 7 Days
                </button>
                <button
                    onClick={() => setPeriod('monthly')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${period === 'monthly' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Last Month
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total API Calls</p>
                            <p className="text-2xl font-bold text-gray-800 mt-1">{stats?.summary?.totalCalls || 0}</p>
                        </div>
                        <Activity className="w-10 h-10 text-blue-500" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Success Rate</p>
                            <p className="text-2xl font-bold text-green-600 mt-1">{stats?.summary?.successRate || 0}%</p>
                        </div>
                        <TrendingUp className="w-10 h-10 text-green-500" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Estimated Cost</p>
                            <p className="text-2xl font-bold text-orange-600 mt-1">{stats?.summary?.estimatedCost || 0} pts</p>
                        </div>
                        <DollarSign className="w-10 h-10 text-orange-500" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Cached Recipes</p>
                            <p className="text-2xl font-bold text-purple-600 mt-1">{cache.length}</p>
                        </div>
                        <Database className="w-10 h-10 text-purple-500" />
                    </div>
                </div>
            </div>

            {/* Endpoint Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">API Usage by Endpoint</h2>
                <div className="space-y-3">
                    {Object.entries(stats?.byEndpoint || {}).map(([endpoint, count]) => (
                        <div key={endpoint} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary"></div>
                                <span className="text-gray-700 font-medium capitalize">{endpoint}</span>
                            </div>
                            <span className="text-gray-500">{count} calls</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cache Management */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">Recipe Cache</h2>
                        <p className="text-sm text-gray-500 mt-1">Most popular cached recipes</p>
                    </div>
                    <button
                        onClick={handleClearAll}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Clear All Cache
                    </button>
                </div>

                <div className="divide-y divide-gray-100">
                    {cache.length === 0 ? (
                        <div className="p-12 text-center text-gray-400">
                            <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No cached recipes yet</p>
                        </div>
                    ) : (
                        cache.map(recipe => (
                            <div key={recipe.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    {recipe.image && (
                                        <img
                                            src={recipe.image}
                                            alt={recipe.title}
                                            className="w-16 h-16 rounded-lg object-cover"
                                        />
                                    )}
                                    <div>
                                        <h3 className="font-medium text-gray-800">{recipe.title}</h3>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                            <span>Popularity: {recipe.popularity}</span>
                                            <span>•</span>
                                            <span>{recipe.calories} cal</span>
                                            <span>•</span>
                                            <span className={new Date(recipe.expiresAt) > new Date() ? 'text-green-600' : 'text-red-600'}>
                                                {new Date(recipe.expiresAt) > new Date() ? '✓ Valid' : '⚠ Expired'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleClearEntry(recipe.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Alert for High Usage */}
            {stats?.summary?.estimatedCost > 100 && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-orange-800">High API Usage Detected</h3>
                        <p className="text-sm text-orange-700 mt-1">
                            You've used {stats.summary.estimatedCost} API points. Consider optimizing searches or checking cache settings.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApiMonitoring;
