import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { LogOut, Shield, Store, ShoppingBag, Globe } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isSuperAdmin, isVendor, isCustomer } = useAuth();
  const { displayCurrency, setDisplayCurrency, supportedCurrencies } = useCurrency();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleBadge = () => {
    if (!user) return null;
    switch (user.role) {
      case 'super_admin':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Shield className="w-3 h-3 mr-1" /> Super Admin
          </span>
        );
      case 'vendor':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <Store className="w-3 h-3 mr-1" /> Vendor
          </span>
        );
      case 'customer':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <ShoppingBag className="w-3 h-3 mr-1" /> Customer
          </span>
        );
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-8">
            <Link to={user ? (isSuperAdmin ? '/admin' : isVendor ? '/vendor' : '/app') : '/login'} className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-slate-900 text-white rounded flex items-center justify-center font-bold text-base tracking-wider">
                WS
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">WILRICH STORE</span>
            </Link>

            {/* Role-specific Navigation */}
            {user && (
              <nav className="hidden md:flex items-center space-x-6">
                {isCustomer && (
                  <>
                    <Link to="/app" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                      Marketplace
                    </Link>
                    <Link to="/app/vendors" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                      Vendors
                    </Link>
                    <Link to="/app/accounts" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                      CODM Accounts
                    </Link>
                    <Link to="/app/cp" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                      CP Bundles
                    </Link>
                    <Link to="/app/orders" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                      My Orders
                    </Link>
                    <Link to="/app/tickets" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                      Support
                    </Link>
                  </>
                )}

                {isVendor && (
                  <>
                    <Link to="/vendor" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                      Dashboard
                    </Link>
                    <Link to="/vendor/accounts" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                      Account Inventory
                    </Link>
                    <Link to="/vendor/cp" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                      CP Bundles
                    </Link>
                    <Link to="/vendor/orders" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                      Orders
                    </Link>
                    <Link to="/vendor/tickets" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                      Tickets
                    </Link>
                    <Link to="/vendor/store-settings" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                      Store Settings
                    </Link>
                  </>
                )}

                {isSuperAdmin && (
                  <>
                    <Link to="/admin" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                      Admin Overview
                    </Link>
                    <Link to="/admin/vendors" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                      Vendors Management
                    </Link>
                    <Link to="/admin/rates" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                      Exchange Rates
                    </Link>
                    <Link to="/admin/tickets" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                      Disputes &amp; Tickets
                    </Link>
                  </>
                )}
              </nav>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Currency Selector */}
            <div className="flex items-center space-x-1 border border-slate-200 rounded px-2 py-1 bg-slate-50 text-xs">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={displayCurrency}
                onChange={(e) => setDisplayCurrency(e.target.value)}
                className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer"
                title="Select Display Currency"
              >
                {supportedCurrencies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {user ? (
              <div className="flex items-center space-x-3">
                {getRoleBadge()}
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold text-slate-900">{user.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono">{user.email}</div>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-1.5 rounded transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
