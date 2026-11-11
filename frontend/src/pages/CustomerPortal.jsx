import React from 'react';
import Navbar from '../components/common/Navbar';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag,
  Gamepad2,
  Coins,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  MessageSquare,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CustomerPortal() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col justify-between page-transition">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-10">
        
        {/* HERO SECTION */}
        <section className="relative overflow-hidden rounded-3xl glass-panel-elevated p-8 sm:p-12 border border-ice-200 shadow-xl">
          {/* Ambient Glow Elements */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-quantum-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-ice-400/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Partner & Emblem Tag */}
              <div className="inline-flex items-center space-x-2.5 px-3 py-1.5 rounded-full bg-white/80 border border-ice-300 shadow-2xs backdrop-blur-xs">
                <div className="w-5 h-5 rounded-md overflow-hidden bg-black shrink-0">
                  <img src="/codm-logo.jpg" alt="CODM" className="w-full h-full object-cover" />
                </div>
                <span className="text-xs font-bold text-stone-800">
                  Call of Duty: Mobile Verified Trading Hub
                </span>
              </div>

              {/* Headline - Single Line, Two-Tone, Heavy Font Weight */}
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                  <span className="text-coca-950">WILRICH</span>{' '}
                  <span className="text-electric-600">STORE</span>
                </h1>
                <p className="text-base sm:text-lg font-bold text-stone-700 tracking-tight">
                  Premium CODM Accounts &amp; Authorized CP Currency
                </p>
              </div>

              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-xl">
                Purchase verified Activision Call of Duty: Mobile accounts featuring max-level mythics and legendaries, or compare competitive CP bundle pricing delivered directly to your UID via verified WhatsApp handoffs.
              </p>

              {/* Primary Call to Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/app/accounts"
                  className="inline-flex items-center justify-center px-5 py-3 rounded-xl text-sm font-bold text-white glass-button shadow-md hover:shadow-lg transition-all"
                >
                  <Gamepad2 className="w-4 h-4 mr-2" />
                  Browse CODM Accounts
                </Link>

                <Link
                  to="/app/cp"
                  className="inline-flex items-center justify-center px-5 py-3 rounded-xl text-sm font-bold text-quantum-700 bg-white/90 hover:bg-white border border-ice-300 hover:border-quantum-400 transition-colors shadow-2xs"
                >
                  <Coins className="w-4 h-4 mr-2 text-quantum-600" />
                  Buy CP Bundles
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 border-t border-ice-200/80 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 text-xs">
                <div className="flex items-center space-x-2 text-stone-700 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Escrow Protected</span>
                </div>
                <div className="flex items-center space-x-2 text-stone-700 font-semibold">
                  <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Instant Handoff</span>
                </div>
                <div className="flex items-center space-x-2 text-stone-700 font-semibold">
                  <Lock className="w-4 h-4 text-quantum-600 shrink-0" />
                  <span>Clean Credentials</span>
                </div>
              </div>
            </div>

            {/* Right Showcase Card Column: 30% Coca Brown with Electric Blue accents */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md bg-gradient-to-br from-coca-950 via-coca-900 to-coca-950 rounded-3xl p-6 text-white shadow-2xl border border-blush-300/30 relative overflow-hidden">
                {/* Visual Glow */}
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-electric-500/25 rounded-full blur-2xl pointer-events-none" />

                {/* Card Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blush-200">
                      Live CP Top-Up Feed
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-electric-300 bg-white/10 px-2 py-0.5 rounded-full">
                    Official Rates
                  </span>
                </div>

                {/* Prominent CP Artwork Display */}
                <div className="h-44 w-full rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center p-3 mb-5 overflow-hidden shadow-inner relative group">
                  <img
                    src="/codm-cp.jpg"
                    alt="Call of Duty Mobile CP Coins"
                    className="w-full h-full object-contain drop-shadow-lg transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute bottom-2 right-2 bg-electric-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-lg shadow-xs">
                    Standardized Assets
                  </div>
                </div>

                {/* Quick Info Matrix */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-ice-200">Authorized Sellers:</span>
                    <span className="font-bold text-white">Snow's Store, REX CP &amp; 007 CP</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-ice-200">Authoritative Base Currency:</span>
                    <span className="font-bold text-quantum-300">TZS (Tanzanian Shilling)</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-ice-200">Secondary Converted Displays:</span>
                    <span className="font-bold text-white">USD &bull; NGN Live Estimates</span>
                  </div>
                </div>

                {/* Quick Action Button */}
                <Link
                  to="/app/cp"
                  className="mt-5 w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-quantum-600 hover:bg-quantum-500 transition-colors shadow-md"
                >
                  Explore All CP Denominations <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CATEGORIES GRID */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">
              Marketplace Sectors
            </h2>
            <span className="text-xs text-stone-500">
              Logged in as <strong className="text-stone-800">{user?.name}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CODM Accounts Card */}
            <Link
              to="/app/accounts"
              className="group glass-panel rounded-2xl p-6 hover:border-quantum-400 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-quantum-50 border border-quantum-200 flex items-center justify-center text-quantum-600 mb-4 group-hover:scale-105 group-hover:bg-quantum-600 group-hover:text-white transition-all">
                  <Gamepad2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-stone-900 mb-1 group-hover:text-quantum-600 transition-colors">
                  CODM Accounts
                </h3>
                <p className="text-xs text-stone-600 mb-4 leading-relaxed">
                  Explore verified Activision accounts with mythic weapon blueprints, legendary operator camos, and full level progression.
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
                <h3 className="text-lg font-bold text-stone-900 mb-1 group-hover:text-quantum-600 transition-colors">
                  CODM Points (CP)
                </h3>
                <p className="text-xs text-stone-600 mb-4 leading-relaxed">
                  Compare standardized CP bundles from verified vendors with instant WhatsApp fulfillment links and secure order references.
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
                <h3 className="text-lg font-bold text-stone-900 mb-1 group-hover:text-quantum-600 transition-colors">
                  My Orders
                </h3>
                <p className="text-xs text-stone-600 mb-4 leading-relaxed">
                  View your active order references, resume WhatsApp conversations with sellers, and inspect status milestones.
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
        </section>
      </main>

      <footer className="glass-panel border-t border-ice-200 py-6 text-center text-xs text-stone-500 mt-12">
        <p>&copy; {new Date().getFullYear()} WILRICH STORE. Call of Duty: Mobile Accounts &amp; Points.</p>
      </footer>
    </div>
  );
}
