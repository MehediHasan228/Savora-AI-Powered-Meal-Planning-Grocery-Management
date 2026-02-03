import React, { useState, useEffect } from 'react';
import { Plus, Check, ShoppingBag, MoreVertical, X, Trash2, PieChart, Archive, Pencil, Star, StarOff, Zap, Loader2, ArrowRight, AlertTriangle, RefreshCw } from 'lucide-react';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip } from 'recharts';
import { groceryService } from '../services/api';
import { useInventory } from '../context/InventoryContext';

const AISLE_ORDER = [
    'Produce',
    'Bakery',
    'Dairy & Alternatives',
    'Meat & Poultry',
    'Seafood',
    'Pasta & Grains',
    'Canned & Jarred',
    'Condiments',
    'Spices & Seasonings',
    'Baking',
    'Snacks',
    'Frozen',
    'Beverages',
    'Coffee & Tea',
    'Cleaning',
    'Personal Care',
    'Home & Kitchen',
    'General',
    'Other'
];

const Grocery = () => {
    const { inventory, refreshInventory } = useInventory();
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
    const [newItem, setNewItem] = useState({ name: '', category: 'Produce', price: '', qty: 1, unit: 'pcs', buyStatus: 'NOW' });
    const [editingId, setEditingId] = useState(null);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [inventoryAlert, setInventoryAlert] = useState(null);

    // Fetch items on mount
    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setIsLoading(true);
        try {
            const response = await groceryService.getAll();
            setItems(response.data);
        } catch (error) {
            console.error('Failed to fetch grocery items:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMoveToInventory = async () => {
        if (!window.confirm("Move all bought items to your Inventory?")) return;

        try {
            const response = await groceryService.moveToInventory();
            console.log('Move response:', response.data);

            if (response.data.count > 0) {
                alert(`Successfully moved ${response.data.count} items to Inventory!`);
                // Refresh grocery list
                fetchItems();
                // Refresh inventory list so items show up immediately
                refreshInventory();
            } else {
                alert("No bought items found to move. \n(Make sure items are checked off!)");
            }
        } catch (error) {
            console.error('Failed to move items:', error);
            const msg = error.response?.data?.message || error.message || 'Unknown error';
            alert(`Failed to move items: ${msg}`);
        }
    };

    const toggleItem = async (id) => {
        try {
            await groceryService.toggle(id);
            setItems(prev => prev.map(item =>
                item.id === id ? { ...item, isBought: !item.isBought } : item
            ));
        } catch (error) {
            console.error('Failed to toggle item:', error);
        }
    };

    const toggleBuyStatus = async (id) => {
        try {
            await groceryService.togglePriority(id); // Reused endpoint for buyStatus toggle
            setItems(prev => prev.map(item =>
                item.id === id ? { ...item, buyStatus: item.buyStatus === 'NOW' ? 'LATER' : 'NOW' } : item
            ));
        } catch (error) {
            console.error('Failed to toggle buy status:', error);
        }
    };

    const refreshIntelligence = async () => {
        setIsRefreshing(true);
        try {
            const res = await groceryService.refresh();
            setItems(res.data);
        } catch (error) {
            console.error('Failed to refresh intelligence:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const clearCompleted = async () => {
        if (window.confirm("Clear all bought items?")) {
            try {
                await groceryService.clearCompleted();
                setItems(items.filter(i => !i.isBought));
            } catch (error) {
                console.error('Failed to clear completed items:', error);
            }
        }
    };

    const handleSaveItem = async (e) => {
        e.preventDefault();
        if (!newItem.name) return;

        try {
            if (editingId) {
                await groceryService.update(editingId, {
                    ...newItem,
                    price: parseFloat(newItem.price) || 0,
                    qty: parseFloat(newItem.qty) || 1
                });
                await fetchItems();
            } else {
                const response = await groceryService.create({
                    ...newItem,
                    price: parseFloat(newItem.price) || 0,
                    qty: parseFloat(newItem.qty) || 1
                });
                setItems([...items, response.data]);
            }

            setNewItem({ name: '', category: 'Produce', price: '', qty: 1, unit: 'pcs', buyStatus: 'NOW' });
            setEditingId(null);
            setIsAddModalOpen(false);
            setInventoryAlert(null);
        } catch (error) {
            console.error('Failed to save item:', error);
        }
    };

    const openAddModal = () => {
        setNewItem({ name: '', category: 'Produce', price: '', qty: 1, unit: 'pcs', buyStatus: 'NOW' });
        setEditingId(null);
        setIsAddModalOpen(true);
        setInventoryAlert(null);
    };

    const openEditModal = (item) => {
        setNewItem({
            name: item.name,
            category: item.category || 'General',
            price: (item.price || 0).toString(),
            qty: item.qty || 1,
            unit: item.unit || 'pcs',
            buyStatus: item.buyStatus || 'NOW'
        });
        setEditingId(item.id);
        setIsAddModalOpen(true);
        setInventoryAlert(null);
    };

    const deleteItem = async (id) => {
        try {
            await groceryService.delete(id);
            setItems(items.filter(i => i.id !== id));
        } catch (error) {
            console.error('Failed to delete item:', error);
        }
    };

    const buyNowItems = items.filter(i => i.buyStatus === 'NOW');
    const buyLaterItems = items.filter(i => i.buyStatus === 'LATER');

    const categories = (itemsList) => AISLE_ORDER.filter(cat => itemsList.some(i => i.category === cat))
        .concat([...new Set(itemsList.map(i => i.category))].filter(cat => !AISLE_ORDER.includes(cat)));

    const remainingItems = items.filter(i => !i.isBought);
    const estimatedCost = remainingItems.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);

    // Analytics Data Preparation
    const costByCategory = items.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + item.price;
        return acc;
    }, {});
    const pieData = Object.keys(costByCategory).map(key => ({ name: key, value: costByCategory[key] }));
    const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

    return (
        <div className="space-y-6 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-800">Grocery List</h1>
                        <button
                            onClick={refreshIntelligence}
                            disabled={isRefreshing}
                            className={`p-2 rounded-lg bg-gray-100 text-gray-500 hover:text-primary transition-all ${isRefreshing ? 'animate-spin cursor-not-allowed' : ''}`}
                            title="Refresh Intelligence"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-gray-500 mt-1">Smart shopping list synced with your Inventory and Recipes</p>
                </div>
                <div className="flex gap-3">
                    {items.some(i => i.isBought) && (
                        <>
                            <button onClick={clearCompleted} className="text-red-500 bg-white border border-red-100 px-4 py-2.5 rounded-lg font-medium hover:bg-red-50 transition-colors">
                                Clear
                            </button>
                        </>
                    )}
                    <button onClick={openAddModal} className="bg-primary text-white px-5 py-2.5 rounded-lg font-medium shadow-sm hover:bg-emerald-600 transition-colors flex items-center justify-center">
                        <Plus className="w-5 h-5 mr-2" />
                        Add Item
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main List Area */}
                <div className="lg:col-span-2 space-y-6">
                    {isLoading ? (
                        <div className="bg-white rounded-xl p-20 flex flex-col items-center justify-center border border-gray-100 shadow-sm">
                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <p className="mt-4 text-gray-500 font-medium">Loading your items...</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex gap-4">
                                {/* Buy Now Section */}
                                <div className="flex-1 space-y-6">
                                    <h2 className="text-sm font-black text-red-500 uppercase tracking-[0.2em] flex items-center gap-2 px-2">
                                        <Zap className="w-4 h-4 fill-current" /> Buy Now
                                    </h2>
                                    {categories(buyNowItems).map(category => (
                                        <CategoryBlock
                                            key={category}
                                            category={category}
                                            items={buyNowItems}
                                            toggleItem={toggleItem}
                                            toggleBuyStatus={toggleBuyStatus}
                                            openEditModal={openEditModal}
                                            deleteItem={deleteItem}
                                        />
                                    ))}
                                    {buyNowItems.length === 0 && <div className="text-center p-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-100 text-gray-400 text-sm">Everything is Buy Later or Stocked Up!</div>}
                                </div>

                                {/* Buy Later Section */}
                                <div className="flex-1 space-y-6">
                                    <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 px-2">
                                        <ShoppingBag className="w-4 h-4" /> Buy Later
                                    </h2>
                                    {categories(buyLaterItems).map(category => (
                                        <CategoryBlock
                                            key={category}
                                            category={category}
                                            items={buyLaterItems}
                                            toggleItem={toggleItem}
                                            toggleBuyStatus={toggleBuyStatus}
                                            openEditModal={openEditModal}
                                            deleteItem={deleteItem}
                                        />
                                    ))}
                                    {buyLaterItems.length === 0 && <div className="text-center p-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-100 text-gray-400 text-sm">No items in the long-term list.</div>}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Summary / Quick Actions */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-md">
                        <ShoppingBag className="w-10 h-10 mb-4 opacity-80" />
                        <h3 className="text-xl font-bold">Shopping Setup</h3>
                        <p className="text-white/80 mt-2 text-sm leading-relaxed">
                            You have <span className="font-bold text-white">{remainingItems.length} items</span> remaining.
                            <br />Estimated cost: <span className="font-bold text-xl block mt-2">${estimatedCost.toFixed(2)}</span>
                        </p>

                        <div className="mt-6 flex flex-col gap-3">
                            {items.some(i => i.isBought) && (
                                <button
                                    onClick={handleMoveToInventory}
                                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg font-bold shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center group"
                                >
                                    <Archive className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                    Shop & Save Now
                                </button>
                            )}

                            <button onClick={() => setIsAnalyticsOpen(true)} className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center">
                                <PieChart className="w-4 h-4 mr-2" />
                                View Budget Analytics
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add/Edit Item Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">{editingId ? 'Edit Grocery Item' : 'Add Grocery Item'}</h3>
                            <button onClick={() => setIsAddModalOpen(false)}><X className="text-gray-400 hover:text-gray-600" /></button>
                        </div>
                        <form onSubmit={handleSaveItem} className="space-y-4">
                            <div className="relative">
                                {isSuggesting && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />}
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Item name (e.g. Bananas)"
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold"
                                    value={newItem.name}
                                    onChange={async (e) => {
                                        const name = e.target.value;
                                        setNewItem({ ...newItem, name });

                                        // 1. Inventory Alert
                                        const inStock = inventory.find(i => i.name.toLowerCase() === name.toLowerCase());
                                        if (inStock) {
                                            setInventoryAlert(`You already have ${inStock.qty} in ${inStock.storageZone || inStock.location}. Still add this?`);
                                        } else {
                                            setInventoryAlert(null);
                                        }

                                        // 2. Suggest Category
                                        if (name.length > 2) {
                                            setIsSuggesting(true);
                                            try {
                                                const res = await groceryService.suggestCategory(name);
                                                if (res.data.category) {
                                                    setNewItem(prev => ({ ...prev, category: res.data.category }));
                                                }
                                            } catch (err) { }
                                            setIsSuggesting(false);
                                        }
                                    }}
                                />
                                {inventoryAlert && (
                                    <div className="mt-2 flex items-start gap-2 p-2 bg-amber-50 border border-amber-100 rounded-lg text-[10px] text-amber-700 font-bold animate-head-shake">
                                        <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                                        <span>{inventoryAlert}</span>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Quantity</label>
                                    <div className="flex">
                                        <button
                                            type="button"
                                            onClick={() => setNewItem(n => ({ ...n, qty: Math.max(0.5, n.qty - 0.5) }))}
                                            className="px-3 bg-gray-100 rounded-l-xl hover:bg-gray-200"
                                        >-</button>
                                        <input
                                            type="number"
                                            step="0.5"
                                            className="w-full px-2 py-2 border-y-2 border-gray-50 focus:outline-none text-center font-bold text-sm"
                                            value={newItem.qty}
                                            onChange={e => setNewItem({ ...newItem, qty: parseFloat(e.target.value) || 0 })}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setNewItem(n => ({ ...n, qty: n.qty + 0.5 }))}
                                            className="px-3 bg-gray-100 rounded-r-xl hover:bg-gray-200"
                                        >+</button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Unit</label>
                                    <select
                                        className="w-full px-3 py-2 border-2 border-gray-100 rounded-xl bg-white outline-none text-sm font-bold"
                                        value={newItem.unit}
                                        onChange={e => setNewItem({ ...newItem, unit: e.target.value })}
                                    >
                                        <option value="pcs">pcs</option>
                                        <option value="kg">kg</option>
                                        <option value="g">g</option>
                                        <option value="L">L</option>
                                        <option value="ml">ml</option>
                                        <option value="pack">pack</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Category</label>
                                    <select
                                        className="w-full px-4 py-2 border-2 border-gray-100 rounded-xl bg-white focus:border-primary outline-none transition-all text-sm font-medium"
                                        value={newItem.category}
                                        onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                                    >
                                        {AISLE_ORDER.map(cat => <option key={cat}>{cat}</option>)}
                                    </select>
                                </div>
                                <div className="w-24">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Price/Unit</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        className="w-full px-4 py-2 border-2 border-gray-100 rounded-xl focus:border-primary outline-none text-sm font-medium"
                                        value={newItem.price}
                                        onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Shopping Logic</label>
                                <div className="flex gap-2 p-1 bg-gray-50 rounded-xl border-2 border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => setNewItem({ ...newItem, buyStatus: 'NOW' })}
                                        className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${newItem.buyStatus === 'NOW' ? 'bg-red-500 text-white' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        Buy Now
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewItem({ ...newItem, buyStatus: 'LATER' })}
                                        className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${newItem.buyStatus === 'LATER' ? 'bg-gray-500 text-white' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        Buy Later
                                    </button>
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-primary text-white py-4 rounded-[1.5rem] font-black uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-xl shadow-primary/20">
                                {editingId ? 'Save Changes' : 'Add to List'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Budget Analytics Modal */}
            {isAnalyticsOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg">Spending Breakdown</h3>
                            <button onClick={() => setIsAnalyticsOpen(false)}><X className="text-gray-400 hover:text-gray-600" /></button>
                        </div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RePieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <ReTooltip formatter={(value) => `$${value.toFixed(2)}`} />
                                </RePieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                            {pieData.map((entry, index) => (
                                <div key={entry.name} className="flex items-center">
                                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    <span className="text-gray-600 flex-1">{entry.name}</span>
                                    <span className="font-medium">${entry.value.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const CategoryBlock = ({ category, items, toggleItem, toggleBuyStatus, openEditModal, deleteItem }) => {
    const categoryItems = items.filter(i => i.category === category);
    if (categoryItems.length === 0) return null;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-700">{category}</h3>
                <span className="text-xs font-medium bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                    {categoryItems.filter(i => !i.isBought).length} items
                </span>
            </div>
            <div className="divide-y divide-gray-100">
                {categoryItems.map(item => (
                    <div
                        key={item.id}
                        className={`px-4 py-4 flex items-center justify-between group transition-colors ${item.isBought ? 'bg-gray-50/50' : 'hover:bg-gray-50'}`}
                    >
                        <div className="flex items-center cursor-pointer flex-1" onClick={() => toggleItem(item.id)}>
                            <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center transition-colors ${item.isBought ? 'bg-primary border-primary' : 'border-gray-200'}`}>
                                {item.isBought && <Check className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className={`block truncate text-sm ${item.isBought ? 'text-gray-400 line-through' : 'text-gray-800 font-black'}`}>
                                        {item.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                                    <span>{item.qty} {item.unit}</span>
                                    <span>•</span>
                                    <span>${(item.price * item.qty).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <button
                                onClick={(e) => { e.stopPropagation(); toggleBuyStatus(item.id); }}
                                className={`p-1.5 rounded-lg transition-all ${item.buyStatus === 'NOW' ? 'text-red-500 hover:bg-red-50' : 'text-gray-200 hover:text-gray-400'}`}
                                title={item.buyStatus === 'NOW' ? 'Move to Buy Later' : 'Move to Buy Now'}
                            >
                                <ArrowRight className={`w-4 h-4 transition-transform ${item.buyStatus === 'NOW' ? 'rotate-90' : '-rotate-90'}`} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); openEditModal(item); }}
                                className="text-gray-300 hover:text-primary transition-all p-1.5"
                                title="Edit"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => deleteItem(item.id)}
                                className="text-gray-300 hover:text-red-500 transition-all p-1.5"
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Grocery;
