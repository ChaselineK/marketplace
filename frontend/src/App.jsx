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
import { Loader2 } from 'lucide-react';

function RootRedirect() {
  const { user, loading, isSuperAdmin, isVendor } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-slate-700" />
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

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CurrencyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
