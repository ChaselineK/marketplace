import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import apiClient from '../api/client';
import { Store, Search, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function VendorDirectory() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchVendors = async (query = '') => {
    try {
      setLoading(true);
      const res = await apiClient.get('/vendors', {
        params: query ? { q: query } : {},
      });
      setVendors(res.data.data);
    } catch (err) {
      console.error('Failed to load vendors', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVendors(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="min-h-screen flex flex-col justify-between page-transition">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Header & Search */}
        <div className="glass-panel-elevated rounded-2xl p-6 sm:p-8 mb-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-quantum-700 bg-quantum-50 px-2.5 py-1 rounded-full border border-quantum-200">
                Verified Storefronts
              </span>
              <h1 className="text-2xl font-bold text-stone-900 tracking-tight mt-2.5">
                CODM Vendor Directory
              </h1>
              <p className="text-sm text-stone-600 mt-1">
                Explore approved vendors with verified WhatsApp fulfilment.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <Search className="w-4 h-4 text-quantum-600" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search vendor or store..."
                className="w-full pl-9 pr-4 py-2 border border-ice-300 rounded-xl text-sm placeholder-stone-400 bg-white/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum-500 focus:border-quantum-500 text-stone-800 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Vendors Grid (Loading, Empty, and Populated States) */}
        {loading ? (
          <div className="py-20 text-center text-sm font-medium page-transition">
            <div className="glass-panel p-8 rounded-2xl max-w-sm mx-auto flex flex-col items-center">
              <Loader2 className="w-8 h-8 animate-spin text-quantum-600 mb-3" />
              <p className="text-stone-700">Loading storefronts...</p>
            </div>
          </div>
        ) : vendors.length === 0 ? (
          <div className="glass-panel-elevated rounded-2xl p-12 text-center max-w-md mx-auto shadow-xs page-transition">
            <Store className="w-10 h-10 text-quantum-500 mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-stone-900">No vendors found</h3>
            <p className="text-sm text-stone-500 mt-1">
              Try adjusting your search criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.map((vendor) => (
              <div
                key={vendor.id}
                className="group glass-panel rounded-2xl p-6 flex flex-col justify-between hover:border-quantum-400 hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-11 h-11 rounded-xl glass-button flex items-center justify-center font-bold text-base shadow-xs group-hover:scale-105 transition-transform">
                      {vendor.store_name?.charAt(0) || 'V'}
                    </div>
                    <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" /> Verified Vendor
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-stone-900 tracking-tight group-hover:text-quantum-600 transition-colors">
                    {vendor.store_name}
                  </h3>
                  <div className="text-xs font-mono text-quantum-700 mb-3">
                    @{vendor.store_slug}
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed line-clamp-3 mb-6">
                    {vendor.description || 'Verified merchant providing high-grade accounts and instant CP deliveries.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-ice-200 flex items-center justify-between">
                  <span className="text-xs text-stone-500 font-medium">Verified Handoff</span>
                  <Link
                    to={`/app/vendors/${vendor.store_slug}`}
                    className="inline-flex items-center text-xs font-semibold px-3 py-1.5 glass-button rounded-xl shadow-xs"
                  >
                    View Storefront <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="glass-panel border-t border-ice-200 py-6 text-center text-xs text-stone-500 mt-12">
        <p>&copy; {new Date().getFullYear()} WILRICH STORE. Vendor Directory.</p>
      </footer>
    </div>
  );
}
