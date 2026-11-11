import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import PriceDisplay from '../components/common/PriceDisplay';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Gamepad2,
  Store,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  Loader2,
  ExternalLink,
} from 'lucide-react';

export default function AccountDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  // Order creation state machine: idle -> loading -> success | error
  const [ordering, setOrdering] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [createdOrder, setCreatedOrder] = useState(null);
  const [copiedRef, setCopiedRef] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiClient
      .get(`/listings/${id}`)
      .then((res) => {
        setAccount(res.data.data);
        if (res.data.data.images?.length > 0) {
          setSelectedImage(res.data.data.images[0].url);
        } else if (res.data.data.primary_image_url) {
          setSelectedImage(res.data.data.primary_image_url);
        }
        setError('');
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Listing not found or no longer available.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handlePlaceOrder = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setOrdering(true);
      setOrderError('');
      const res = await apiClient.post('/orders', {
        item_type: 'account',
        item_id: account.id,
      });

      const orderData = res.data.data;
      setCreatedOrder(orderData);
      setShowOrderModal(false);
    } catch (err) {
      setOrderError(err.response?.data?.message || 'Failed to create order. Please check availability.');
    } finally {
      setOrdering(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto py-24 text-center page-transition">
          <div className="glass-panel p-8 rounded-2xl flex flex-col items-center">
            <Loader2 className="w-8 h-8 animate-spin text-quantum-600 mb-3" />
            <p className="text-sm font-semibold text-quantum-900">Loading account details...</p>
          </div>
        </div>
        <footer className="py-6 text-center text-xs text-stone-500">
          &copy; {new Date().getFullYear()} WILRICH STORE
        </footer>
      </div>
    );
  }

  // Empty / Not Found State
  if (error || !account) {
    return (
      <div className="min-h-screen flex flex-col justify-between">
        <Navbar />
        <main className="max-w-md mx-auto px-4 py-16 text-center page-transition">
          <div className="glass-panel-elevated p-8 rounded-2xl">
            <AlertCircle className="w-12 h-12 text-quantum-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-stone-900 mb-2">Account Not Available</h2>
            <p className="text-sm text-stone-600 mb-6">{error || 'This listing has been sold or removed.'}</p>
            <Link
              to="/app/accounts"
              className="inline-flex items-center px-4 py-2 glass-button text-white rounded-lg text-sm font-semibold shadow-xs"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Accounts
            </Link>
          </div>
        </main>
        <footer className="py-6 text-center text-xs text-stone-500">
          &copy; {new Date().getFullYear()} WILRICH STORE
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between page-transition">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/app/accounts"
            className="inline-flex items-center text-xs font-semibold text-stone-600 hover:text-quantum-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Account Listings
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Visuals & Description */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Image */}
            <div className="glass-panel rounded-2xl overflow-hidden shadow-xs">
              <div className="h-80 sm:h-96 bg-stone-900 flex items-center justify-center overflow-hidden">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt={account.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center p-8">
                    <Gamepad2 className="w-16 h-16 text-ice-400 mx-auto mb-3" />
                    <span className="text-sm font-medium text-stone-400">Verified CODM Account Asset</span>
                  </div>
                )}
              </div>

              {/* Thumbnails if multiple */}
              {account.images?.length > 1 && (
                <div className="p-4 border-t border-ice-200 flex items-center space-x-3 overflow-x-auto bg-ice-50/50">
                  {account.images.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(img.url)}
                      className={`w-16 h-16 rounded-lg border-2 overflow-hidden shrink-0 transition-all ${
                        selectedImage === img.url
                          ? 'border-quantum-600 ring-2 ring-quantum-200'
                          : 'border-ice-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description & Specifications */}
            <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-xs">
              <h2 className="text-lg font-bold text-stone-900 mb-4 pb-3 border-b border-ice-200">
                Account Overview &amp; Specifications
              </h2>
              <div className="prose prose-sm text-stone-700 whitespace-pre-line leading-relaxed">
                {account.description}
              </div>

              <div className="mt-8 pt-6 border-t border-ice-200 bg-quantum-50/60 p-4 rounded-xl text-xs text-stone-700 border border-quantum-100">
                <div className="font-semibold text-quantum-900 mb-1 flex items-center">
                  <ShieldCheck className="w-4 h-4 text-quantum-600 mr-1.5" />
                  Buyer Protection &amp; Safe Transfer Process
                </div>
                Orders are coordinated through WILRICH STORE with immutable snapshots. After placing an order, you will be handed off to the vendor on WhatsApp to arrange safe credential transfer and verification.
              </div>
            </div>
          </div>

          {/* Right Column: Pricing & Vendor Card */}
          <div className="space-y-6">
            {/* Purchase Card */}
            <div className="glass-panel rounded-2xl p-6 shadow-xs">
              <div className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-quantum-50 text-quantum-700 border border-quantum-200 mb-4">
                <span className="w-2 h-2 rounded-full bg-quantum-600 mr-1.5 animate-pulse" />
                Available in Stock
              </div>

              <h1 className="text-xl font-bold text-stone-900 tracking-tight mb-2">
                {account.title}
              </h1>

              <div className="my-6 pb-6 border-t border-b border-ice-200 pt-4">
                <div className="text-xs uppercase font-bold text-stone-400 mb-1">Authoritative Price</div>
                <PriceDisplay
                  amount={account.price_amount}
                  baseCurrency={account.price_currency}
                  size="large"
                />
              </div>

              {/* Order Placement Action */}
              <button
                onClick={() => setShowOrderModal(true)}
                className="w-full flex items-center justify-center px-4 py-3 rounded-xl text-sm font-semibold glass-button shadow-md mb-3"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Place Order &amp; Proceed to WhatsApp
              </button>

              <p className="text-center text-[11px] text-stone-500">
                Reserves this account and initiates a verified WhatsApp handoff.
              </p>
            </div>

            {/* Vendor Details Card */}
            <div className="glass-panel rounded-2xl p-6 shadow-xs">
              <div className="text-xs uppercase font-bold text-stone-400 mb-3">Listed By</div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl glass-button font-bold flex items-center justify-center text-sm shadow-xs">
                  {account.vendor?.store_name?.charAt(0) || 'V'}
                </div>
                <div>
                  <div className="font-bold text-stone-900 text-sm">{account.vendor?.store_name}</div>
                  <div className="text-xs font-mono text-quantum-700">@{account.vendor?.store_slug}</div>
                </div>
              </div>

              {account.vendor?.store_slug && (
                <Link
                  to={`/app/vendors/${account.vendor.store_slug}`}
                  className="w-full inline-flex items-center justify-center px-3 py-2 border border-ice-300 rounded-xl text-xs font-semibold text-stone-800 bg-white/80 hover:bg-white transition-colors"
                >
                  <Store className="w-3.5 h-3.5 mr-1.5 text-quantum-600" /> Visit Vendor Storefront
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation & Order Placement Modal (Loading & Error States) */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 page-transition">
          <div className="glass-panel-elevated rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-ice-200">
              <h3 className="text-base font-bold text-stone-900">Confirm Order Placement</h3>
              <button
                onClick={() => {
                  setShowOrderModal(false);
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
                  <div className="font-semibold">Order Error</div>
                  <div>{orderError}</div>
                </div>
              </div>
            )}

            <div className="space-y-2 text-xs text-stone-700 bg-ice-100/70 p-4 rounded-xl border border-ice-200">
              <div className="font-semibold text-stone-900 text-sm mb-1">{account.title}</div>
              <div className="flex justify-between py-1 border-t border-ice-200">
                <span>Vendor</span>
                <span className="font-medium text-stone-900">{account.vendor?.store_name}</span>
              </div>
              <div className="flex justify-between py-1 border-t border-ice-200">
                <span>Agreed Price</span>
                <span className="font-bold text-quantum-700">
                  {account.price_currency} {Number(account.price_amount).toLocaleString()}
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-500 leading-relaxed">
              By confirming, WILRICH STORE registers your order reference and securely generates your WhatsApp chat link with the seller.
            </p>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowOrderModal(false);
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
                className="w-1/2 py-2 px-3 glass-button text-white rounded-xl text-xs font-semibold transition-all disabled:opacity-50 flex items-center justify-center"
              >
                {ordering ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    Reserving...
                  </>
                ) : (
                  'Confirm & Reserve'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Successful Order Creation Modal (Success State) */}
      {createdOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 page-transition">
          <div className="glass-panel-elevated rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
            {/* Ambient Success Glow */}
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Order Successfully Created
                </span>
                <h3 className="text-lg font-bold text-stone-900 mt-1">
                  Inventory Reserved for You
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
                <span className="text-stone-500">Item</span>
                <span className="font-semibold text-stone-900 text-right truncate max-w-[200px]">
                  {createdOrder.item_title_snapshot || account.title}
                </span>
              </div>
              <div className="flex justify-between py-1 border-t border-ice-200">
                <span className="text-stone-500">Total Price</span>
                <span className="font-bold text-stone-900">
                  {createdOrder.price_currency} {Number(createdOrder.total_price_amount).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1 border-t border-ice-200">
                <span className="text-stone-500">Status</span>
                <span className="font-semibold text-amber-700 capitalize">
                  {createdOrder.status} (Awaiting Payment via WhatsApp)
                </span>
              </div>
            </div>

            {/* Actions: Proceed to WhatsApp or View Order Details */}
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

      <footer className="glass-panel border-t border-ice-200 py-6 text-center text-xs text-stone-500 mt-12">
        <p>&copy; {new Date().getFullYear()} WILRICH STORE. Account Details.</p>
      </footer>
    </div>
  );
}
