import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import RoleRoute from './components/common/RoleRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerPortal from './pages/CustomerPortal';
import VendorDirectory from './pages/VendorDirectory';
import VendorStorefront from './pages/VendorStorefront';
import AccountMarketplace from './pages/AccountMarketplace';
import AccountDetail from './pages/AccountDetail';
import CpMarketplace from './pages/CpMarketplace';
import CustomerOrders from './pages/CustomerOrders';
import CustomerOrderDetail from './pages/CustomerOrderDetail';
import CustomerTickets from './pages/CustomerTickets';
import CustomerTicketDetail from './pages/CustomerTicketDetail';
import VendorPortal from './pages/VendorPortal';
import VendorAccounts from './pages/VendorAccounts';
import VendorCp from './pages/VendorCp';
import VendorOrders from './pages/VendorOrders';
import VendorTickets from './pages/VendorTickets';
import VendorSettings from './pages/VendorSettings';
import AdminPortal from './pages/AdminPortal';
import AdminRates from './pages/AdminRates';
import AdminTickets from './pages/AdminTickets';
import Unauthorized from './pages/Unauthorized';
import TermsAndPolicies from './pages/TermsAndPolicies';
import NotFound from './pages/NotFound';
import { Loader2 } from 'lucide-react';

function RootRedirect() {
  const { user, loading, isSuperAdmin, isVendor } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="glass-panel-elevated p-8 rounded-2xl flex flex-col items-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-quantum-500/10 flex items-center justify-center">
            <Loader2 className="w-7 h-7 animate-spin text-quantum-600" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-quantum-700">
            Initializing Session...
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (isSuperAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (isVendor) {
    return <Navigate to="/vendor" replace />;
  }

  return <Navigate to="/app" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CurrencyProvider>
          <Routes>
            {/* Public Root Route */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/policies" element={<TermsAndPolicies />} />
            <Route path="/terms" element={<TermsAndPolicies />} />
            <Route path="/privacy" element={<TermsAndPolicies />} />

            {/* Customer Portal & Storefronts */}
            <Route
              path="/app"
              element={
                <RoleRoute allowedRoles={['customer']}>
                  <CustomerPortal />
                </RoleRoute>
              }
            />
            <Route
              path="/app/vendors"
              element={
                <RoleRoute allowedRoles={['customer', 'super_admin', 'vendor']}>
                  <VendorDirectory />
                </RoleRoute>
              }
            />
            <Route
              path="/app/vendors/:slug"
              element={
                <RoleRoute allowedRoles={['customer', 'super_admin', 'vendor']}>
                  <VendorStorefront />
                </RoleRoute>
              }
            />
            <Route
              path="/app/accounts"
              element={
                <RoleRoute allowedRoles={['customer', 'super_admin', 'vendor']}>
                  <AccountMarketplace />
                </RoleRoute>
              }
            />
            <Route
              path="/app/accounts/:id"
              element={
                <RoleRoute allowedRoles={['customer', 'super_admin', 'vendor']}>
                  <AccountDetail />
                </RoleRoute>
              }
            />
            <Route
              path="/app/cp"
              element={
                <RoleRoute allowedRoles={['customer', 'super_admin', 'vendor']}>
                  <CpMarketplace />
                </RoleRoute>
              }
            />
            <Route
              path="/app/orders"
              element={
                <RoleRoute allowedRoles={['customer']}>
                  <CustomerOrders />
                </RoleRoute>
              }
            />
            <Route
              path="/app/orders/:reference"
              element={
                <RoleRoute allowedRoles={['customer', 'vendor', 'super_admin']}>
                  <CustomerOrderDetail />
                </RoleRoute>
              }
            />
            <Route
              path="/app/tickets"
              element={
                <RoleRoute allowedRoles={['customer']}>
                  <CustomerTickets />
                </RoleRoute>
              }
            />
            <Route
              path="/app/tickets/:reference"
              element={
                <RoleRoute allowedRoles={['customer', 'vendor', 'super_admin']}>
                  <CustomerTicketDetail />
                </RoleRoute>
              }
            />

            {/* Vendor Portal */}
            <Route
              path="/vendor"
              element={
                <RoleRoute allowedRoles={['vendor']}>
                  <VendorPortal />
                </RoleRoute>
              }
            />
            <Route
              path="/vendor/accounts"
              element={
                <RoleRoute allowedRoles={['vendor']}>
                  <VendorAccounts />
                </RoleRoute>
              }
            />
            <Route
              path="/vendor/cp"
              element={
                <RoleRoute allowedRoles={['vendor']}>
                  <VendorCp />
                </RoleRoute>
              }
            />
            <Route
              path="/vendor/orders"
              element={
                <RoleRoute allowedRoles={['vendor']}>
                  <VendorOrders />
                </RoleRoute>
              }
            />
            <Route
              path="/vendor/tickets"
              element={
                <RoleRoute allowedRoles={['vendor']}>
                  <VendorTickets />
                </RoleRoute>
              }
            />
            <Route
              path="/vendor/store-settings"
              element={
                <RoleRoute allowedRoles={['vendor']}>
                  <VendorSettings />
                </RoleRoute>
              }
            />

            {/* Super Admin Portal */}
            <Route
              path="/admin"
              element={
                <RoleRoute allowedRoles={['super_admin']}>
                  <AdminPortal />
                </RoleRoute>
              }
            />
            <Route
              path="/admin/vendors"
              element={
                <RoleRoute allowedRoles={['super_admin']}>
                  <AdminPortal />
                </RoleRoute>
              }
            />
            <Route
              path="/admin/rates"
              element={
                <RoleRoute allowedRoles={['super_admin']}>
                  <AdminRates />
                </RoleRoute>
              }
            />
            <Route
              path="/admin/tickets"
              element={
                <RoleRoute allowedRoles={['super_admin']}>
                  <AdminTickets />
                </RoleRoute>
              }
            />

            {/* Catch-all 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </CurrencyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
