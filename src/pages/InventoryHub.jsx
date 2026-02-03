import React, { useState, useMemo, useEffect } from 'react';
import {
    Search, Plus, Trash2, AlertCircle, Calendar, X, Edit2,
    Minus, Check, AlertTriangle, ArrowUpDown, Sparkles,
    Undo2, LayoutDashboard, List, TrendingUp, Package,
    Zap, ShoppingCart, Loader2
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { useUI } from '../context/UIContext';
import { useUser } from '../context/UserContext';
import EditInventoryModal from '../components/EditInventoryModal';
import ExpiryBadge from '../components/ExpiryBadge';
import AIAnalysisModal from '../components/AIAnalysisModal';
import { aiService, inventoryService, adminInventoryService } from '../services/api';

const InventoryHub = () => {
    const { inventory, addItem, removeItem, updateItem, getStatus, setInventory } = useInventory();
    const { searchQuery, setSearchQuery, debouncedSearchQuery, showToast } = useUI();
    const { user } = useUser();

    // View State: 'manage' or 'insights'
    const [view, setView] = useState('manage');
    const [activeTab, setActiveTab] = useState('Pantry');
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

    // UI States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, name: '' });
    const [isLookingUp, setIsLookingUp] = useState(false);

    // Form State
    const [newItem, setNewItem] = useState({
        name: '',
        category: '',
        qty: '',
        expiry: '',
        barcode: '',
        storageZone: activeTab
    });

    // Analytics State
    const [insights, setInsights] = useState(null);
    const [loadingInsights, setLoadingInsights] = useState(false);

    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        if (view === 'insights') {
            fetchInsights();
        }
    }, [view]);

    const fetchInsights = async () => {
        setLoadingInsights(true);
        try {
            const response = await adminInventoryService.getSummary();
            setInsights(response.data);
        } catch (error) {
            console.error('Failed to fetch insights:', error);
            showToast('Failed to load insights', 'error');
        } finally {
            setLoadingInsights(false);
        }
    };

    const handleBarcodeLookup = async () => {
        if (!newItem.barcode) return;
        setIsLookingUp(true);
        try {
            const { data } = await inventoryService.barcodeLookup(newItem.barcode);
            if (data.found) {
                setNewItem(prev => ({
                    ...prev,
                    name: data.name || prev.name,
                    category: data.category || prev.category,
                    expiry: data.defaultExpiry ? new Date(Date.now() + data.defaultExpiry * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : prev.expiry
                }));
                showToast('Product found!');
            } else {
                showToast('Product not in database', 'info');
            }
        } catch (error) {
            console.error('Barcode lookup failed:', error);
        } finally {
            setIsLookingUp(false);
        }
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!newItem.name || !newItem.qty) return;

        try {
            await addItem({
                ...newItem,
                category: newItem.category || 'General',
                storageZone: activeTab
            });

            setNewItem({ name: '', category: '', qty: '', expiry: '', barcode: '', storageZone: activeTab });
            setIsModalOpen(false);
            showToast('Item added to ' + activeTab);
        } catch (error) {
            console.error('Failed to add item:', error);
            showToast('Failed to add item', 'error');
        }
    };

    const handleAddRestockToGrocery = async (item) => {
        try {
            await groceryService.create({
                name: item.name,
                category: item.category,
                price: 0,
                qty: 1,
                unit: 'pcs',
                buyStatus: 'NOW',
                source: 'RESTOCK'
            });
            showToast(`Added ${item.name} to Grocery List!`);
            // Optional: refresh insights if needed, but lowStockSuggestions is memoized from inventory
        } catch (error) {
            console.error('Failed to add restock item:', error);
            showToast('Failed to add to grocery', 'error');
        }
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Filtered Items for Management View
    const filteredItems = useMemo(() => {
        let items = inventory.filter(item => {
            const itemZone = item.storageZone || item.location;
            const matchesTab = itemZone === activeTab;
            const matchesSearch = item.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                item.category.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
            return matchesTab && matchesSearch;
        });

        return items.sort((a, b) => {
            let aVal = a[sortConfig.key];
            let bVal = b[sortConfig.key];
            if (sortConfig.key === 'expiry') {
                aVal = aVal ? new Date(aVal).getTime() : Infinity;
                bVal = bVal ? new Date(bVal).getTime() : Infinity;
            }
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [inventory, activeTab, debouncedSearchQuery, sortConfig]);

    // Smart Alerts Calculation
    const wasteRisks = useMemo(() => {
        return inventory.filter(i => {
            if (!i.expiry) return false;
            const daysLeft = (new Date(i.expiry) - new Date()) / (1000 * 60 * 60 * 24);
            return daysLeft >= 0 && daysLeft <= 3;
        });
    }, [inventory]);

    const lowStockSuggestions = useMemo(() => {
        return inventory.filter(i => i.usageCount > 5 && (i.qty.toLowerCase().includes('low') || i.qty === '1'));
    }, [inventory]);

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Top Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-100">
                    <button
                        onClick={() => setView('manage')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all font-bold text-sm ${view === 'manage' ? 'bg-white shadow-md text-primary' : 'text-gray-500 hover:text-primary'}`}
                    >
                        <List className="w-4 h-4" />
                        Manage
                    </button>
                    <button
                        onClick={() => setView('insights')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all font-bold text-sm ${view === 'insights' ? 'bg-white shadow-md text-primary' : 'text-gray-500 hover:text-primary'}`}
                    >
                        <TrendingUp className="w-4 h-4" />
                        Smart Hub
                    </button>
                    {isAdmin && (
                        <div className="h-6 w-[1px] bg-gray-200 mx-1" />
                    )}
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search ingredients..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm"
                        />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary text-white px-5 py-2.5 rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-primary/20 font-bold text-sm flex items-center gap-2 whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" /> Add Item
                    </button>
                </div>
            </div>

            {view === 'manage' ? (
                <div className="space-y-6">
                    {/* Zones Tabs */}
                    <div className="flex gap-2 p-1 bg-gray-100/50 w-fit rounded-xl border border-gray-100">
                        {['Pantry', 'Fridge', 'Freezer'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === tab ? 'bg-white text-primary shadow-sm border border-gray-100' : 'text-gray-500 hover:text-primary'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Inventory List */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('name')}>
                                            <div className="flex items-center gap-1">Item <ArrowUpDown className="w-3 h-3" /></div>
                                        </th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('category')}>
                                            <div className="flex items-center gap-1">Category <ArrowUpDown className="w-3 h-3" /></div>
                                        </th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Qty</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('expiry')}>
                                            <div className="flex items-center gap-1">Expiry <ArrowUpDown className="w-3 h-3" /></div>
                                        </th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredItems.length > 0 ? filteredItems.map(item => (
                                        <tr key={item.id} className="group hover:bg-emerald-50/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-800 group-hover:text-primary transition-colors">{item.name}</div>
                                                {item.barcode && <div className="text-[10px] text-gray-400 font-mono mt-0.5">{item.barcode}</div>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-[10px] font-bold uppercase tracking-wider border border-blue-100">{item.category}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-gray-600">{item.qty}</td>
                                            <td className="px-6 py-4">
                                                <ExpiryBadge expiryDate={item.expiry} />
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <button
                                                    onClick={() => { setEditingItem(item); setIsEditModalOpen(true); }}
                                                    className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm({ show: true, id: item.id, name: item.name })}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-20 text-center text-gray-400">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 mb-2">
                                                        <Package className="w-8 h-8 opacity-20" />
                                                    </div>
                                                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Zone Empty</p>
                                                    <p className="text-xs text-gray-400">Ready to track some {activeTab} essentials?</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-8 animate-fade-in-up">
                    {/* Hero Section of Hub */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-red-50 p-8 rounded-[2rem] border-2 border-red-100 flex flex-col h-full hover:shadow-xl hover:shadow-red-200/20 transition-all duration-300">
                            <div className="flex items-center gap-3 text-red-700 font-black mb-6 uppercase tracking-widest text-sm">
                                <div className="p-2 bg-red-100 rounded-xl"><AlertTriangle className="w-5 h-5" /></div>
                                Probable Waste Risk
                            </div>
                            <div className="space-y-4 flex-1">
                                {wasteRisks.length > 0 ? wasteRisks.map(i => (
                                    <div key={i.id} className="flex justify-between items-center bg-white p-5 rounded-[1.5rem] shadow-sm border border-red-50 hover:scale-[1.02] transition-transform">
                                        <div>
                                            <div className="font-bold text-gray-800">{i.name}</div>
                                            <div className="text-xs text-red-500 font-black uppercase mt-1">Expiring Soon</div>
                                        </div>
                                        <button className="text-xs bg-red-600 text-white px-5 py-2.5 rounded-xl font-black uppercase tracking-widest hover:bg-red-700 transition-colors shadow-lg shadow-red-200">
                                            Priority
                                        </button>
                                    </div>
                                )) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center py-10">
                                        <div className="p-4 bg-emerald-100 rounded-full mb-4 animate-bounce">
                                            <Check className="w-6 h-6 text-emerald-600" />
                                        </div>
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">All Clear</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-emerald-50 p-8 rounded-[2rem] border-2 border-emerald-100 flex flex-col h-full hover:shadow-xl hover:shadow-emerald-200/20 transition-all duration-300">
                            <div className="flex items-center gap-3 text-emerald-700 font-black mb-6 uppercase tracking-widest text-sm">
                                <div className="p-2 bg-emerald-100 rounded-xl"><Zap className="w-5 h-5" /></div>
                                Smart Resock Needs
                            </div>
                            <div className="space-y-4 flex-1">
                                {lowStockSuggestions.length > 0 ? lowStockSuggestions.map(i => (
                                    <div key={i.id} className="flex justify-between items-center bg-white p-5 rounded-[1.5rem] shadow-sm border border-emerald-50 hover:scale-[1.02] transition-transform">
                                        <div>
                                            <div className="font-bold text-gray-800">{i.name}</div>
                                            <div className="text-xs text-emerald-600 font-black uppercase mt-1">Stock Critical</div>
                                        </div>
                                        <button
                                            onClick={() => handleAddRestockToGrocery(i)}
                                            className="flex items-center gap-2 text-xs bg-primary text-white px-5 py-2.5 rounded-xl font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors shadow-lg shadow-primary/20"
                                        >
                                            <Plus className="w-3 h-3" /> Add
                                        </button>
                                    </div>
                                )) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center py-10">
                                        <div className="p-4 bg-gray-100 rounded-full mb-4">
                                            <Package className="w-6 h-6 text-gray-400 opacity-50" />
                                        </div>
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Fully Stocked</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Personal & Admin Stats */}
                    {loadingInsights ? (
                        <div className="h-40 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        </div>
                    ) : insights && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard icon={<Package />} label="Total Stock" value={insights.totalItems} color="blue" />
                            <StatCard icon={<AlertCircle />} label="Watch List" value={wasteRisks.length} color="amber" />
                            <StatCard icon={<AlertTriangle />} label="Expired" value={insights.statusDist?.find(s => s.status === 'Expired')?._count.status || 0} color="red" />
                            <StatCard icon={<TrendingUp />} label="Waste Rate" value={`${Math.round((insights.statusDist?.find(s => s.status === 'Expired')?._count.status || 0) / (insights.totalItems || 1) * 100)}%`} color="emerald" />
                        </div>
                    )}
                </div>
            )}

            {/* Modals */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-scale-in border border-gray-100">
                        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="text-2xl font-black text-gray-800 tracking-tight">Add Ingredient</h2>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">to {activeTab}</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2.5 hover:bg-primary/10 hover:text-primary rounded-xl transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleAddItem} className="p-8 space-y-5">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Automated Lookup</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Barcode ID..."
                                            value={newItem.barcode}
                                            onChange={(e) => setNewItem({ ...newItem, barcode: e.target.value })}
                                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none text-sm transition-all font-mono"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleBarcodeLookup}
                                        disabled={!newItem.barcode || isLookingUp}
                                        className="bg-gray-900 text-white px-5 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black disabled:opacity-50 transition-all shadow-lg"
                                    >
                                        {isLookingUp ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Find'}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 space-y-1">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Item Details</label>
                                    <input
                                        required
                                        type="text"
                                        value={newItem.name}
                                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                        className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold"
                                        placeholder="Name (e.g. Avocado)"
                                    />
                                </div>
                                <input
                                    type="text"
                                    value={newItem.category}
                                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                                    className="px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm font-medium"
                                    placeholder="Category"
                                />
                                <input
                                    required
                                    type="text"
                                    value={newItem.qty}
                                    onChange={(e) => setNewItem({ ...newItem, qty: e.target.value })}
                                    className="px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm font-medium"
                                    placeholder="Qty (e.g. 3 pcs)"
                                />
                                <div className="col-span-2 space-y-1">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Expiration</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="date"
                                            value={newItem.expiry}
                                            onChange={(e) => setNewItem({ ...newItem, expiry: e.target.value })}
                                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold"
                                        />
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-xl shadow-primary/30 mt-4 active:scale-95">
                                Save to Inventory
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {deleteConfirm.show && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[2rem] p-10 max-w-sm w-full text-center shadow-2xl animate-scale-in border border-gray-100">
                        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border-4 border-white">
                            <Trash2 className="w-10 h-10 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-800 mb-2 tracking-tight">Remove Item?</h2>
                        <p className="text-gray-400 font-medium text-sm mb-10 leading-relaxed">
                            Removing <span className="text-gray-800 font-bold">"{deleteConfirm.name}"</span> cannot be undone.
                        </p>
                        <div className="flex gap-4">
                            <button onClick={() => setDeleteConfirm({ show: false, id: null, name: '' })} className="flex-1 py-4 bg-gray-100 text-gray-600 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-gray-200 transition-all">
                                Cancel
                            </button>
                            <button onClick={handleDelete} className="flex-1 py-4 bg-red-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-200">
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isEditModalOpen && (
                <EditInventoryModal
                    isOpen={isEditModalOpen}
                    onClose={() => { setIsEditModalOpen(false); setEditingItem(null); }}
                    item={editingItem}
                    onUpdate={async (id, updates) => {
                        await updateItem(id, updates);
                        setIsEditModalOpen(false);
                        setEditingItem(null);
                        showToast('Item updated');
                    }}
                />
            )}
        </div>
    );
};

const StatCard = ({ icon, label, value, color }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        red: 'bg-red-50 text-red-600 border-red-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100'
    };

    return (
        <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 flex items-center gap-4 group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className={`p-4 rounded-2xl ${colors[color]} border transition-transform group-hover:scale-110 shadow-sm`}>
                {React.cloneElement(icon, { className: 'w-6 h-6' })}
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-0.5">{label}</p>
                <p className="text-3xl font-black text-gray-800 tracking-tighter">{value}</p>
            </div>
        </div>
    );
};

export default InventoryHub;
