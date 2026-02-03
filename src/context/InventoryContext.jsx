import React, { createContext, useContext, useState, useEffect } from 'react';
import { getExpiryStatus } from '../utils/expiryUtils';
import { inventoryService } from '../services/api';

const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch inventory from backend
    useEffect(() => {
        const fetchInventory = async () => {
            try {
                setLoading(true);
                const response = await inventoryService.getAll();
                setInventory(response.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching inventory:', err);
                setError('Failed to load inventory. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchInventory();
    }, []);

    // Helper to calculate status based on date
    const getStatus = (date) => {
        return getExpiryStatus(date).status;
    };

    // Add item to inventory
    const addItem = async (item) => {
        try {
            const status = getStatus(item.expiry);
            const response = await inventoryService.create({ ...item, status });
            setInventory(prev => [response.data, ...prev]);
            return response.data;
        } catch (err) {
            console.error('Error adding item:', err);
            throw err;
        }
    };

    // Remove item from inventory
    const removeItem = async (id) => {
        try {
            await inventoryService.delete(id);
            setInventory(prev => prev.filter(item => item.id !== id));
        } catch (err) {
            console.error('Error removing item:', err);
            throw err;
        }
    };

    // Update item in inventory
    const updateItem = async (id, updates) => {
        try {
            const status = updates.expiry ? getStatus(updates.expiry) : undefined;
            // Ensure storageZone and location are kept in sync if one is provided
            const finalUpdates = { ...updates };
            if (updates.storageZone) finalUpdates.location = updates.storageZone;

            const response = await inventoryService.update(id, { ...finalUpdates, ...(status && { status }) });
            setInventory(prev => prev.map(item =>
                item.id === id ? response.data : item
            ));
        } catch (err) {
            console.error('Error updating item:', err);
            throw err;
        }
    };

    // Get all inventory item names (for match calculation)
    const getInventoryNames = () => {
        return inventory.map(item => item.name);
    };

    // Get items by zone
    const getItemsByZone = (zone) => {
        return inventory.filter(item => item.storageZone === zone || item.location === zone);
    };

    // Get inventory statistics
    const getStats = () => {
        const total = inventory.length;
        const expiringSoon = inventory.filter(i => i.status === 'Expiring Soon').length;
        const expired = inventory.filter(i => i.status === 'Expired').length;
        return { total, expiringSoon, expired };
    };

    return (
        <InventoryContext.Provider value={{
            inventory,
            loading,
            error,
            setInventory,
            addItem,
            removeItem,
            updateItem,
            getInventoryNames,
            getItemsByZone, // Renamed from getItemsByLocation
            getStats, // Removed duplicate
            getStatus,
            refreshInventory: () => {
                setLoading(true);
                inventoryService.getAll().then(res => {
                    setInventory(res.data);
                    setLoading(false);
                }).catch(err => {
                    console.error('Error refreshing inventory:', err);
                    setLoading(false);
                });
            }
        }}>
            {children}
        </InventoryContext.Provider>
    );
};

export const useInventory = () => {
    const context = useContext(InventoryContext);
    if (!context) {
        throw new Error('useInventory must be used within an InventoryProvider');
    }
    return context;
};
