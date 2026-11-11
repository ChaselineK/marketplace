import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { LogOut, Shield, Store, ShoppingBag, Globe } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isSuperAdmin, isVendor, isCustomer } = useAuth();
  const { displayCurrency, setDisplayCurrency, supportedCurrencies } = useCurrency();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/app' && location.pathname === '/app') return true;
    if (path !== '/app' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navLinkClass = (path) => {
    return isActive(path)
      ? 'text-sm font-semibold text-quantum-600 border-b-2 border-quantum-600 pb-1 transition-all'
      : 'text-sm font-medium text-stone-600 hover:text-quantum-600 transition-colors pb-1';
  };

  const getRoleBadge = () => {
    if (!user) return null;
    switch (user.role) {
      case 'super_admin':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-quantum-50 text-quantum-700 border border-quantum-200">
            <Shield className="w-3 h-3 mr-1 text-quantum-600" /> Super Admin
          </span>
        );
      case 'vendor':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-ice-100 text-ice-800 border border-ice-300">
            <Store className="w-3 h-3 mr-1 text-quantum-600" /> Vendor
          </span>
        );
      case 'customer':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-ice-100 text-ice-800 border border-ice-300">
            <ShoppingBag className="w-3 h-3 mr-1 text-quantum-600" /> Customer
          </span>
        );
    }
  };

  return (
    <header className="glass-nav sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-8">
            <Link
              to={user ? (isSuperAdmin ? '/admin' : isVendor ? '/vendor' : '/app') : '/login'}
              className="flex items-center space-x-3 group"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base tracking-wider glass-button shadow-sm group-hover:scale-105 transition-transform">
                WS
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-stone-900 tracking-tight leading-none group-hover:text-quantum-600 transition-colors">
                  WILRICH STORE
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-quantum-700">
                  CODM Marketplace
                </span>
              </div>
            </Link>

            {/* Role-specific Navigation */}
            {user && (
              <nav className="hidden md:flex items-center space-x-6">
                {isCustomer && (
                  <>
                    <Link to="/app" className={navLinkClass('/app')}>
                      Marketplace
                    </Link>
                    <Link to="/app/vendors" className={navLinkClass('/app/vendors')}>
                      Vendors
                    </Link>
                    <Link to="/app/accounts" className={navLinkClass('/app/accounts')}>
                      CODM Accounts
                    </Link>
                    <Link to="/app/cp" className={navLinkClass('/app/cp')}>
                      CP Bundles
                    </Link>
                    <Link to="/app/orders" className={navLinkClass('/app/orders')}>
                      My Orders
                    </Link>
                    <Link to="/app/tickets" className={navLinkClass('/app/tickets')}>
                      Support
                    </Link>
                  </>
                )}

                {isVendor && (
                  <>
                    <Link to="/vendor" className={navLinkClass('/vendor')}>
                      Dashboard
                    </Link>
                    <Link to="/vendor/accounts" className={navLinkClass('/vendor/accounts')}>
                      Account Inventory
                    </Link>
                    <Link to="/vendor/cp" className={navLinkClass('/vendor/cp')}>
                      CP Bundles
                    </Link>
                    <Link to="/vendor/orders" className={navLinkClass('/vendor/orders')}>
                      Orders
                    </Link>
                    <Link to="/vendor/tickets" className={navLinkClass('/vendor/tickets')}>
                      Tickets
                    </Link>
                    <Link to="/vendor/store-settings" className={navLinkClass('/vendor/store-settings')}>
                      Store Settings
                    </Link>
                  </>
                )}

                {isSuperAdmin && (
                  <>
                    <Link to="/admin" className={navLinkClass('/admin')}>
                      Admin Overview
                    </Link>
                    <Link to="/admin/vendors" className={navLinkClass('/admin/vendors')}>
                      Vendors Management
                    </Link>
                    <Link to="/admin/rates" className={navLinkClass('/admin/rates')}>
                      Exchange Rates
                    </Link>
                    <Link to="/admin/tickets" className={navLinkClass('/admin/tickets')}>
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
            <div className="flex items-center space-x-1.5 border border-ice-300 rounded-lg px-2.5 py-1 bg-white/70 text-xs shadow-2xs backdrop-blur-xs">
              <Globe className="w-3.5 h-3.5 text-quantum-600" />
              <select
                value={displayCurrency}
                onChange={(e) => setDisplayCurrency(e.target.value)}
                className="bg-transparent font-semibold text-stone-800 focus:outline-none cursor-pointer"
                title="Select Display Currency"
              >
                {supportedCurrencies.map((c) => (
                  <option key={c} value={c} className="bg-white text-stone-900">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {user ? (
              <div className="flex items-center space-x-3">
                {getRoleBadge()}
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold text-stone-900">{user.name}</div>
                  <div className="text-[11px] text-stone-500 font-mono">{user.email}</div>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 text-stone-500 hover:text-quantum-600 hover:bg-quantum-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-stone-700 hover:text-quantum-600 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold glass-button px-4 py-1.5 rounded-lg shadow-sm transition-all"
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
