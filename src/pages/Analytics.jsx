import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Trash2, ShoppingCart, ListChecks, AlertTriangle, ArrowRight } from 'lucide-react';
import { adminGroceryService } from '../services/api';

const Analytics = () => {
    const [insights, setInsights] = useState(null);
    const [waste, setWaste] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [insightsRes, wasteRes] = await Promise.all([
                adminGroceryService.getInsights(),
                adminGroceryService.getWaste()
            ]);
            setInsights(insightsRes.data);
            setWaste(wasteRes.data);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-gray-500 font-medium">Analyzing behavioral data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Behavioral Analytics</h1>
                    <p className="text-gray-500 mt-1">Insights into purchasing habits, postponement, and waste detection</p>
                </div>
                <button
                    onClick={fetchData}
                    className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    title="Refresh Data"
                >
                    <TrendingUp className="w-5 h-5 text-gray-500" />
                </button>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <ShoppingCart className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-400">Total Purchases</p>
                            <h3 className="text-2xl font-bold text-gray-800">{insights?.totalPurchases || 0}</h3>
                        </div>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full w-2/3"></div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                            <ListChecks className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-400">Avg. List Size</p>
                            <h3 className="text-2xl font-bold text-gray-800">{insights?.avgListSize || 0}</h3>
                        </div>
                    </div>
                    <p className="text-xs text-green-600 font-medium">+2.3% from last week</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-400">Postponement</p>
                            <h3 className="text-2xl font-bold text-gray-800">{insights?.postponedItems || 0}</h3>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">Items marked as "Buy Later"</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-400">Overbuy Rate</p>
                            <h3 className="text-2xl font-bold text-gray-800">{insights?.overbuyTendency || '0%'}</h3>
                        </div>
                    </div>
                    <p className="text-xs text-red-500 font-medium">Potential for excess stock</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Most Purchased Items */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-primary" />
                            Most Purchased Staples
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {insights?.mostPurchased?.length > 0 ? (
                                insights.mostPurchased.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-500">
                                            #{idx + 1}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between mb-1">
                                                <span className="text-sm font-semibold text-gray-700">{item.name}</span>
                                                <span className="text-xs font-bold text-primary">{item._count.name}x</span>
                                            </div>
                                            <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden">
                                                <div
                                                    className="bg-primary/60 h-full rounded-full transition-all duration-300"
                                                    style={{ width: `${(item._count.name / insights.mostPurchased[0]._count.name) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center py-10 text-gray-400 text-sm italic">No purchase history found.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Waste Detection */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <Trash2 className="w-5 h-5 text-red-500" />
                            High-Waste Items
                        </h3>
                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full uppercase tracking-wider">Warning</span>
                    </div>
                    <div className="p-6">
                        <div className="space-y-6">
                            {waste?.highWasteItems?.length > 0 ? (
                                waste.highWasteItems.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-red-50/30 rounded-xl border border-red-50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
                                                <AlertTriangle className="w-5 h-5 text-red-400" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-800">{item.name}</h4>
                                                <p className="text-xs text-gray-500">Expired {item.count} times in last month</p>
                                            </div>
                                        </div>
                                        <button className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                                            Adjust Threshold <ArrowRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10">
                                    <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <ListChecks className="w-8 h-8" />
                                    </div>
                                    <h4 className="text-sm font-bold text-gray-800">Excellent Work!</h4>
                                    <p className="text-xs text-gray-500 mt-1">No significant food waste patterns detected.</p>
                                </div>
                            )}
                        </div>

                        {waste?.totalExpired > 0 && (
                            <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <p className="text-xs text-gray-600 leading-relaxed italic">
                                    "Tip: You tend to overbuy <strong>{waste.highWasteItems?.[0]?.name || 'staples'}</strong>. We recommend reducing the default quantity in your Shopping List."
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
