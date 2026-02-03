import React, { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';

const EditInventoryModal = ({ isOpen, onClose, onSave, item }) => {
    const [editItem, setEditItem] = useState({
        name: '',
        category: '',
        qty: '',
        expiry: '',
        storageZone: '',
        barcode: ''
    });

    useEffect(() => {
        if (item) {
            setEditItem({
                name: item.name || '',
                category: item.category || '',
                qty: item.qty || '',
                expiry: item.expiry || '',
                storageZone: item.storageZone || item.location || 'Pantry',
                barcode: item.barcode || ''
            });
        }
    }, [item]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!editItem.name || !editItem.qty) return;
        onSave(item.id, editItem);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-800">Edit Item</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                        <input
                            required
                            type="text"
                            placeholder="e.g., Chicken Breast"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            value={editItem.name}
                            onChange={e => setEditItem({ ...editItem, name: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                value={editItem.category}
                                onChange={e => setEditItem({ ...editItem, category: e.target.value })}
                            >
                                <option value="">Select...</option>
                                <option>Dairy</option>
                                <option>Meat</option>
                                <option>Seafood</option>
                                <option>Produce</option>
                                <option>Grains</option>
                                <option>Canned</option>
                                <option>Oils</option>
                                <option>Baking</option>
                                <option>Condiments</option>
                                <option>Protein</option>
                                <option>Frozen</option>
                                <option>General</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g., 2 lbs"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                value={editItem.qty}
                                onChange={e => setEditItem({ ...editItem, qty: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
                        <input
                            type="text"
                            placeholder="e.g., 0123456789"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            value={editItem.barcode}
                            onChange={e => setEditItem({ ...editItem, barcode: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Storage Zone</label>
                            <select
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                value={editItem.storageZone}
                                onChange={e => setEditItem({ ...editItem, storageZone: e.target.value })}
                            >
                                <option value="Pantry">Pantry</option>
                                <option value="Fridge">Fridge</option>
                                <option value="Freezer">Freezer</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <Calendar className="w-4 h-4 inline mr-1 -mt-1" /> Expiry Date
                            </label>
                            <input
                                type="date"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                value={editItem.expiry}
                                onChange={e => setEditItem({ ...editItem, expiry: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-emerald-600 font-medium transition-colors shadow-sm"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditInventoryModal;
