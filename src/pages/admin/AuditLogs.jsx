import React, { useState, useEffect } from 'react';
import {
    History,
    Search,
    Filter,
    Shield,
    User,
    Calendar,
    Info,
    ChevronDown,
    ChevronUp,
    Terminal,
    MapPin,
    AlertCircle,
    Eye
} from 'lucide-react';
import { systemService } from '../../services/api';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedLogId, setExpandedLogId] = useState(null);
    const [filterModule, setFilterModule] = useState('All');

    useEffect(() => {
        const fetchLogs = async () => {
            setIsLoading(true);
            try {
                // Using systemService instead of direct axios call
                const response = await systemService.getLogs({ filter: filterModule });
                setLogs(response.data);
            } catch (error) {
                console.error('Error fetching logs:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLogs();
    }, [filterModule]); // Added filterModule dependency to refresh on filter change

    const filteredLogs = filterModule === 'All'
        ? logs
        : logs.filter(log => log.module === filterModule);

    const getActionColor = (action) => {
        switch (action) {
            case 'DELETE': return 'text-red-600 bg-red-50';
            case 'CREATE': return 'text-emerald-600 bg-emerald-50';
            case 'UPDATE': return 'text-blue-600 bg-blue-50';
            case 'BROADCAST': return 'text-purple-600 bg-purple-50';
            case 'AI_OVERRIDE': return 'text-amber-600 bg-amber-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3 tracking-tighter">
                        <History className="w-8 h-8 text-primary" />
                        SYSTEM AUDIT TRAIL
                    </h1>
                    <p className="text-gray-500 font-bold">Uneditable record of all administrative actions</p>
                </div>
                <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
                    {['All', 'USERS', 'NOTIFICATIONS', 'SYSTEM', 'AI'].map(mod => (
                        <button
                            key={mod}
                            onClick={() => setFilterModule(mod)}
                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${filterModule === mod
                                ? 'bg-gray-900 text-white shadow-lg'
                                : 'text-gray-400 hover:text-gray-700'
                                }`}
                        >
                            {mod}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400">
                        <Terminal className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Live Activity Log</span>
                    </div>
                    <span className="text-[10px] font-black text-gray-400 border border-gray-200 px-2 py-1 rounded-lg">
                        RETENTION: 90 DAYS
                    </span>
                </div>

                <div className="divide-y divide-gray-50">
                    {isLoading ? (
                        <div className="p-20 text-center animate-pulse">
                            <History className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                            <p className="text-gray-300 font-bold italic">Gathering history...</p>
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="p-20 text-center">
                            <Shield className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                            <p className="text-gray-400 font-bold">No logs recorded for this module.</p>
                        </div>
                    ) : (
                        filteredLogs.map((log) => (
                            <div key={log.id} className="group hover:bg-gray-50/100 transition-colors">
                                <div
                                    className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                                    onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`px-3 py-1.5 rounded-xl font-black text-[10px] tracking-tight ${getActionColor(log.action)}`}>
                                            {log.action}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-gray-900 flex items-center gap-2">
                                                <User className="w-3.5 h-3.5 text-gray-400" />
                                                {log.admin?.name || 'System Auto'}
                                                <span className="text-gray-300 mx-1">/</span>
                                                <span className="text-primary font-bold">{log.module}</span>
                                            </p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <p className="text-xs font-bold text-gray-400 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </p>
                                                {log.ipAddress && (
                                                    <p className="text-xs font-bold text-gray-300 flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {log.ipAddress}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className="text-xs font-bold text-gray-500 italic max-w-xs truncate">
                                            {log.targetId ? `Target: ${log.targetId}` : 'No target specified'}
                                        </p>
                                        {expandedLogId === log.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                    </div>
                                </div>

                                {expandedLogId === log.id && (
                                    <div className="px-6 pb-6 pt-2 animate-in slide-in-from-top-2 duration-300">
                                        <div className="bg-gray-900 rounded-3xl p-6 overflow-x-auto border-t-4 border-primary">
                                            <div className="flex items-start gap-4 mb-6">
                                                <div className="bg-gray-800 p-2 rounded-lg text-emerald-400"><Eye className="w-4 h-4" /></div>
                                                <div>
                                                    <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Snapshot Data</h5>
                                                    <p className="text-xs font-bold text-gray-400">Comparing state before and after action</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <h6 className="text-[10px] font-black text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full inline-block uppercase mb-2">Old State</h6>
                                                    <pre className="text-[11px] font-mono text-gray-400 leading-relaxed max-h-40 overflow-y-auto">
                                                        {log.oldData ? JSON.stringify(JSON.parse(log.oldData), null, 2) : '// No previous state recorded'}
                                                    </pre>
                                                </div>
                                                <div>
                                                    <h6 className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full inline-block uppercase mb-2">New State</h6>
                                                    <pre className="text-[11px] font-mono text-emerald-100 leading-relaxed max-h-40 overflow-y-auto">
                                                        {log.newData ? JSON.stringify(JSON.parse(log.newData), null, 2) : '// No new state provided'}
                                                    </pre>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 bg-gray-50/30 flex items-center justify-center border-t border-gray-50">
                    <button className="text-[10px] font-black text-gray-400 hover:text-primary transition-colors flex items-center gap-2 group">
                        LOAD MORE ACTIVITY
                        <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-4 p-6 bg-blue-50/50 rounded-3xl border border-blue-100 border-dashed">
                <Info className="w-5 h-5 text-blue-500 shrink-0" />
                <p className="text-xs font-bold text-blue-700">
                    Audit logs are cryptographically sealed at rest. Any attempt to modify logs will trigger a system-wide security alert to the Super Administrator.
                </p>
            </div>
        </div>
    );
};

export default AuditLogs;
