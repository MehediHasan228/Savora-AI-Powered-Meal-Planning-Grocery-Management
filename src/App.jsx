import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Recipes from './pages/Recipes';
import InventoryHub from './pages/InventoryHub';
import AICommandCenter from './pages/admin/AICommandCenter';
import ApiMonitoring from './pages/ApiMonitoring';
import Settings from './pages/Settings';
import Database from './pages/Database';
import Login from './pages/Login';

// Lazy loaded components
const Grocery = React.lazy(() => import('./pages/Grocery'));
const Notifications = React.lazy(() => import('./pages/Notifications'));
const Analytics = React.lazy(() => import('./pages/Analytics'));
const MealPlanner = React.lazy(() => import('./pages/MealPlanner'));
const AdminNotifications = React.lazy(() => import('./pages/admin/AdminNotifications'));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const AuditLogs = React.lazy(() => import('./pages/admin/AuditLogs'));

import { UserProvider } from './context/UserContext';
import { InventoryProvider } from './context/InventoryContext';
import { UIProvider } from './context/UIContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <InventoryProvider>
          <UIProvider>
            <BrowserRouter basename={import.meta.env.BASE_URL}>
              <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
                <Routes>
                  {/* Public Route */}
                  <Route path="/login" element={<Login />} />

                  {/* Protected Routes */}
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <DashboardLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Dashboard />} />
                    <Route
                      path="users"
                      element={
                        <ProtectedRoute allowedRoles={['admin', 'manager']}>
                          <Users />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="recipes" element={<Recipes />} />
                    <Route path="inventory" element={<InventoryHub />} />
                    <Route path="grocery" element={<Grocery />} />
                    <Route path="meal-planner" element={<MealPlanner />} />
                    <Route path="notifications" element={<Notifications />} />
                    <Route path="analytics" element={<Analytics />} />

                    <Route
                      path="admin/notifications"
                      element={
                        <ProtectedRoute allowedRoles={['admin']}>
                          <AdminNotifications />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="admin/dashboard"
                      element={
                        <ProtectedRoute allowedRoles={['admin']}>
                          <AdminDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="admin/ai-command-center"
                      element={
                        <ProtectedRoute allowedRoles={['admin', 'manager']}>
                          <AICommandCenter />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="admin/audit-logs"
                      element={
                        <ProtectedRoute allowedRoles={['admin']}>
                          <AuditLogs />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="api-monitoring"
                      element={
                        <ProtectedRoute allowedRoles={['admin']}>
                          <ApiMonitoring />
                        </ProtectedRoute>
                      }
                    />

                    <Route path="settings" element={<Settings />} />
                    <Route
                      path="database"
                      element={
                        <ProtectedRoute allowedRoles={['admin']}>
                          <Database />
                        </ProtectedRoute>
                      }
                    />
                  </Route>

                  {/* Catch-all redirect */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </UIProvider>
        </InventoryProvider>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;
