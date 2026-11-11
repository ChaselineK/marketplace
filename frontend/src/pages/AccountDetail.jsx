import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import PriceDisplay from '../components/common/PriceDisplay';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Gamepad2, Store, Phone, ShieldCheck, ArrowLeft, ArrowRight, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AccountDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [ordering, setOrdering] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderError, setOrderError] = useState('');

  useEffect(() => {
    setLoading(true);
    apiClient.get(`/listings/${id}`)
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

      const orderRef = res.data.data.public_reference;
      navigate(`/app/orders/${orderRef}`);
    } catch (err) {
      setOrderError(err.response?.data?.message || 'Failed to create order. Please check availability.');
    } finally {
      setOrdering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <div className="py-24 text-center text-sm text-slate-500">Loading account details...</div>
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <main className="max-w-md mx-auto px-4 py-16 text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Account Not Available</h2>
          <p className="text-sm text-slate-600 mb-6">{error || 'This listing has been sold or removed.'}</p>
          <Link
            to="/app/accounts"
            className="inline-flex items-center px-4 py-2 bg-slate-900 text-white rounded text-sm font-medium hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Accounts
          </Link>
        </main>
      </div>
    );
  }

  const formatPrice = (amount, currency = 'TZS') => {
    return `${currency} ${Number(amount).toLocaleString()}`;
  };

  const whatsappUrl = account.vendor?.whatsapp_number
    ? `https://wa.me/${account.vendor.whatsapp_number}?text=${encodeURIComponent(
        `Hello ${account.vendor.store_name}, I am interested in buying "${account.title}" listed for ${formatPrice(
          account.price_amount,
          account.price_currency
        )} on WILRICH STORE.`
      )}`
    : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/app/accounts"
            className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Account Listings
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Visuals & Description */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Image */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
              <div className="h-80 sm:h-96 bg-slate-900 flex items-center justify-center overflow-hidden">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt={account.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center p-8">
                    <Gamepad2 className="w-16 h-16 text-slate-700 mx-auto mb-3" />
                    <span className="text-sm font-medium text-slate-400">Verified CODM Account Asset</span>
                  </div>
                )}
              </div>

              {/* Thumbnails if multiple */}
              {account.images?.length > 1 && (
                <div className="p-4 border-t border-slate-100 flex items-center space-x-3 overflow-x-auto">
                  {account.images.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(img.url)}
                      className={`w-16 h-16 rounded border-2 overflow-hidden shrink-0 transition-all ${
                        selectedImage === img.url ? 'border-slate-900' : 'border-slate-200 opacity-60'
                      }`}
                    >
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description & Specifications */}
            <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
                Account Overview &amp; Specifications
              </h2>
              <div className="prose prose-sm text-slate-700 whitespace-pre-line leading-relaxed">
                {account.description}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 bg-slate-50 p-4 rounded-lg text-xs text-slate-600">
                <div className="font-semibold text-slate-900 mb-1 flex items-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 mr-1.5" />
                  Buyer Protection &amp; Transfer Process
                </div>
                Orders are coordinated through WILRICH STORE with immutable snapshots. After placing an order, you will be handed off to the vendor on WhatsApp to arrange safe credential transfer and verification.
              </div>
            </div>
          </div>

          {/* Right Column: Pricing & Vendor Card */}
          <div className="space-y-6">
            {/* Purchase Card */}
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
              <div className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 mb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
                Available in Stock
              </div>

              <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
                {account.title}
              </h1>

              <div className="my-6 pb-6 border-t border-b border-slate-100 pt-4">
                <div className="text-xs uppercase font-bold text-slate-400 mb-1">Authoritative Price</div>
                <PriceDisplay
                  amount={account.price_amount}
                  baseCurrency={account.price_currency}
                  size="large"
                />
              </div>

              {/* Order Placement Action */}
              <button
                onClick={() => setShowOrderModal(true)}
                className="w-full flex items-center justify-center px-4 py-3 rounded text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-xs mb-3"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Place Order &amp; Proceed to WhatsApp
              </button>

              <p className="text-center text-[11px] text-slate-500">
                Reserves this account and initiates a verified WhatsApp handoff.
              </p>
            </div>

            {/* Order Confirmation Modal */}
            {showOrderModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
                <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-900">Confirm Order Placement</h3>
                    <button
                      onClick={() => {
                        setShowOrderModal(false);
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

                  <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <div className="font-semibold text-slate-900 text-sm mb-1">{account.title}</div>
                    <div className="flex justify-between py-1 border-t border-slate-200">
                      <span>Vendor</span>
                      <span className="font-medium text-slate-900">{account.vendor?.store_name}</span>
                    </div>
                    <div className="flex justify-between py-1 border-t border-slate-200">
                      <span>Agreed Price</span>
                      <span className="font-bold text-slate-900">
                        {account.price_currency} {Number(account.price_amount).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    By confirming, WILRICH STORE registers your order reference and securely generates your WhatsApp chat link with the seller.
                  </p>

                  <div className="flex items-center space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowOrderModal(false);
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
                      {ordering ? 'Reserving...' : 'Confirm & Open'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Vendor Details Card */}
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
              <div className="text-xs uppercase font-bold text-slate-400 mb-3">Listed By</div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-sm">
                  {account.vendor?.store_name?.charAt(0) || 'V'}
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">{account.vendor?.store_name}</div>
                  <div className="text-xs font-mono text-slate-500">@{account.vendor?.store_slug}</div>
                </div>
              </div>

              {account.vendor?.store_slug && (
                <Link
                  to={`/app/vendors/${account.vendor.store_slug}`}
                  className="w-full inline-flex items-center justify-center px-3 py-2 border border-slate-200 rounded text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Store className="w-3.5 h-3.5 mr-1.5" /> Visit Vendor Storefront
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} WILRICH STORE. Account Details.</p>
      </footer>
    </div>
  );
}
