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
    <div className="min-h-screen bg-cream-100 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Welcome Banner */}
        <div className="bg-white border border-cream-300 rounded-xl p-6 sm:p-8 mb-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-torch-700 bg-torch-50 px-2.5 py-1 rounded border border-torch-200">
                Customer Marketplace
              </span>
              <h1 className="text-2xl font-bold text-stone-900 tracking-tight mt-2.5">
                Welcome back, {user?.name}
              </h1>
              <p className="text-sm text-stone-600 mt-1">
                Browse verified Call of Duty: Mobile accounts and competitive CP bundles from verified vendors.
              </p>
            </div>
            {portalStatus && (
              <div className="inline-flex items-center text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded border border-emerald-200 self-start sm:self-auto">
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
            className="group bg-white border border-cream-300 rounded-xl p-6 hover:border-torch-400 hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-lg bg-cream-200 flex items-center justify-center text-torch-600 mb-4 group-hover:bg-torch-500 group-hover:text-white transition-colors">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-stone-900 mb-1 group-hover:text-torch-600 transition-colors">
                CODM Accounts
              </h2>
              <p className="text-xs text-stone-600 mb-4 leading-relaxed">
                Explore vendor-listed accounts featuring mythic weapons, legendary skins, and verified level progression.
              </p>
            </div>
            <div className="pt-4 border-t border-cream-200 flex items-center justify-between text-xs">
              <span className="text-stone-500 font-medium">Browse Stock</span>
              <span className="inline-flex items-center font-semibold text-torch-600 group-hover:translate-x-0.5 transition-transform">
                View Accounts <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </span>
            </div>
          </Link>

          {/* CP Currency Card */}
          <Link
            to="/app/cp"
            className="group bg-white border border-cream-300 rounded-xl p-6 hover:border-torch-400 hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-lg bg-cream-200 flex items-center justify-center text-torch-600 mb-4 group-hover:bg-torch-500 group-hover:text-white transition-colors">
                <Coins className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-stone-900 mb-1 group-hover:text-torch-600 transition-colors">
                CODM Points (CP)
              </h2>
              <p className="text-xs text-stone-600 mb-4 leading-relaxed">
                Compare vendor prices across various CP bundle amounts (2,400 CP, 5,000 CP, 10,800 CP) with WhatsApp handoff.
              </p>
            </div>
            <div className="pt-4 border-t border-cream-200 flex items-center justify-between text-xs">
              <span className="text-stone-500 font-medium">Compare Pricing</span>
              <span className="inline-flex items-center font-semibold text-torch-600 group-hover:translate-x-0.5 transition-transform">
                View Bundles <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </span>
            </div>
          </Link>

          {/* My Orders Card */}
          <Link
            to="/app/orders"
            className="group bg-white border border-cream-300 rounded-xl p-6 hover:border-torch-400 hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-lg bg-cream-200 flex items-center justify-center text-torch-600 mb-4 group-hover:bg-torch-500 group-hover:text-white transition-colors">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-stone-900 mb-1 group-hover:text-torch-600 transition-colors">
                My Orders
              </h2>
              <p className="text-xs text-stone-600 mb-4 leading-relaxed">
                View your active order references, access direct vendor WhatsApp links, and track fulfillment status.
              </p>
            </div>
            <div className="pt-4 border-t border-cream-200 flex items-center justify-between text-xs">
              <span className="text-stone-500 font-medium">Track Purchases</span>
              <span className="inline-flex items-center font-semibold text-torch-600 group-hover:translate-x-0.5 transition-transform">
                View Orders <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </span>
            </div>
          </Link>
        </div>

        {/* Phase 1 Verification Callout */}
        <div className="border border-cream-300 bg-white rounded-xl p-6 text-sm shadow-xs">
          <div className="font-semibold text-stone-900 flex items-center mb-2">
            <ShieldCheck className="w-4 h-4 text-torch-600 mr-2" />
            Verified Customer Protection Active
          </div>
          <p className="text-stone-600 text-xs leading-relaxed">
            As a customer, you have access to verified listings and your personal order history. Server-side policies strictly prevent cross-vendor leakage and ensure safe fulfillment handoff.
          </p>
        </div>
      </main>

      <footer className="bg-cream-50 border-t border-cream-300 py-6 text-center text-xs text-stone-500">
        <p>&copy; {new Date().getFullYear()} WILRICH STORE. All rights reserved.</p>
      </footer>
    </div>
  );
}
