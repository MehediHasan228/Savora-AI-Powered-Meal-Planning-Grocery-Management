import axios from 'axios';
import { mockMealPlanService } from './mockData';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Check if we are running in a demo environment (GitHub Pages)
// Using safer check that doesn't rely solely on window for build time safety
const isDemoMode = typeof window !== 'undefined' && (
    window.location.hostname.includes('github.io') ||
    window.location.hostname.includes('netlify.app')
);

// Log for debugging
if (isDemoMode) {
    console.log('🚀 DEMO MODE ACTIVE: Using mock services');
}

const api = axios.create({
    // ... (rest of file)
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Inventory Services
export const inventoryService = {
    getAll: (params) => api.get('/inventory', { params }),
    create: (data) => api.post('/inventory', data),
    update: (id, data) => api.put(`/inventory/${id}`, data),
    delete: (id) => api.delete(`/inventory/${id}`),
    moveToGrocery: (id) => api.post(`/inventory/${id}/move-to-grocery`),
    barcodeLookup: (barcode) => api.post('/inventory/barcode-lookup', { barcode }),
    getSuggestions: () => api.get('/inventory/suggestions'),
};

// Admin Inventory Services
export const adminInventoryService = {
    getSummary: () => api.get('/admin/inventory/summary'),
    getTrends: () => api.get('/admin/inventory/trends'),
};

// Admin Grocery Services
export const adminGroceryService = {
    getInsights: () => api.get('/admin/grocery/insights'),
    getWaste: () => api.get('/admin/grocery/waste'),
};

// Recipe Services
export const recipeService = {
    getAll: () => api.get('/recipes'),
    create: (data) => api.post('/recipes', data),
    update: (id, data) => api.put(`/recipes/${id}`, data),
    delete: (id) => api.delete(`/recipes/${id}`),
};

// User Services
export const userService = {
    getAll: () => api.get('/users'),
    create: (data) => api.post('/users', data),
    update: (id, data) => api.put(`/users/${id}`, data),
    resetPassword: (id, password) => api.put(`/users/${id}/reset-password`, { password }),
    delete: (id) => api.delete(`/users/${id}`),
};

// Grocery Services
export const groceryService = {
    getAll: () => api.get('/grocery'),
    create: (data) => api.post('/grocery', data),
    update: (id, data) => api.put(`/grocery/${id}`, data),
    bulkAdd: (items) => api.post('/grocery/bulk', { items }),
    toggle: (id) => api.patch(`/grocery/${id}/toggle`),
    delete: (id) => api.delete(`/grocery/${id}`),
    clearCompleted: () => api.delete('/grocery/completed'),
    moveToInventory: () => api.post('/grocery/move-to-inventory'),
    suggestCategory: (name) => api.get('/grocery/suggest-category', { params: { name } }),
    togglePriority: (id) => api.patch(`/grocery/${id}/toggle-priority`),
    refresh: () => api.post('/grocery/refresh'),
};

// Auth Services
export const authService = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data) => api.put('/auth/profile', data),
};

// AI Services
export const aiService = {
    chat: (data) => api.post('/ai/chat', data),
    analyzeInventory: (items) => api.post('/ai/analyze-inventory', { items }),
};

// External Recipe Services (Spoonacular)
// Notification Endpoints
export const notificationService = {
    getAll: () => api.get('/notifications'),
    markRead: (id) => api.put(`/notifications/${id}/read`),
    markReadAll: () => api.put('/notifications/read-all'),
    getSettings: () => api.get('/notifications/settings'),
    updateSettings: (data) => api.put('/notifications/settings', data),
    // Admin
    sendBroadcast: (data) => api.post('/admin/notifications/broadcast', data),
    getStats: () => api.get('/admin/notifications/stats')
};

export const externalRecipeService = {
    search: (params) => api.get('/external/recipes/search', { params }),
    getDetails: (id) => api.get(`/external/recipes/${id}`),
};

// Database Panel Services
export const databaseService = {
    getStats: () => api.get('/database/stats'),
    getTableData: (table) => api.get(`/database/${table}`),
    getRecord: (table, id) => api.get(`/database/${table}/${id}`),
    createRecord: (table, data) => api.post(`/database/${table}`, data),
    updateRecord: (table, id, data) => api.put(`/database/${table}/${id}`, data),
    deleteRecord: (table, id) => api.delete(`/database/${table}/${id}`),
};

// System Services
export const systemService = {
    getStats: () => api.get('/system/stats'),
};

// Meal Plan Services
export const mealPlanService = isDemoMode ? mockMealPlanService : {
    getWeekPlan: (startDate, endDate) => api.get('/meal-plan', { params: { startDate, endDate } }),
    generateWeekPlan: (startDate) => api.post('/meal-plan/generate', { startDate }),
    updateSlot: (data) => api.put('/meal-plan/slot', data),
    deleteSlot: (date, slot) => api.delete('/meal-plan/slot', { params: { date, slot } }),
    addToGrocery: (startDate, endDate) => api.post('/meal-plan/grocery-sync', { startDate, endDate }),
};

export default api;
