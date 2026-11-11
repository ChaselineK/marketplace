import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import PriceDisplay from '../components/common/PriceDisplay';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Coins, Store, MessageSquare, ArrowRight, ShieldCheck, Filter, AlertCircle, Plus, Minus } from 'lucide-react';

export default function CpMarketplace() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bundles, setBundles] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [selectedCp, setSelectedCp] = useState('');

  // Order modal state
  const [activeBundle, setActiveBundle] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [ordering, setOrdering] = useState(false);
  const [orderError, setOrderError] = useState('');

  const fetchVendors = async () => {
    try {
      const res = await apiClient.get('/vendors');
      setVendors(res.data.data);
    } catch (err) {
      console.error('Failed to load vendors', err);
    }
  };

  const fetchBundles = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/cp-bundles', {
        params: {
          vendor_slug: selectedVendor || undefined,
          cp_amount: selectedCp || undefined,
        },
      });
      setBundles(res.data.data);
    } catch (err) {
      console.error('Failed to load CP bundles', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    fetchBundles();
  }, [selectedVendor, selectedCp]);

  const handleOpenOrderModal = (bundle) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setActiveBundle(bundle);
    setQuantity(1);
    setOrderError('');
  };

  const handlePlaceOrder = async () => {
    if (!activeBundle) return;

    try {
      setOrdering(true);
      setOrderError('');
      const res = await apiClient.post('/orders', {
        item_type: 'cp_bundle',
        item_id: activeBundle.id,
        quantity: quantity,
      });

      const orderRef = res.data.data.public_reference;
      navigate(`/app/orders/${orderRef}`);
    } catch (err) {
      setOrderError(err.response?.data?.message || 'Failed to place CP order.');
    } finally {
      setOrdering(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 mb-8 shadow-xs">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
              In-Game Currency
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-2">
              CODM Points (CP) Bundles
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Select verified vendors, compare competitive CP pricing, and arrange swift delivery via WhatsApp.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vendor Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Filter by Store</label>
              <select
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
              >
                <option value="">All Approved Vendors</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.store_slug}>
                    {v.store_name}
                  </option>
                ))}
              </select>
            </div>

            {/* CP Amount Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Filter by CP Amount</label>
              <select
                value={selectedCp}
                onChange={(e) => setSelectedCp(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
              >
                <option value="">All Bundle Sizes</option>
                <option value="80">80 CP</option>
                <option value="420">420 CP</option>
                <option value="880">880 CP</option>
                <option value="2400">2,400 CP</option>
                <option value="5000">5,000 CP</option>
                <option value="10800">10,800 CP</option>
              </select>
            </div>
          </div>
        </div>

        {/* Currency Notice */}
        <div className="mb-6 p-4 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-center justify-between">
          <div className="flex items-center">
            <Coins className="w-4 h-4 mr-2 text-amber-600 shrink-0" />
            <span>
              <strong>Price Guarantee:</strong> Store prices are authoritative in vendor-set base currency (TZS). Secondary converted currency figures are live labeled estimates.
            </span>
          </div>
        </div>

        {/* CP Bundles Grid */}
        {loading ? (
          <div className="py-16 text-center text-sm text-slate-500">Loading CP bundles...</div>
        ) : bundles.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center shadow-xs">
            <Coins className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No CP bundles available</h3>
            <p className="text-sm text-slate-500 mt-1">
              Try adjusting your filter settings.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {bundles.map((bundle) => {
              const whatsappUrl = bundle.vendor?.whatsapp_number
                ? `https://wa.me/${bundle.vendor.whatsapp_number}?text=${encodeURIComponent(
                    `Hello ${bundle.vendor.store_name}, I would like to order "${bundle.formatted_title}" for ${bundle.price_currency} ${Number(
                      bundle.price_amount
                    ).toLocaleString()} on WILRICH STORE.`
                  )}`
                : null;

              return (
                <div
                  key={bundle.id}
                  className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col justify-between hover:border-slate-400 transition-colors shadow-xs"
                >
                  <div>
                    {/* Standardized CP Category Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                        <Coins className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        In Stock
                      </span>
                    </div>

                    <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                      {bundle.formatted_title}
                    </h3>

                    {/* Vendor info */}
                    <div className="mt-2 text-xs text-slate-600 flex items-center space-x-1">
                      <Store className="w-3.5 h-3.5 text-slate-400" />
                      <Link
                        to={`/app/vendors/${bundle.vendor?.store_slug}`}
                        className="hover:underline font-medium text-slate-700"
                      >
                        {bundle.vendor?.store_name}
                      </Link>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <div className="mb-4">
                      <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Authoritative Price
                      </div>
                      <PriceDisplay
                        amount={bundle.price_amount}
                        baseCurrency={bundle.price_currency}
                        size="large"
                      />
                    </div>

                    <button
                      onClick={() => handleOpenOrderModal(bundle)}
                      className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold transition-colors shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                      Order CP Bundle
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CP Order Modal */}
        {activeBundle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Order CP Bundle</h3>
                <button
                  onClick={() => {
                    setActiveBundle(null);
                    setOrderError('');
                  }}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  &times;
                </button>
              </div>

              {orderError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-start">
                  <AlertCircle className="w-4 h-4 mr-1.5 shrink-0 mt-0.5" />
                  <span>{orderError}</span>
                </div>
              )}

              <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{activeBundle.formatted_title}</span>
                  <span className="text-slate-500 font-medium">Sold by {activeBundle.vendor?.store_name}</span>
                </div>

                <div className="flex justify-between py-1 border-t border-slate-200 text-slate-600">
                  <span>Unit Price</span>
                  <span className="font-semibold text-slate-900">
                    {activeBundle.price_currency} {Number(activeBundle.price_amount).toLocaleString()}
                  </span>
                </div>

                {/* Quantity selector */}
                <div className="flex items-center justify-between py-2 border-t border-slate-200">
                  <span className="text-slate-700 font-medium">Quantity (Packs)</span>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-7 h-7 rounded border border-slate-300 bg-white flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center font-bold text-slate-900 text-sm">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      disabled={quantity >= 20}
                      onClick={() => setQuantity(Math.min(20, quantity + 1))}
                      className="w-7 h-7 rounded border border-slate-300 bg-white flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Total Authoritative and Converted Price */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-900">Total Price</span>
                  <PriceDisplay
                    amount={activeBundle.price_amount * quantity}
                    baseCurrency={activeBundle.price_currency}
                    size="medium"
                  />
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Confirming will generate your order reference and direct you to the vendor on WhatsApp to complete payment and receive your CP top-up.
              </p>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveBundle(null);
                    setOrderError('');
                  }}
                  className="w-1/2 py-2 px-3 border border-slate-300 rounded text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={ordering}
                  onClick={handlePlaceOrder}
                  className="w-1/2 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {ordering ? 'Placing Order...' : 'Confirm & Proceed'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} WILRICH STORE. Call of Duty: Mobile CP Marketplace.</p>
      </footer>
    </div>
  );
}
