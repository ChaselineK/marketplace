import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { LogOut, Shield, Store, ShoppingBag, Globe, LifeBuoy } from 'lucide-react';
import CodmLogo from './CodmLogo';

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
      ? 'text-sm font-semibold text-quantum-600 border-b-2 border-quantum-600 pb-1 transition-all whitespace-nowrap'
      : 'text-sm font-medium text-stone-600 hover:text-quantum-600 transition-colors pb-1 whitespace-nowrap';
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
          <div className="flex items-center space-x-6 sm:space-x-8 shrink-0">
            <Link
              to={user ? (isSuperAdmin ? '/admin' : isVendor ? '/vendor' : '/app') : '/login'}
              className="flex items-center space-x-2.5 group whitespace-nowrap"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center p-1.5 glass-button shadow-xs group-hover:scale-105 transition-transform bg-quantum-50/60 border border-quantum-200">
                <CodmLogo className="w-full h-full" />
              </div>
              <div className="flex items-center whitespace-nowrap">
                <span className="text-xl sm:text-2xl font-black tracking-tight whitespace-nowrap select-none">
                  <span className="text-slate-950">WILRICH</span>
                  <span className="text-quantum-600 ml-1.5">STORE</span>
                </span>
              </div>
            </Link>

            {/* Role-specific Navigation */}
            {user && (
              <nav className="hidden lg:flex items-center space-x-5">
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
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Currency Selector */}
            <div className="flex items-center space-x-1.5 border border-ice-300 rounded-xl px-2.5 py-1.5 bg-white/80 text-xs shadow-2xs backdrop-blur-xs">
              <Globe className="w-3.5 h-3.5 text-quantum-600 shrink-0" />
              <span className="text-[10px] font-bold text-stone-400 uppercase hidden sm:inline mr-0.5">Currency:</span>
              <select
                value={displayCurrency}
                onChange={(e) => setDisplayCurrency(e.target.value)}
                className="bg-transparent font-bold text-stone-800 focus:outline-none cursor-pointer"
                title="Select Display Currency"
              >
                {supportedCurrencies.map((c) => (
                  <option key={c} value={c} className="bg-white text-stone-900 font-medium">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Divider to prevent interchangeable confusion */}
            <div className="h-5 w-px bg-ice-300 hidden sm:block" />

            {/* Dedicated Support Button with clear LifeBuoy Icon & Distinct Styling */}
            <Link
              to={user ? (isSuperAdmin ? '/admin/tickets' : isVendor ? '/vendor/tickets' : '/app/tickets') : '/login'}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-700 hover:text-quantum-600 bg-white/80 hover:bg-white border border-ice-300 hover:border-quantum-300 transition-colors shadow-2xs"
              title="Customer Support & Disputes"
            >
              <LifeBuoy className="w-3.5 h-3.5 text-quantum-600 shrink-0" />
              <span>Support</span>
            </Link>

            {user ? (
              <div className="flex items-center space-x-2 sm:space-x-3 pl-1 sm:pl-2 border-l border-ice-300">
                {getRoleBadge()}
                <div className="text-right hidden xl:block">
                  <div className="text-xs font-semibold text-stone-900">{user.name}</div>
                  <div className="text-[11px] text-stone-500 font-mono">{user.email}</div>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 text-stone-500 hover:text-quantum-600 hover:bg-quantum-50 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 pl-1 sm:pl-2 border-l border-ice-300">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-stone-700 hover:text-quantum-600 px-3 py-1.5 rounded-xl transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-semibold glass-button px-3.5 py-1.5 rounded-xl shadow-xs transition-all"
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
