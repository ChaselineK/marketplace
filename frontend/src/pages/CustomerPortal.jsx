import React from 'react';
import Navbar from '../components/common/Navbar';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Gamepad2, Coins, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CustomerPortal() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col justify-between page-transition">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Welcome Banner */}
        <div className="glass-panel-elevated rounded-2xl p-6 sm:p-8 mb-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-quantum-700 bg-quantum-50 px-2.5 py-1 rounded-full border border-quantum-200">
                Customer Marketplace
              </span>
              <h1 className="text-2xl font-bold text-stone-900 tracking-tight mt-2.5">
                Welcome back, {user?.name}
              </h1>
              <p className="text-sm text-stone-600 mt-1">
                Browse verified Call of Duty: Mobile accounts and competitive CP bundles from verified vendors.
              </p>
            </div>
            <div className="inline-flex items-center text-xs font-semibold text-quantum-800 bg-quantum-50/80 px-3 py-1.5 rounded-full border border-quantum-200">
              <ShieldCheck className="w-4 h-4 mr-1.5 text-quantum-600" />
              Verified Buyer Escrow Protected
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* CODM Accounts Card */}
          <Link
            to="/app/accounts"
            className="group glass-panel rounded-2xl p-6 hover:border-quantum-400 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-quantum-50 border border-quantum-200 flex items-center justify-center text-quantum-600 mb-4 group-hover:scale-105 group-hover:bg-quantum-600 group-hover:text-white transition-all">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-stone-900 mb-1 group-hover:text-quantum-600 transition-colors">
                CODM Accounts
              </h2>
              <p className="text-xs text-stone-600 mb-4 leading-relaxed">
                Explore vendor-listed accounts featuring mythic weapons, legendary skins, and verified level progression.
              </p>
            </div>
            <div className="pt-4 border-t border-ice-200 flex items-center justify-between text-xs">
              <span className="text-stone-500 font-medium">Browse Stock</span>
              <span className="inline-flex items-center font-semibold text-quantum-600 group-hover:translate-x-1 transition-transform">
                View Accounts <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </span>
            </div>
          </Link>

          {/* CP Currency Card */}
          <Link
            to="/app/cp"
            className="group glass-panel rounded-2xl p-6 hover:border-quantum-400 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-quantum-50 border border-quantum-200 flex items-center justify-center text-quantum-600 mb-4 group-hover:scale-105 group-hover:bg-quantum-600 group-hover:text-white transition-all">
                <Coins className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-stone-900 mb-1 group-hover:text-quantum-600 transition-colors">
                CODM Points (CP)
              </h2>
              <p className="text-xs text-stone-600 mb-4 leading-relaxed">
                Compare vendor prices across various CP bundle amounts (2,400 CP, 5,000 CP, 10,800 CP) with WhatsApp handoff.
              </p>
            </div>
            <div className="pt-4 border-t border-ice-200 flex items-center justify-between text-xs">
              <span className="text-stone-500 font-medium">Compare Pricing</span>
              <span className="inline-flex items-center font-semibold text-quantum-600 group-hover:translate-x-1 transition-transform">
                View Bundles <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </span>
            </div>
          </Link>

          {/* My Orders Card */}
          <Link
            to="/app/orders"
            className="group glass-panel rounded-2xl p-6 hover:border-quantum-400 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-quantum-50 border border-quantum-200 flex items-center justify-center text-quantum-600 mb-4 group-hover:scale-105 group-hover:bg-quantum-600 group-hover:text-white transition-all">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-stone-900 mb-1 group-hover:text-quantum-600 transition-colors">
                My Orders
              </h2>
              <p className="text-xs text-stone-600 mb-4 leading-relaxed">
                View your active order references, access direct vendor WhatsApp links, and track fulfillment status.
              </p>
            </div>
            <div className="pt-4 border-t border-ice-200 flex items-center justify-between text-xs">
              <span className="text-stone-500 font-medium">Track Purchases</span>
              <span className="inline-flex items-center font-semibold text-quantum-600 group-hover:translate-x-1 transition-transform">
                View Orders <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </span>
            </div>
          </Link>
        </div>
      </main>

      <footer className="glass-panel border-t border-ice-200 py-6 text-center text-xs text-stone-500 mt-12">
        <p>&copy; {new Date().getFullYear()} WILRICH STORE. Call of Duty: Mobile Accounts &amp; Points.</p>
      </footer>
    </div>
  );
}
