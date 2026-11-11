import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import PriceDisplay from '../components/common/PriceDisplay';
import apiClient from '../api/client';
import { Gamepad2, Search, Store, ArrowRight, FilterX, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AccountMarketplace() {
  const [listings, setListings] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('');
  const [sort, setSort] = useState('newest');

  const fetchVendors = async () => {
    try {
      const res = await apiClient.get('/vendors');
      setVendors(res.data.data);
    } catch (err) {
      console.error('Failed to load vendors', err);
    }
  };

  const fetchListings = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/listings', {
        params: {
          q: search || undefined,
          vendor_slug: selectedVendor || undefined,
          sort,
        },
      });
      setListings(res.data.data);
    } catch (err) {
      console.error('Failed to load listings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchListings();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedVendor, sort]);

  const resetFilters = () => {
    setSearch('');
    setSelectedVendor('');
    setSort('newest');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between page-transition">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Header & Filters */}
        <div className="glass-panel-elevated rounded-2xl p-6 sm:p-8 mb-8 shadow-xs">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-quantum-700 bg-quantum-50 px-2.5 py-1 rounded-full border border-quantum-200">
              Verified Marketplace
            </span>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight mt-2.5">
              CODM Account Listings
            </h1>
            <p className="text-sm text-stone-600 mt-1">
              Browse and purchase verified Activision Call of Duty: Mobile accounts from approved vendors.
            </p>
          </div>

          {/* Filters Bar */}
          <div className="mt-6 pt-6 border-t border-ice-200 grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <Search className="w-4 h-4 text-quantum-600" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search weapons, mythics, skins..."
                className="w-full pl-9 pr-4 py-2 border border-ice-300 rounded-xl text-sm placeholder-stone-400 bg-white/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum-500 focus:border-quantum-500 transition-colors"
              />
            </div>

            {/* Vendor Filter */}
            <div>
              <select
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
                className="w-full px-3 py-2 border border-ice-300 rounded-xl text-sm bg-white/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum-500 focus:border-quantum-500 transition-colors cursor-pointer text-stone-800"
              >
                <option value="">All Vendors</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.store_slug}>
                    {v.store_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full px-3 py-2 border border-ice-300 rounded-xl text-sm bg-white/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum-500 focus:border-quantum-500 transition-colors cursor-pointer text-stone-800"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Listings Grid (Loading, Empty, and Populated States) */}
        {loading ? (
          <div className="py-20 text-center text-sm font-medium page-transition">
            <div className="glass-panel p-8 rounded-2xl max-w-sm mx-auto flex flex-col items-center">
              <Loader2 className="w-8 h-8 animate-spin text-quantum-600 mb-3" />
              <p className="text-stone-700">Loading accounts...</p>
            </div>
          </div>
        ) : listings.length === 0 ? (
          <div className="glass-panel-elevated rounded-2xl p-12 text-center max-w-md mx-auto shadow-xs page-transition">
            <Gamepad2 className="w-12 h-12 text-quantum-500 mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-stone-900">No accounts match your criteria</h3>
            <p className="text-sm text-stone-500 mt-1 mb-6">
              Try modifying your search keywords or resetting filters.
            </p>
            {(search || selectedVendor || sort !== 'newest') && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center px-4 py-2 glass-button text-xs font-semibold rounded-xl"
              >
                <FilterX className="w-3.5 h-3.5 mr-1.5" /> Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((account) => (
              <div
                key={account.id}
                className="group glass-panel rounded-2xl overflow-hidden flex flex-col justify-between hover:border-quantum-400 hover:shadow-md transition-all"
              >
                {/* Image */}
                <div className="h-48 bg-stone-900 relative flex items-center justify-center overflow-hidden">
                  {account.primary_image_url ? (
                    <img
                      src={account.primary_image_url}
                      alt={account.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <Gamepad2 className="w-10 h-10 text-stone-600 mx-auto mb-2" />
                      <span className="text-xs font-medium text-stone-400">Verified CODM Account</span>
                    </div>
                  )}
                  <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-quantum-600 text-white shadow-xs">
                    Available
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-1.5 text-xs text-stone-500 mb-2">
                      <Store className="w-3.5 h-3.5 text-quantum-600" />
                      <span className="font-medium">{account.vendor?.store_name || 'Verified Vendor'}</span>
                    </div>

                    <h3 className="text-base font-bold text-stone-900 line-clamp-1 mb-2 group-hover:text-quantum-600 transition-colors">
                      {account.title}
                    </h3>

                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-4">
                      {account.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-ice-200 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-stone-400 mb-0.5">Sale Price</div>
                      <PriceDisplay
                        amount={account.price_amount}
                        baseCurrency={account.price_currency}
                        size="normal"
                      />
                    </div>

                    <Link
                      to={`/app/accounts/${account.id}`}
                      className="inline-flex items-center text-xs font-semibold px-3 py-2 glass-button rounded-xl shadow-xs"
                    >
                      View Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="glass-panel border-t border-ice-200 py-6 text-center text-xs text-stone-500 mt-12">
        <p>&copy; {new Date().getFullYear()} WILRICH STORE. CODM Accounts Marketplace.</p>
      </footer>
    </div>
  );
}
