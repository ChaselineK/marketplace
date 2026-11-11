import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import apiClient from '../api/client';
import { Store, ShieldCheck, ArrowLeft, Gamepad2, Coins, MessageSquare, Loader2, ArrowRight } from 'lucide-react';

export default function VendorStorefront() {
  const { slug } = useParams();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('accounts');

  useEffect(() => {
    setLoading(true);
    apiClient.get(`/vendors/${slug}`)
      .then((res) => {
        setVendor(res.data.data);
        setError('');
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Vendor storefront not found.');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto py-24 text-center page-transition">
          <div className="glass-panel p-8 rounded-2xl flex flex-col items-center">
            <Loader2 className="w-8 h-8 animate-spin text-quantum-600 mb-3" />
            <p className="text-sm font-semibold text-quantum-900">Loading storefront...</p>
          </div>
        </div>
        <footer className="py-6 text-center text-xs text-stone-500">
          &copy; {new Date().getFullYear()} WILRICH STORE
        </footer>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="min-h-screen flex flex-col justify-between">
        <Navbar />
        <main className="max-w-md mx-auto px-4 py-16 text-center page-transition">
          <div className="glass-panel-elevated p-8 rounded-2xl">
            <Store className="w-12 h-12 text-quantum-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-stone-900 mb-2">Storefront Not Found</h2>
            <p className="text-sm text-stone-600 mb-6">{error || 'This vendor is not currently published.'}</p>
            <Link
              to="/app/vendors"
              className="inline-flex items-center px-4 py-2 glass-button text-white rounded-lg text-sm font-semibold shadow-xs"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Vendor Directory
            </Link>
          </div>
        </main>
        <footer className="py-6 text-center text-xs text-stone-500">
          &copy; {new Date().getFullYear()} WILRICH STORE
        </footer>
      </div>
    );
  }

  const whatsappUrl = `https://wa.me/${vendor.whatsapp_number}?text=${encodeURIComponent(
    `Hello ${vendor.store_name}, I am viewing your storefront on WILRICH STORE.`
  )}`;

  return (
    <div className="min-h-screen flex flex-col justify-between page-transition">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Breadcrumb */}
        <div className="mb-4">
          <Link
            to="/app/vendors"
            className="inline-flex items-center text-xs font-semibold text-stone-600 hover:text-quantum-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> All Vendors
          </Link>
        </div>

        {/* Storefront Header */}
        <div className="glass-panel-elevated rounded-2xl p-6 sm:p-8 mb-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 rounded-2xl glass-button flex items-center justify-center font-bold text-2xl tracking-wider shrink-0 shadow-md">
                {vendor.store_name?.charAt(0) || 'V'}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
                    {vendor.store_name}
                  </h1>
                  <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" /> Verified
                  </span>
                </div>
                <div className="text-xs font-mono text-quantum-700 mt-1">
                  Store Slug: <strong>@{vendor.store_slug}</strong>
                </div>
                <p className="text-sm text-stone-600 mt-2 max-w-2xl leading-relaxed">
                  {vendor.description || 'Verified merchant offering CODM accounts and in-game CP packages.'}
                </p>
              </div>
            </div>

            {/* Direct WhatsApp Contact Handoff Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-md"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Contact on WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Store Tabs */}
        <div className="border-b border-ice-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('accounts')}
              className={`pb-4 px-1 text-sm font-semibold border-b-2 flex items-center transition-all cursor-pointer ${
                activeTab === 'accounts'
                  ? 'border-quantum-600 text-quantum-700'
                  : 'border-transparent text-stone-500 hover:text-quantum-600'
              }`}
            >
              <Gamepad2 className="w-4 h-4 mr-2" />
              CODM Accounts
            </button>
            <button
              onClick={() => setActiveTab('cp')}
              className={`pb-4 px-1 text-sm font-semibold border-b-2 flex items-center transition-all cursor-pointer ${
                activeTab === 'cp'
                  ? 'border-quantum-600 text-quantum-700'
                  : 'border-transparent text-stone-500 hover:text-quantum-600'
              }`}
            >
              <Coins className="w-4 h-4 mr-2" />
              CP Bundles
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'accounts' ? (
          <div className="glass-panel rounded-2xl p-12 text-center shadow-xs">
            <Gamepad2 className="w-10 h-10 text-quantum-500 mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-stone-900">Verified Account Inventory</h3>
            <p className="text-sm text-stone-500 mt-1 max-w-md mx-auto">
              Explore this vendor's live listings in the CODM Accounts marketplace.
            </p>
            <div className="mt-4">
              <Link
                to={`/app/accounts`}
                className="inline-flex items-center text-xs font-semibold px-4 py-2 glass-button rounded-xl shadow-xs"
              >
                Browse Accounts <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="glass-panel rounded-2xl p-12 text-center shadow-xs">
            <Coins className="w-10 h-10 text-quantum-500 mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-stone-900">Competitive CP Packages</h3>
            <p className="text-sm text-stone-500 mt-1 max-w-md mx-auto">
              View standardized CP bundles with vendor-specific pricing in the CP marketplace.
            </p>
            <div className="mt-4">
              <Link
                to={`/app/cp`}
                className="inline-flex items-center text-xs font-semibold px-4 py-2 glass-button rounded-xl shadow-xs"
              >
                Browse CP Bundles <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>
        )}
      </main>

      <footer className="glass-panel border-t border-ice-200 py-6 text-center text-xs text-stone-500 mt-12">
        <p>&copy; {new Date().getFullYear()} WILRICH STORE. Vendor Storefront.</p>
      </footer>
    </div>
  );
}
