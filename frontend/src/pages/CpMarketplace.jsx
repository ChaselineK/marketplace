import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import PriceDisplay from '../components/common/PriceDisplay';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Coins,
  Store,
  MessageSquare,
  AlertCircle,
  Plus,
  Minus,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  Loader2,
  FilterX,
} from 'lucide-react';

export default function CpMarketplace() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bundles, setBundles] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [selectedCp, setSelectedCp] = useState('');

  // Order placement state machine: idle -> loading -> success | error
  const [activeBundle, setActiveBundle] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [ordering, setOrdering] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [createdOrder, setCreatedOrder] = useState(null);
  const [copiedRef, setCopiedRef] = useState(false);

  const fetchVendors = async () => {
    try {
      const res = await apiClient.get('/vendors', { params: { has_cp: 1, per_page: 50 } });
      setVendors(res.data.data);
    } catch (err) {
      console.warn('Failed to load vendors for filter:', err);
    }
  };

  const fetchBundles = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedVendor) params.vendor = selectedVendor;
      if (selectedCp) params.cp_amount = selectedCp;

      const res = await apiClient.get('/cp-bundles', { params });
      setBundles(res.data.data);
    } catch (err) {
      console.error('Failed to load CP bundles:', err);
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

      const orderData = res.data.data;
      setCreatedOrder(orderData);
      setActiveBundle(null);
    } catch (err) {
      setOrderError(err.response?.data?.message || 'Failed to place CP order.');
    } finally {
      setOrdering(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2500);
  };

  const resetFilters = () => {
    setSelectedVendor('');
    setSelectedCp('');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between page-transition">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Header & Filter Card */}
        <div className="glass-panel-elevated rounded-2xl p-6 sm:p-8 mb-8 shadow-xs">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
              CODM Points (CP) Bundles
            </h1>
            <p className="text-sm text-stone-600 mt-1">
              Select vendors, compare competitive CP pricing, and arrange swift delivery via WhatsApp.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="mt-6 pt-6 border-t border-ice-200 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vendor Filter */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Filter by Store</label>
              <select
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
                className="w-full px-3 py-2 border border-ice-300 rounded-xl text-sm bg-white/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum-500 focus:border-quantum-500 text-stone-800 transition-colors cursor-pointer"
              >
                <option value="">All Stores</option>
                {vendors
                  .filter((v) => v.store_slug === 'rex-cp-store' || v.store_slug === '007-cp-store')
                  .map((v) => (
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
                className="w-full px-3 py-2 border border-ice-300 rounded-xl text-sm bg-white/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum-500 focus:border-quantum-500 text-stone-800 transition-colors cursor-pointer"
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
        <div className="mb-6 p-4 glass-panel rounded-xl text-xs text-stone-700 flex items-center justify-between shadow-2xs">
          <div className="flex items-center">
            <Coins className="w-4 h-4 mr-2 text-quantum-600 shrink-0" />
            <span>
              <strong>Price Guarantee:</strong> Store prices are authoritative in vendor-set base currency (TZS). Secondary converted currency figures are live labeled estimates.
            </span>
          </div>
          {(selectedVendor || selectedCp) && (
            <button
              onClick={resetFilters}
              className="text-xs text-quantum-700 hover:text-quantum-900 font-medium underline flex items-center shrink-0 ml-3"
            >
              <FilterX className="w-3.5 h-3.5 mr-1" /> Clear Filters
            </button>
          )}
        </div>

        {/* CP Bundles Grid (Loading & Empty States) */}
        {loading ? (
          <div className="py-20 text-center text-sm font-medium page-transition">
            <div className="glass-panel p-8 rounded-2xl max-w-sm mx-auto flex flex-col items-center">
              <Loader2 className="w-8 h-8 animate-spin text-quantum-600 mb-3" />
              <p className="text-stone-700">Loading CP bundles...</p>
            </div>
          </div>
        ) : bundles.length === 0 ? (
          /* Empty State */
          <div className="glass-panel-elevated rounded-2xl p-12 text-center max-w-md mx-auto shadow-sm page-transition">
            <Coins className="w-12 h-12 text-quantum-500 mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-stone-900">No CP bundles available</h3>
            <p className="text-sm text-stone-500 mt-1 mb-6">
              No packages match your chosen filters. Try resetting the store or bundle size filters.
            </p>
            <button
              onClick={resetFilters}
              className="px-4 py-2 glass-button text-xs font-semibold rounded-lg"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {bundles.map((bundle) => {
              return (
                <div
                  key={bundle.id}
                  className="group glass-panel rounded-2xl p-5 flex flex-col justify-between hover:border-quantum-400 hover:shadow-md transition-all"
                >
                  <div>
                    {/* Official CP Coins Image Banner */}
                    <div className="h-36 sm:h-40 w-full rounded-xl overflow-hidden bg-black mb-4 relative flex items-center justify-center border border-quantum-100 shadow-2xs">
                      <img
                        src="/codm-cp.jpg"
                        alt="Call of Duty: Mobile CP"
                        className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2.5 right-2.5 text-[10px] font-bold text-white bg-quantum-600/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full shadow-xs">
                        In Stock
                      </span>
                    </div>

                    <h3 className="text-xl font-extrabold text-stone-900 tracking-tight group-hover:text-quantum-600 transition-colors">
                      {bundle.formatted_title}
                    </h3>

                    {/* Vendor info */}
                    <div className="mt-2 text-xs text-stone-600 flex items-center space-x-1.5">
                      <Store className="w-3.5 h-3.5 text-quantum-600" />
                      <Link
                        to={`/app/vendors/${bundle.vendor?.store_slug}`}
                        className="hover:underline font-medium text-stone-700"
                      >
                        {bundle.vendor?.store_name}
                      </Link>
                    </div>

                    {bundle.description && (
                      <p className="mt-2 text-xs text-stone-600 line-clamp-2 leading-relaxed">
                        {bundle.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-ice-200">
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
                      className="w-full inline-flex items-center justify-center px-4 py-2.5 glass-button text-xs font-semibold rounded-xl shadow-xs"
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

        {/* CP Order Modal (Loading & Error States) */}
        {activeBundle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 page-transition">
            <div className="glass-panel-elevated rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-ice-200">
                <h3 className="text-base font-bold text-stone-900">Order CP Bundle</h3>
                <button
                  onClick={() => {
                    setActiveBundle(null);
                    setOrderError('');
                  }}
                  className="text-stone-400 hover:text-stone-600 text-lg font-bold"
                >
                  &times;
                </button>
              </div>

              {/* Error State */}
              {orderError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 mr-1 shrink-0 mt-0.5 text-red-600" />
                  <div className="flex-1">
                    <div className="font-semibold">Order Placement Error</div>
                    <div>{orderError}</div>
                  </div>
                </div>
              )}

              <div className="space-y-3 text-xs bg-ice-100/70 p-4 rounded-xl border border-ice-200">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-black overflow-hidden shrink-0 border border-quantum-200 shadow-xs flex items-center justify-center">
                    <img src="/codm-cp.jpg" alt="CP Coins" className="w-full h-full object-contain p-1" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-stone-900 text-sm truncate">{activeBundle.formatted_title}</div>
                    <div className="text-stone-500 font-medium text-[11px]">Sold by {activeBundle.vendor?.store_name}</div>
                    {activeBundle.description && (
                      <div className="text-[11px] text-stone-600 mt-1 leading-snug">{activeBundle.description}</div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between py-1 border-t border-ice-200 text-stone-600">
                  <span>Unit Price</span>
                  <span className="font-semibold text-stone-900">
                    {activeBundle.price_currency} {Number(activeBundle.price_amount).toLocaleString()}
                  </span>
                </div>

                {/* Quantity selector */}
                <div className="flex items-center justify-between py-2 border-t border-ice-200">
                  <span className="text-stone-700 font-medium">Quantity (Packs)</span>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-7 h-7 rounded-lg border border-ice-300 bg-white flex items-center justify-center text-stone-700 hover:bg-ice-100 disabled:opacity-40 transition-colors"
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
                      className="w-7 h-7 rounded-lg border border-ice-300 bg-white flex items-center justify-center text-stone-700 hover:bg-ice-100 disabled:opacity-40 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Total Authoritative Price */}
                <div className="flex items-center justify-between pt-2 border-t border-ice-200">
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
                  className="w-1/2 py-2 px-3 border border-ice-300 rounded-xl text-xs font-semibold text-stone-700 hover:bg-white transition-colors"
                >
                  Cancel
                </button>

                {/* Loading State during Order Placement */}
                <button
                  type="button"
                  disabled={ordering}
                  onClick={handlePlaceOrder}
                  className="w-1/2 py-2 px-3 glass-button text-white rounded-xl text-xs font-semibold transition-all shadow-xs disabled:opacity-50 flex items-center justify-center"
                >
                  {ordering ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      Placing Order...
                    </>
                  ) : (
                    'Confirm & Proceed'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Successful CP Order Creation Modal (Success State) */}
        {createdOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 page-transition">
            <div className="glass-panel-elevated rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    CP Order Created
                  </span>
                  <h3 className="text-lg font-bold text-stone-900 mt-1">
                    Ready for WhatsApp Top-Up
                  </h3>
                </div>
              </div>

              {/* Reference Box with Copy */}
              <div className="bg-quantum-50/70 border border-quantum-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-quantum-700 tracking-wider">
                    Order Reference
                  </span>
                  <div className="font-mono text-base font-extrabold text-stone-900 mt-0.5">
                    {createdOrder.public_reference}
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(createdOrder.public_reference)}
                  className="inline-flex items-center px-3 py-1.5 bg-white border border-quantum-200 hover:border-quantum-400 rounded-lg text-xs font-medium text-quantum-700 transition-colors shadow-2xs"
                  title="Copy reference code"
                >
                  {copiedRef ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1 text-quantum-600" /> Copy
                    </>
                  )}
                </button>
              </div>

              {/* Summary Details */}
              <div className="space-y-2 text-xs text-stone-700 bg-ice-100/70 p-4 rounded-xl border border-ice-200">
                <div className="flex justify-between py-1">
                  <span className="text-stone-500">Package</span>
                  <span className="font-semibold text-stone-900">
                    {createdOrder.item_title_snapshot} ({createdOrder.quantity} packs)
                  </span>
                </div>
                <div className="flex justify-between py-1 border-t border-ice-200">
                  <span className="text-stone-500">Total Price</span>
                  <span className="font-bold text-stone-900">
                    {createdOrder.price_currency} {Number(createdOrder.total_price_amount).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-t border-ice-200">
                  <span className="text-stone-500">Next Action</span>
                  <span className="font-semibold text-amber-700">
                    Send message on WhatsApp to complete delivery
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-2">
                {createdOrder.whatsapp_handoff_url ? (
                  <a
                    href={createdOrder.whatsapp_handoff_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center px-4 py-3 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-md"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Continue on WhatsApp with Seller
                  </a>
                ) : null}

                <button
                  onClick={() => navigate(`/app/orders/${createdOrder.public_reference}`)}
                  className="w-full flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold glass-button"
                >
                  View Full Order Details <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="glass-panel border-t border-ice-200 py-6 text-center text-xs text-stone-500 mt-12">
        <p>&copy; {new Date().getFullYear()} WILRICH STORE. Call of Duty: Mobile CP Marketplace.</p>
      </footer>
    </div>
  );
}
