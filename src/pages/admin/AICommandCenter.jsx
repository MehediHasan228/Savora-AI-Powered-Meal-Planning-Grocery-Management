import React, { useState, useEffect, useRef } from 'react';
import {
    Cpu,
    Save,
    RotateCcw,
    Zap,
    Target,
    ShieldCheck,
    MessageSquareQuote,
    SlidersHorizontal,
    Bot,
    User as UserIcon,
    Send,
    Sparkles,
    Settings2,
    Terminal,
    History,
    ChevronRight,
    Search,
    Filter,
    X,
    CheckCircle2,
    AlertCircle,
    Copy,
    Trash2,
    Maximize2
} from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import {
    Cpu,
    Save,
    RotateCcw,
    Zap,
    Target,
    ShieldCheck,
    MessageSquareQuote,
    SlidersHorizontal,
    Bot,
    User as UserIcon,
    Send,
    Sparkles,
    Settings2,
    Terminal,
    History,
    ChevronRight,
    Search,
    Filter,
    X,
    CheckCircle2,
    AlertCircle,
    Copy,
    Trash2,
    Maximize2
} from 'lucide-react';
import { aiService } from '../../services/api';

const AICommandCenter = () => {
    // State
    const [config, setConfig] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [activeTab, setActiveTab] = useState('engine'); // engine, prompts, security, playground
    const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());

    // Toast System
    const [toasts, setToasts] = useState([]);
    const addToast = (msg, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, msg, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    };

    // Playground State
    const [inputMessage, setInputMessage] = useState('');
    const [chatHistory, setChatHistory] = useState(() => {
        const saved = sessionStorage.getItem('ai_sim_history');
        return saved ? JSON.parse(saved) : [
            { role: 'ai', content: 'AI Command Center Online. Current parameters active. Ready for simulation.' }
        ];
    });
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await aiService.getTuning();
                setConfig(response.data);
            } catch (error) {
                console.error('Failed to fetch AI config:', error);
                addToast('Failed to link with AI Core', 'error');
            }
        };
        fetchConfig();
    }, []);

    useEffect(() => {
        sessionStorage.setItem('ai_sim_history', JSON.stringify(chatHistory));
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, isTyping]);

    const handleUpdate = (field, value) => {
        if (!config) return;
        setConfig(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await aiService.updateTuning(config);
            setHasChanges(false);
            setLastUpdated(new Date().toLocaleTimeString());
            addToast('AI Core recalibrated and synchronized.');
        } catch (error) {
            console.error('Failed to save AI config:', error);
            addToast('Core stabilization failed.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim() || !config) return;

        const userMsg = { role: 'user', content: inputMessage };
        setChatHistory(prev => [...prev, userMsg]);
        setInputMessage('');
        setIsTyping(true);

        try {
            // Use current UI state for simulation testing
            const response = await aiService.chat({
                messages: chatHistory.filter(m => m.role !== 'ai' && m.role !== 'system').concat(userMsg),
                systemPrompt: config.masterPrompt,
                temperature: config.temperature
            });

            setChatHistory(prev => [...prev, { role: 'ai', content: response.data.content }]);
        } catch (error) {
            console.error('AI Error:', error);
            addToast('Simulator link interrupted.', 'error');
            setChatHistory(prev => [...prev, { role: 'ai', content: `CRITICAL ERROR: ${error.response?.data?.message || 'Link failed.'}` }]);
        } finally {
            setIsTyping(false);
        }
    };

    if (!config) return (
        <div className="flex items-center justify-center h-full bg-gray-50/50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-6">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-2xl animate-pulse rounded-full"></div>
                    <Cpu className="w-16 h-16 text-primary animate-spin relative z-10" />
                </div>
                <span className="text-gray-400 font-black uppercase tracking-[0.3em] text-xs animate-pulse">Initializing Neural Core</span>
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col gap-6 pb-6 relative">
            {/* Custom Toast System */}
            <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3">
                {toasts.map(t => (
                    <div key={t.id} className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md animate-in slide-in-from-right duration-300 ${t.type === 'success' ? 'bg-emerald-50/90 border-emerald-100 text-emerald-900' : 'bg-red-50/90 border-red-100 text-red-900'
                        }`}>
                        {t.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        <span className="font-bold text-sm">{t.msg}</span>
                    </div>
                ))}
            </div>

            {/* Premium Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white/80 backdrop-blur-xl p-8 rounded-[40px] border border-white shadow-xl shadow-gray-200/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-primary/10 transition-colors"></div>

                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-16 h-16 bg-gray-900 rounded-[28px] flex items-center justify-center shadow-2xl shadow-gray-900/20 rotate-3 transform transition-transform hover:rotate-0">
                        <Cpu className="w-9 h-9 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic flex items-center gap-3">
                            AI Command <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Center</span>
                        </h1>
                        <div className="flex items-center gap-3 mt-1.5">
                            <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase tracking-widest px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100 shadow-sm">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                                Neural Link Active
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full border border-gray-100">Sync: {lastUpdated}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 relative z-10">
                    {hasChanges && (
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest px-3 py-1 bg-amber-50 rounded-full border border-amber-100 animate-bounce">
                            Unsaved Calibration
                        </span>
                    )}
                    <button
                        onClick={() => window.location.reload()}
                        className="p-4 bg-gray-50 border border-gray-100 rounded-[24px] text-gray-400 hover:text-gray-900 transition-all hover:bg-white hover:shadow-lg active:scale-95"
                    >
                        <RotateCcw className="w-6 h-6" />
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!hasChanges || isSaving}
                        className={`px-10 py-4.5 rounded-[24px] font-black text-sm flex items-center gap-3 transition-all shadow-2xl ${hasChanges
                            ? 'bg-gray-900 text-white hover:scale-[1.05] hover:shadow-primary/40 active:scale-95'
                            : 'bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed'
                            }`}
                    >
                        {isSaving ? <Zap className="w-5 h-5 animate-pulse" /> : <Save className="w-5 h-5" />}
                        {isSaving ? 'RECALIBRATING...' : 'COMMIT CORE'}
                    </button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
                {/* Navigation Sidebar */}
                <div className="lg:col-span-3 flex flex-col gap-4 h-full">
                    {[
                        { id: 'engine', icon: Settings2, label: 'Engine Tuning', desc: 'Weights & Processing' },
                        { id: 'prompts', icon: MessageSquareQuote, label: 'Prompt Ops', desc: 'Instruction Set' },
                        { id: 'playground', icon: Terminal, label: 'Simulator', desc: 'Neural Testing' },
                        { id: 'security', icon: ShieldCheck, label: 'Safety Hub', desc: 'Guardrails' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`p-6 rounded-[36px] text-left transition-all group relative overflow-hidden flex items-center gap-5 border ${activeTab === tab.id
                                ? 'bg-gray-900 text-white shadow-2xl shadow-gray-900/20 border-gray-800'
                                : 'bg-white/60 backdrop-blur-md text-gray-400 hover:bg-white border-white shadow-xl shadow-gray-200/10 hover:border-gray-100 hover:scale-[1.02]'
                                }`}
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${activeTab === tab.id ? 'bg-primary text-white scale-110' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600'
                                }`}>
                                <tab.icon className="w-7 h-7" />
                            </div>
                            <div className="flex-1">
                                <div className={`font-black uppercase tracking-widest text-xs ${activeTab === tab.id ? 'text-white' : 'text-gray-900'}`}>{tab.label}</div>
                                <div className={`text-[10px] font-black opacity-40 mt-1 uppercase tracking-tighter ${activeTab === tab.id ? 'text-primary' : ''}`}>{tab.desc}</div>
                            </div>
                            {activeTab === tab.id && <ChevronRight className="w-5 h-5 text-primary" />}
                        </button>
                    ))}

                    {/* Core Load Widget */}
                    <div className="mt-auto bg-gray-900 p-8 rounded-[40px] text-white overflow-hidden relative border border-white/5 shadow-2xl group">
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[60px] group-hover:bg-primary/20 transition-colors"></div>
                        <div className="relative z-10">
                            <h4 className="text-[10px] font-black uppercase text-primary tracking-[0.4em] mb-6">Core Telemetry</h4>
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between text-[10px] font-black uppercase mb-2 tracking-widest">
                                        <span className="opacity-60">Engine Load</span>
                                        <span className="text-primary">72%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                        <div className="h-full bg-primary w-[72%] shadow-[0_0_15px_rgba(191,175,242,0.5)]"></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-[10px] font-black uppercase mb-2 tracking-widest">
                                        <span className="opacity-60">Latency</span>
                                        <span className="text-blue-400">120ms</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                        <div className="h-full bg-blue-500 w-[48%] shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Bot className="absolute -bottom-6 -right-6 w-28 h-28 text-white/5 rotate-12 transition-transform group-hover:scale-110 group-hover:rotate-0" />
                    </div>
                </div>

                {/* Main Action Content Area */}
                <div className="lg:col-span-9 flex flex-col h-full overflow-hidden gap-8">
                    {activeTab === 'engine' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full overflow-y-auto pr-4 custom-scrollbar pb-4">
                            {/* Logic Weights */}
                            <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[48px] border border-white shadow-2xl shadow-gray-200/20 flex flex-col gap-10 hover:shadow-primary/5 transition-all">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-black text-gray-900 uppercase tracking-[0.2em] text-xs flex items-center gap-3">
                                        <SlidersHorizontal className="w-5 h-5 text-primary" /> Logic Calibration
                                    </h3>
                                    <button onClick={() => addToast('Logic presets unlocked')} className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
                                        <Filter className="w-4 h-4 text-gray-400" />
                                    </button>
                                </div>
                                <div className="space-y-12">
                                    {[
                                        { field: 'matchPercentageThreshold', label: 'Match Precision', min: 50, max: 100, step: 1, unit: '%', color: 'bg-primary' },
                                        { field: 'expiryWeight', label: 'Waste Priority', min: 0, max: 2, step: 0.1, unit: 'x', color: 'bg-amber-500' },
                                        { field: 'userRatingWeight', label: 'Personality Bias', min: 0, max: 1, step: 0.1, unit: 'x', color: 'bg-blue-500' }
                                    ].map(param => (
                                        <div key={param.field} className="group/slider">
                                            <div className="flex justify-between items-center mb-6">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] group-hover/slider:text-gray-900 transition-colors">{param.label}</label>
                                                <span className="text-2xl font-black text-gray-900 tracking-tighter shadow-sm bg-gray-50 px-4 py-1.5 rounded-2xl border border-gray-100">{param.unit}{config[param.field]}</span>
                                            </div>
                                            <div className="relative flex items-center">
                                                <div className="absolute h-2 w-full bg-gray-100 rounded-full"></div>
                                                <div
                                                    className={`absolute h-2 rounded-full ${param.color} transition-all duration-300 shadow-lg`}
                                                    style={{ width: `${((config[param.field] - param.min) / (param.max - param.min)) * 100}%` }}
                                                ></div>
                                                <input
                                                    type="range" min={param.min} max={param.max} step={param.step}
                                                    value={config[param.field]}
                                                    onChange={(e) => handleUpdate(param.field, parseFloat(e.target.value))}
                                                    className="w-full relative z-10 h-2 opacity-0 cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* LLM Directives */}
                            <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[48px] border border-white shadow-2xl shadow-gray-200/20 flex flex-col gap-10">
                                <h3 className="font-black text-gray-900 uppercase tracking-[0.2em] text-xs flex items-center gap-3">
                                    <Sparkles className="w-5 h-5 text-purple-500" /> Model Configuration
                                </h3>
                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Active Intelligence</label>
                                        <div className="flex flex-col gap-3">
                                            {['gpt-4-turbo-preview', 'gpt-4', 'gpt-3.5-turbo'].map(m => (
                                                <button
                                                    key={m}
                                                    onClick={() => {
                                                        handleUpdate('model', m);
                                                        addToast(`Neural path shifted to ${m.toUpperCase()}`);
                                                    }}
                                                    className={`p-5 rounded-[24px] text-left border-2 transition-all font-black text-xs flex items-center justify-between group/model ${config.model === m
                                                        ? 'border-primary bg-primary/5 text-primary shadow-xl shadow-primary/10'
                                                        : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200 hover:bg-white'}`}
                                                >
                                                    <span className="tracking-widest">{m.toUpperCase()}</span>
                                                    {config.model === m ? (
                                                        <CheckCircle2 className="w-5 h-5 animate-in zoom-in" />
                                                    ) : (
                                                        <ChevronRight className="w-4 h-4 opacity-0 group-hover/model:opacity-100 transition-opacity" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-6 pt-4 border-t border-gray-50">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Temperature (Creativity)</label>
                                            <span className="text-sm font-black text-purple-600 px-4 py-1.5 bg-purple-50 rounded-xl border border-purple-100 shadow-sm">{config.temperature}</span>
                                        </div>
                                        <div className="relative flex items-center">
                                            <div className="absolute h-2 w-full bg-gray-100 rounded-full"></div>
                                            <div
                                                className="absolute h-2 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-300 shadow-lg shadow-purple-500/20"
                                                style={{ width: `${(config.temperature / 1) * 100}%` }}
                                            ></div>
                                            <input
                                                type="range" min="0" max="1" step="0.1"
                                                value={config.temperature}
                                                onChange={(e) => handleUpdate('temperature', parseFloat(e.target.value))}
                                                className="w-full relative z-10 h-2 opacity-0 cursor-pointer"
                                            />
                                        </div>
                                        <div className="flex justify-between text-[8px] font-black text-gray-300 uppercase tracking-widest px-1">
                                            <span>Stoic</span>
                                            <span>Creative</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'prompts' && (
                        <div className="flex-1 bg-white/80 backdrop-blur-xl p-10 rounded-[48px] border border-white shadow-2xl shadow-gray-200/20 flex flex-col gap-8 overflow-hidden">
                            <div className="flex items-center justify-between">
                                <h3 className="font-black text-gray-900 uppercase tracking-[0.2em] text-xs flex items-center gap-3">
                                    <MessageSquareQuote className="w-5 h-5 text-blue-500" /> Master Neural Directives
                                </h3>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(config.masterPrompt);
                                            addToast('Directives copied to clipboard');
                                        }}
                                        className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-900 rounded-xl transition-all"
                                    >
                                        <Copy className="w-5 h-5" />
                                    </button>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 shadow-inner">
                                        Tokens: ~{Math.ceil(config.masterPrompt.length / 4)}
                                    </span>
                                </div>
                            </div>
                            <div className="flex-1 relative group">
                                <div className="absolute -inset-1 bg-gradient-to-br from-primary/30 via-blue-500/20 to-purple-500/30 rounded-[32px] opacity-0 group-focus-within:opacity-100 transition-opacity blur shadow-2xl"></div>
                                <textarea
                                    value={config.masterPrompt}
                                    onChange={(e) => handleUpdate('masterPrompt', e.target.value)}
                                    className="w-full h-full relative z-10 bg-gray-50/50 p-10 rounded-[32px] border border-gray-100 text-gray-700 font-mono text-sm leading-relaxed focus:bg-white focus:outline-none focus:ring-8 focus:ring-primary/5 transition-all resize-none shadow-inner"
                                    placeholder="Enter system instructions..."
                                />
                                <div className="absolute bottom-6 right-8 z-20 flex gap-2">
                                    <button onClick={() => addToast('Directive libraries coming soon')} className="p-3 bg-white shadow-xl border border-gray-100 text-gray-400 hover:text-primary rounded-xl transition-all">
                                        <Search className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => addToast('Expansion mode active')} className="p-3 bg-white shadow-xl border border-gray-100 text-gray-400 hover:text-primary rounded-xl transition-all">
                                        <Maximize2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center gap-5 p-6 bg-blue-50/50 backdrop-blur-sm rounded-[28px] border border-blue-100 shadow-sm relative overflow-hidden group/tip">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/50 rounded-full blur-[40px] -mr-16 -mt-16 transition-colors group-hover/tip:bg-blue-200/50"></div>
                                <Sparkles className="w-7 h-7 text-blue-600 shrink-0 animate-pulse" />
                                <div>
                                    <p className="text-xs font-black text-blue-900 italic tracking-tight">"Grounded directives eliminate hallucinations. Be specific with constraints."</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em]">Prompt Engineering V2.1 Active</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'playground' && (
                        <div className="flex-1 grid grid-cols-1 h-full gap-8">
                            <div className="bg-white/80 backdrop-blur-xl rounded-[48px] border border-white shadow-2xl shadow-gray-200/20 flex flex-col overflow-hidden relative">
                                <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-white/50 backdrop-blur-md sticky top-0 z-30">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                                            <Terminal className="w-5 h-5 text-emerald-500" />
                                        </div>
                                        <span className="font-black text-gray-900 uppercase tracking-[0.2em] text-xs">Neural Playground Simulator</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => {
                                                setChatHistory([]);
                                                sessionStorage.removeItem('ai_sim_history');
                                                addToast('Stream purged');
                                            }}
                                            className="p-3 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-xl transition-all group/purge"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                        <div className="h-6 w-px bg-gray-100 mx-2"></div>
                                        <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest bg-emerald-50 px-4 py-2 rounded-xl">Real-time Echo</span>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar bg-gray-50/20">
                                    {chatHistory.map((msg, idx) => (
                                        <div key={idx} className={`flex gap-5 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                                            <div className={`w-12 h-12 rounded-[20px] flex items-center justify-center shrink-0 shadow-2xl transition-transform hover:scale-110 ${msg.role === 'ai' ? 'bg-gray-900 text-primary' : 'bg-primary text-white shadow-primary/30'}`}>
                                                {msg.role === 'ai' ? <Bot className="w-6 h-6" /> : <UserIcon className="w-6 h-6" />}
                                            </div>
                                            <div className={`max-w-[75%] p-7 rounded-[32px] shadow-xl text-sm font-bold leading-relaxed border relative group/msg ${msg.role === 'ai'
                                                ? 'bg-white border-gray-50 text-gray-700 rounded-tl-none shadow-gray-200/10'
                                                : 'bg-gray-900 border-gray-800 text-white rounded-tr-none shadow-gray-900/30'
                                                }`}>
                                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                                <span className={`absolute -bottom-6 text-[8px] font-black uppercase opacity-0 group-hover/msg:opacity-40 transition-opacity tracking-widest ${msg.role === 'user' ? 'right-2' : 'left-2'}`}>
                                                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {isTyping && (
                                        <div className="flex gap-5 animate-in slide-in-from-bottom-2">
                                            <div className="w-12 h-12 rounded-[20px] bg-gray-900 text-primary flex items-center justify-center shrink-0 shadow-2xl animate-pulse">
                                                <Bot className="w-6 h-6" />
                                            </div>
                                            <div className="bg-white border border-gray-50 p-6 rounded-[32px] rounded-tl-none shadow-xl flex gap-1.5 items-center">
                                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100"></div>
                                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200"></div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                <form onSubmit={handleSendMessage} className="p-8 bg-white border-t border-gray-50 sticky bottom-0 z-30">
                                    <div className="relative group">
                                        <div className="absolute -inset-2 bg-gradient-to-r from-primary/40 via-blue-500/20 to-primary/40 rounded-[36px] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                                        <input
                                            type="text"
                                            value={inputMessage}
                                            onChange={(e) => setInputMessage(e.target.value)}
                                            placeholder="Simulate user query..."
                                            className="w-full relative z-10 p-8 pr-24 bg-gray-50 border border-gray-100 rounded-[32px] focus:bg-white focus:outline-none focus:ring-8 focus:ring-primary/5 font-black text-gray-900 transition-all placeholder:text-gray-300 placeholder:italic"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!inputMessage.trim() || isTyping}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 bg-gray-900 text-white rounded-[24px] flex items-center justify-center hover:bg-black transition-all hover:scale-105 active:scale-95 z-20 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed group-hover:shadow-primary/20"
                                        >
                                            <Send className="w-6 h-6" />
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="bg-white/80 backdrop-blur-xl p-12 rounded-[64px] border border-white shadow-2xl shadow-gray-200/20 flex flex-col gap-12 h-full overflow-y-auto custom-scrollbar">
                            <h3 className="font-black text-gray-900 uppercase tracking-[0.3em] text-xs flex items-center gap-4">
                                <ShieldCheck className="w-6 h-6 text-emerald-500" /> Security Systems & Neural Guardrails
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="p-10 bg-emerald-50/50 backdrop-blur-sm rounded-[40px] border border-emerald-100 flex flex-col gap-6 relative overflow-hidden group/card shadow-sm hover:shadow-xl transition-all">
                                    <div className="absolute top-0 right-0 p-8 text-emerald-500 opacity-10 group-hover/card:scale-125 transition-transform">
                                        <ShieldCheck className="w-32 h-32" />
                                    </div>
                                    <div className="flex items-center justify-between relative z-10">
                                        <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Injection Protection</h4>
                                        <div className="w-14 h-7 bg-emerald-500 rounded-full flex items-center justify-end px-1.5 shadow-2xl">
                                            <div className="w-5 h-5 bg-white rounded-full shadow-sm"></div>
                                        </div>
                                    </div>
                                    <div className="relative z-10">
                                        <div className="font-black text-gray-900 text-xl tracking-tight uppercase italic mb-2 leading-none">Guard V4.2 <span className="text-emerald-500 text-xs not-italic font-bold">LOCKED</span></div>
                                        <p className="text-xs font-black text-emerald-900/40 leading-relaxed max-w-[80%] uppercase tracking-tighter">Real-time prompt sanitization & PII obfuscation filter active across all nodes.</p>
                                    </div>
                                </div>

                                <div className="p-10 bg-blue-50/50 backdrop-blur-sm rounded-[40px] border border-blue-100 flex flex-col gap-6 relative overflow-hidden group/card shadow-sm hover:shadow-xl transition-all">
                                    <div className="absolute top-0 right-0 p-8 text-blue-500 opacity-10 group-hover/card:scale-125 transition-transform">
                                        <Target className="w-32 h-32" />
                                    </div>
                                    <div className="flex items-center justify-between relative z-10">
                                        <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Neural Quotas</h4>
                                        <div className="w-14 h-7 bg-blue-500 rounded-full flex items-center justify-end px-1.5 shadow-2xl">
                                            <div className="w-5 h-5 bg-white rounded-full shadow-sm"></div>
                                        </div>
                                    </div>
                                    <div className="relative z-10">
                                        <div className="font-black text-gray-900 text-xl tracking-tight uppercase italic mb-2 leading-none">Token Limiter <span className="text-blue-500 text-xs not-italic font-bold">1.5M/D</span></div>
                                        <p className="text-xs font-black text-blue-900/40 leading-relaxed max-w-[80%] uppercase tracking-tighter">Budget-aware rate limiting prevent cost runaway & API exhaustion.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto p-12 bg-gray-900 rounded-[48px] text-center relative overflow-hidden shadow-2xl shadow-gray-900/40 group">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-blue-500/10 group-hover:opacity-100 opacity-0 transition-opacity duration-1000"></div>
                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center mb-8 shadow-2xl rotate-3 transform group-hover:rotate-0 transition-transform">
                                        <History className="w-10 h-10 text-primary" />
                                    </div>
                                    <h4 className="text-3xl font-black text-white uppercase tracking-tighter italic mb-4">Neural Config History</h4>
                                    <p className="text-sm text-gray-400 font-black mb-10 max-w-lg mx-auto uppercase tracking-wider leading-relaxed opacity-60 italic">
                                        "Instant restoration of previous stable cores via the executive audit trail."
                                    </p>
                                    <button onClick={() => addToast('Opening Audit Vault')} className="px-12 py-5 bg-white text-gray-900 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-primary hover:text-white hover:scale-110 transition-all active:scale-95 group/btn">
                                        <span className="flex items-center gap-3">
                                            View Audit Vault
                                            <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                        </span>
                                    </button>
                                </div>
                                <Zap className="absolute -bottom-16 -left-16 w-56 h-56 text-white/5 rotate-45 pointer-events-none group-hover:scale-110 transition-transform" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AICommandCenter;
