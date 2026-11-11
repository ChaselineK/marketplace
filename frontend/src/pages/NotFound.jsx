import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft, Home, ShoppingBag, ShieldAlert, LifeBuoy } from 'lucide-react';
import Navbar from '../components/common/Navbar';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-16 sm:py-24 flex-1 flex flex-col items-center justify-center text-center page-transition">
        {/* Ice Glass Card */}
        <div className="glass-panel-elevated rounded-2xl p-8 sm:p-12 w-full relative overflow-hidden">
          {/* Ambient Glow Orb */}
          <div className="absolute -top-16 -right-16 w-44 h-44 bg-quantum-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-ice-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Icon Badge */}
          <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-quantum-50 border border-quantum-200 text-quantum-600 mb-6 shadow-sm">
            <Compass className="w-10 h-10 animate-spin" style={{ animationDuration: '20s' }} />
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-ice-400 border-2 border-white" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight mb-3">
            Page Not Found
          </h1>

          <p className="text-sm text-stone-600 max-w-md mx-auto mb-8 leading-relaxed">
            The page, listing, or transaction reference you are attempting to locate either does not exist, has been decommissioned, or was moved to another sector.
          </p>

          {/* Action Links */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/app"
              className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-semibold glass-button"
            >
              <Home className="w-4 h-4 mr-2" />
              Return to Marketplace
            </Link>

            <Link
              to="/app/orders"
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium text-stone-700 bg-white/80 hover:bg-white border border-ice-300 hover:border-quantum-400 transition-colors shadow-2xs"
            >
              <ShoppingBag className="w-4 h-4 mr-2 text-quantum-600" />
              My Orders
            </Link>

            <Link
              to="/app/tickets"
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium text-stone-700 bg-white/80 hover:bg-white border border-ice-300 hover:border-quantum-400 transition-colors shadow-2xs"
            >
              <LifeBuoy className="w-4 h-4 mr-2 text-quantum-600" />
              Get Support
            </Link>
          </div>

          {/* Quick Diagnostics Footnote */}
          <div className="mt-8 pt-6 border-t border-ice-200/80 text-[11px] text-stone-500 font-mono">
            WILRICH STORE Grid Node &bull; Protocol V1 &bull; 404_PAGE_NOT_FOUND
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-stone-500">
        &copy; {new Date().getFullYear()} WILRICH STORE. Authoritative Digital Gaming Assets.
      </footer>
    </div>
  );
}
