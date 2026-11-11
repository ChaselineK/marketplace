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
    <div className="min-h-screen bg-cream-100 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Header & Filter Card */}
        <div className="bg-white border border-cream-300 rounded-xl p-6 sm:p-8 mb-8 shadow-xs">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-torch-700 bg-torch-50 px-2.5 py-1 rounded border border-torch-200">
              In-Game Currency
            </span>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight mt-2.5">
              CODM Points (CP) Bundles
            </h1>
            <p className="text-sm text-stone-600 mt-1">
              Select verified vendors, compare competitive CP pricing, and arrange swift delivery via WhatsApp.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="mt-6 pt-6 border-t border-cream-200 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vendor Filter */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Filter by Store</label>
              <select
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
                className="w-full px-3 py-2 border border-cream-300 rounded text-sm bg-cream-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-torch-500 focus:border-torch-500 text-stone-800 transition-colors cursor-pointer"
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
              <label className="block text-xs font-semibold text-stone-700 mb-1">Filter by CP Amount</label>
              <select
                value={selectedCp}
                onChange={(e) => setSelectedCp(e.target.value)}
                className="w-full px-3 py-2 border border-cream-300 rounded text-sm bg-cream-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-torch-500 focus:border-torch-500 text-stone-800 transition-colors cursor-pointer"
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
        <div className="mb-6 p-4 bg-cream-200 border border-cream-300 rounded-xl text-xs text-stone-700 flex items-center justify-between shadow-2xs">
          <div className="flex items-center">
            <Coins className="w-4 h-4 mr-2 text-torch-600 shrink-0" />
            <span>
              <strong>Price Guarantee:</strong> Store prices are authoritative in vendor-set base currency (TZS). Secondary converted currency figures are live labeled estimates.
            </span>
          </div>
        </div>

        {/* CP Bundles Grid */}
        {loading ? (
          <div className="py-16 text-center text-sm text-stone-500 font-medium">Loading CP bundles...</div>
        ) : bundles.length === 0 ? (
          <div className="bg-white border border-cream-300 rounded-xl p-12 text-center shadow-xs">
            <Coins className="w-12 h-12 text-stone-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-stone-900">No CP bundles available</h3>
            <p className="text-sm text-stone-500 mt-1">
              Try adjusting your filter settings.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {bundles.map((bundle) => {
              return (
                <div
                  key={bundle.id}
                  className="group bg-white border border-cream-300 rounded-xl p-6 flex flex-col justify-between hover:border-torch-400 hover:shadow-sm transition-all"
                >
                  <div>
                    {/* Standardized CP Category Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-lg bg-cream-200 flex items-center justify-center text-torch-600 group-hover:bg-torch-500 group-hover:text-white transition-colors">
                        <Coins className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-semibold text-torch-700 bg-torch-50 px-2 py-0.5 rounded border border-torch-200">
                        In Stock
                      </span>
                    </div>

                    <h3 className="text-xl font-extrabold text-stone-900 tracking-tight group-hover:text-torch-600 transition-colors">
                      {bundle.formatted_title}
                    </h3>

                    {/* Vendor info */}
                    <div className="mt-2 text-xs text-stone-600 flex items-center space-x-1">
                      <Store className="w-3.5 h-3.5 text-torch-600" />
                      <Link
                        to={`/app/vendors/${bundle.vendor?.store_slug}`}
                        className="hover:underline font-medium text-stone-700"
                      >
                        {bundle.vendor?.store_name}
                      </Link>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-cream-200">
                    <div className="mb-4">
                      <div className="text-[10px] uppercase font-bold text-stone-400 mb-1">
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
                      className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-torch-500 hover:bg-torch-600 text-white rounded text-xs font-semibold transition-colors shadow-xs"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4 border border-cream-300">
              <div className="flex items-center justify-between pb-3 border-b border-cream-200">
                <h3 className="text-base font-bold text-stone-900">Order CP Bundle</h3>
                <button
                  onClick={() => {
                    setActiveBundle(null);
                    setOrderError('');
                  }}
                  className="text-stone-400 hover:text-stone-600 text-base font-bold"
                >
                  &times;
                </button>
              </div>

              {orderError && (
                <div className="p-3 bg-torch-50 border border-torch-200 rounded text-xs text-torch-800 flex items-start">
                  <AlertCircle className="w-4 h-4 mr-1.5 shrink-0 mt-0.5 text-torch-600" />
                  <span>{orderError}</span>
                </div>
              )}

              <div className="space-y-3 text-xs bg-cream-100 p-4 rounded-lg border border-cream-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 text-sm">{activeBundle.formatted_title}</span>
                  <span className="text-stone-500 font-medium">Sold by {activeBundle.vendor?.store_name}</span>
                </div>

                <div className="flex justify-between py-1 border-t border-cream-300 text-stone-600">
                  <span>Unit Price</span>
                  <span className="font-semibold text-stone-900">
                    {activeBundle.price_currency} {Number(activeBundle.price_amount).toLocaleString()}
                  </span>
                </div>

                {/* Quantity selector */}
                <div className="flex items-center justify-between py-2 border-t border-cream-300">
                  <span className="text-stone-700 font-medium">Quantity (Packs)</span>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-7 h-7 rounded border border-cream-300 bg-white flex items-center justify-center text-stone-700 hover:bg-cream-200 disabled:opacity-40"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center font-bold text-stone-900 text-sm">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      disabled={quantity >= 20}
                      onClick={() => setQuantity(Math.min(20, quantity + 1))}
                      className="w-7 h-7 rounded border border-cream-300 bg-white flex items-center justify-center text-stone-700 hover:bg-cream-200 disabled:opacity-40"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Total Authoritative and Converted Price */}
                <div className="flex items-center justify-between pt-2 border-t border-cream-300">
                  <span className="font-bold text-stone-900">Total Price</span>
                  <PriceDisplay
                    amount={activeBundle.price_amount * quantity}
                    baseCurrency={activeBundle.price_currency}
                    size="normal"
                  />
                </div>
              </div>

              <p className="text-xs text-stone-500 leading-relaxed">
                Confirming will generate your order reference and direct you to the vendor on WhatsApp to complete payment and receive your CP top-up.
              </p>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveBundle(null);
                    setOrderError('');
                  }}
                  className="w-1/2 py-2 px-3 border border-cream-300 rounded text-xs font-semibold text-stone-700 hover:bg-cream-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={ordering}
                  onClick={handlePlaceOrder}
                  className="w-1/2 py-2 px-3 bg-torch-500 hover:bg-torch-600 text-white rounded text-xs font-semibold transition-colors shadow-xs disabled:opacity-50"
                >
                  {ordering ? 'Placing Order...' : 'Confirm & Proceed'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-cream-50 border-t border-cream-300 py-6 text-center text-xs text-stone-500">
        <p>&copy; {new Date().getFullYear()} WILRICH STORE. Call of Duty: Mobile CP Marketplace.</p>
      </footer>
    </div>
  );
}
