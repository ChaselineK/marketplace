import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import { ShoppingBag, ShieldCheck, Gamepad2, Coins, ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CustomerPortal() {
  const { user } = useAuth();
  const [portalStatus, setPortalStatus] = useState(null);

  useEffect(() => {
    apiClient.get('/customer/portal-check')
      .then((res) => setPortalStatus(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Welcome Banner */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 mb-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                Customer Marketplace
              </span>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-2">
                Welcome back, {user?.name}
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Browse verified Call of Duty: Mobile accounts and competitive CP bundles from verified vendors.
              </p>
            </div>
            {portalStatus && (
              <div className="inline-flex items-center text-xs font-medium text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded border border-emerald-200">
                <ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-600" />
                Customer Access Verified
              </div>
            )}
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* CODM Accounts Card */}
          <Link
            to="/app/accounts"
            className="bg-white border border-slate-200 rounded-lg p-6 hover:border-slate-400 transition-colors shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900 mb-4">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">CODM Accounts</h2>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Explore vendor-listed accounts featuring mythic weapons, legendary skins, and verified level progression.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Browse Stock</span>
              <span className="inline-flex items-center font-semibold text-slate-900">
                View Accounts <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </span>
            </div>
          </Link>

          {/* CP Currency Card */}
          <Link
            to="/app/cp"
            className="bg-white border border-slate-200 rounded-lg p-6 hover:border-slate-400 transition-colors shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900 mb-4">
                <Coins className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">CODM Points (CP)</h2>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Compare vendor prices across various CP bundle amounts (2,400 CP, 5,000 CP, 10,800 CP) with WhatsApp handoff.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Compare Pricing</span>
              <span className="inline-flex items-center font-semibold text-slate-900">
                View Bundles <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </span>
            </div>
          </Link>

          {/* My Orders Card */}
          <Link
            to="/app/orders"
            className="bg-white border border-slate-200 rounded-lg p-6 hover:border-slate-400 transition-colors shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900 mb-4">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">My Orders</h2>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                View your active order references, access direct vendor WhatsApp links, and track fulfillment status.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Track Purchases</span>
              <span className="inline-flex items-center font-semibold text-slate-900">
                View Orders <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </span>
            </div>
          </Link>
        </div>

        {/* Phase 1 Verification Callout */}
        <div className="border border-slate-200 bg-white rounded-lg p-6 text-sm">
          <div className="font-semibold text-slate-900 flex items-center mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 mr-2" />
            Phase 1 Role Isolation Active
          </div>
          <p className="text-slate-600 text-xs leading-relaxed">
            As a Customer, you have access exclusively to public listings and your personal order history. Attempts to query Super Admin or Vendor endpoints return <code>403 Forbidden</code> enforced by backend policy middleware.
          </p>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} WILRICH STORE. All rights reserved.</p>
      </footer>
    </div>
  );
}

