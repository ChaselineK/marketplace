import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import apiClient from '../api/client';
import { Store, Search, Phone, ExternalLink, ArrowRight, ShieldCheck } from 'lucide-react';
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
    <div className="min-h-screen bg-cream-100 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Header & Search */}
        <div className="bg-white border border-cream-300 rounded-xl p-6 sm:p-8 mb-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-torch-700 bg-torch-50 px-2.5 py-1 rounded border border-torch-200">
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
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search vendor or store..."
                className="w-full pl-9 pr-4 py-2 border border-cream-300 rounded text-sm placeholder-stone-400 bg-cream-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-torch-500 focus:border-torch-500 text-stone-800 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Vendors Grid */}
        {loading ? (
          <div className="py-12 text-center text-sm text-stone-500 font-medium">Loading storefronts...</div>
        ) : vendors.length === 0 ? (
          <div className="bg-white border border-cream-300 rounded-xl p-12 text-center shadow-xs">
            <Store className="w-10 h-10 text-stone-400 mx-auto mb-3" />
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
                className="group bg-white border border-cream-300 rounded-xl p-6 flex flex-col justify-between hover:border-torch-400 hover:shadow-sm transition-all"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-cream-200 rounded-lg flex items-center justify-center text-torch-600 font-bold text-sm group-hover:bg-torch-500 group-hover:text-white transition-colors">
                      {vendor.store_name?.charAt(0) || 'V'}
                    </div>
                    <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" /> Verified Vendor
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-stone-900 tracking-tight group-hover:text-torch-600 transition-colors">
                    {vendor.store_name}
                  </h3>
                  <div className="text-xs font-mono text-stone-500 mb-3">
                    @{vendor.store_slug}
                  </div>

                  <p className="text-sm text-stone-600 line-clamp-3 mb-4 leading-relaxed">
                    {vendor.description || 'Specializing in verified Call of Duty: Mobile accounts and in-game CP bundles.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-cream-200 flex items-center justify-between">
                  <span className="flex items-center text-xs text-stone-600 font-mono">
                    <Phone className="w-3.5 h-3.5 mr-1 text-torch-600" />
                    +{vendor.whatsapp_number}
                  </span>
                  <Link
                    to={`/app/vendors/${vendor.store_slug}`}
                    className="inline-flex items-center text-xs font-semibold text-torch-700 hover:text-torch-800 group-hover:translate-x-0.5 transition-transform"
                  >
                    View Storefront <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-cream-50 border-t border-cream-300 py-6 text-center text-xs text-stone-500">
        <p>&copy; {new Date().getFullYear()} WILRICH STORE. Vendor Directory.</p>
      </footer>
    </div>
  );
}
