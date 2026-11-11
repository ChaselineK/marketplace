import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import apiClient from '../api/client';
import { Store, Phone, ShieldCheck, ArrowLeft, Gamepad2, Coins, MessageSquare } from 'lucide-react';

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
      <div className="min-h-screen bg-cream-100 flex flex-col justify-between">
        <Navbar />
        <div className="py-24 text-center text-sm text-stone-500 font-medium">Loading storefront...</div>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="min-h-screen bg-cream-100 flex flex-col justify-between">
        <Navbar />
        <main className="max-w-md mx-auto px-4 py-16 text-center">
          <Store className="w-12 h-12 text-torch-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-stone-900 mb-2">Storefront Not Found</h2>
          <p className="text-sm text-stone-600 mb-6">{error || 'This vendor is not currently published.'}</p>
          <Link
            to="/app/vendors"
            className="inline-flex items-center px-4 py-2 bg-torch-500 text-white rounded text-sm font-semibold hover:bg-torch-600 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Vendor Directory
          </Link>
        </main>
      </div>
    );
  }

  const whatsappUrl = `https://wa.me/${vendor.whatsapp_number}?text=${encodeURIComponent(
    `Hello ${vendor.store_name}, I am viewing your storefront on WILRICH STORE.`
  )}`;

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Breadcrumb */}
        <div className="mb-4">
          <Link
            to="/app/vendors"
            className="inline-flex items-center text-xs font-semibold text-stone-600 hover:text-torch-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> All Vendors
          </Link>
        </div>

        {/* Storefront Header */}
        <div className="bg-white border border-cream-300 rounded-xl p-6 sm:p-8 mb-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-torch-500 text-white rounded-xl flex items-center justify-center font-bold text-2xl tracking-wider shrink-0 shadow-xs">
                {vendor.store_name?.charAt(0) || 'V'}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
                    {vendor.store_name}
                  </h1>
                  <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" /> Verified
                  </span>
                </div>
                <div className="text-xs font-mono text-stone-500 mt-1">
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
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors shadow-xs"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Contact on WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Store Tabs */}
        <div className="border-b border-cream-300 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('accounts')}
              className={`pb-4 px-1 text-sm font-semibold border-b-2 flex items-center transition-colors cursor-pointer ${
                activeTab === 'accounts'
                  ? 'border-torch-500 text-torch-700'
                  : 'border-transparent text-stone-500 hover:text-torch-600'
              }`}
            >
              <Gamepad2 className="w-4 h-4 mr-2" />
              CODM Accounts
            </button>
            <button
              onClick={() => setActiveTab('cp')}
              className={`pb-4 px-1 text-sm font-semibold border-b-2 flex items-center transition-colors cursor-pointer ${
                activeTab === 'cp'
                  ? 'border-torch-500 text-torch-700'
                  : 'border-transparent text-stone-500 hover:text-torch-600'
              }`}
            >
              <Coins className="w-4 h-4 mr-2" />
              CP Bundles
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'accounts' ? (
          <div className="bg-white border border-cream-300 rounded-xl p-12 text-center shadow-xs">
            <Gamepad2 className="w-10 h-10 text-stone-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-stone-900">Verified Account Inventory</h3>
            <p className="text-sm text-stone-500 mt-1 max-w-md mx-auto">
              Explore this vendor's live listings in the CODM Accounts marketplace.
            </p>
            <div className="mt-4">
              <Link
                to={`/app/accounts`}
                className="inline-flex items-center text-xs font-semibold px-4 py-2 bg-torch-500 hover:bg-torch-600 text-white rounded shadow-xs"
              >
                Browse Accounts
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-cream-300 rounded-xl p-12 text-center shadow-xs">
            <Coins className="w-10 h-10 text-stone-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-stone-900">Competitive CP Packages</h3>
            <p className="text-sm text-stone-500 mt-1 max-w-md mx-auto">
              View standardized CP bundles with vendor-specific pricing in the CP marketplace.
            </p>
            <div className="mt-4">
              <Link
                to={`/app/cp`}
                className="inline-flex items-center text-xs font-semibold px-4 py-2 bg-torch-500 hover:bg-torch-600 text-white rounded shadow-xs"
              >
                Browse CP Bundles
              </Link>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-cream-50 border-t border-cream-300 py-6 text-center text-xs text-stone-500">
        <p>&copy; {new Date().getFullYear()} WILRICH STORE. Vendor Storefront.</p>
      </footer>
    </div>
  );
}
