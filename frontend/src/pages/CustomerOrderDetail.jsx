import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import PriceDisplay from '../components/common/PriceDisplay';
import apiClient from '../api/client';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
  ArrowLeft,
  Store,
  ShieldCheck,
  Check,
  Copy,
  Loader2,
  ExternalLink,
} from 'lucide-react';

export default function CustomerOrderDetail() {
  const { reference } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');
  const [copiedRef, setCopiedRef] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/orders/${reference}`);
      setOrder(res.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load order.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [reference]);

  const copyReference = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.public_reference);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2500);
  };

  const handleWhatsappOpen = async () => {
    if (!order?.whatsapp_handoff_url) return;

    try {
      await apiClient.post(`/orders/${reference}/whatsapp-opened`);
    } catch (err) {
      console.warn('Failed to record WhatsApp handoff event:', err);
    }

    window.open(order.whatsapp_handoff_url, '_blank', 'noopener,noreferrer');
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return;
    }

    try {
      setCancelling(true);
      setActionError('');
      const res = await apiClient.post(`/orders/${reference}/cancel`);
      setOrder(res.data.data);
      setActionSuccess('Order has been cancelled successfully.');
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto py-24 text-center page-transition">
          <div className="glass-panel p-8 rounded-2xl flex flex-col items-center">
            <Loader2 className="w-8 h-8 animate-spin text-quantum-600 mb-3" />
            <p className="text-sm font-semibold text-quantum-900">Loading order details...</p>
          </div>
        </div>
        <footer className="py-6 text-center text-xs text-stone-500">
          &copy; {new Date().getFullYear()} WILRICH STORE
        </footer>
      </div>
    );
  }

  // Empty / Not Found State
  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col justify-between">
        <Navbar />
        <main className="max-w-md mx-auto px-4 py-16 text-center page-transition">
          <div className="glass-panel-elevated p-8 rounded-2xl">
            <AlertCircle className="w-12 h-12 text-quantum-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-stone-900 mb-2">Order Not Found</h2>
            <p className="text-sm text-stone-600 mb-6">{error || 'This order does not exist or you do not have permission to view it.'}</p>
            <Link
              to="/app/orders"
              className="inline-flex items-center px-4 py-2 glass-button text-white rounded-lg text-sm font-semibold shadow-xs"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to My Orders
            </Link>
          </div>
        </main>
        <footer className="py-6 text-center text-xs text-stone-500">
          &copy; {new Date().getFullYear()} WILRICH STORE
        </footer>
      </div>
    );
  }

  const renderStatusBanner = () => {
    switch (order.status) {
      case 'pending':
        return (
          <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-start space-x-3 mb-6 shadow-xs">
            <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-amber-900">Order Initiated — Pending WhatsApp Contact</h3>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                Your order is registered with reference <strong>{order.public_reference}</strong>. Click "Continue on WhatsApp" below to message the vendor and arrange transaction and credential verification.
              </p>
            </div>
          </div>
        );
      case 'processing':
        return (
          <div className="bg-quantum-50/90 border border-quantum-200 rounded-2xl p-4 sm:p-5 flex items-start space-x-3 mb-6 shadow-xs">
            <Clock className="w-5 h-5 text-quantum-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-quantum-900">Payment Acknowledged — Order In Progress</h3>
              <p className="text-xs text-quantum-800 mt-1 leading-relaxed">
                The vendor is actively processing your order and preparing asset credentials. Keep your WhatsApp chat open for live updates and transfer verification.
              </p>
            </div>
          </div>
        );
      case 'completed':
        return (
          <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex items-start space-x-3 mb-6 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-emerald-900">Order Completed &amp; Sold</h3>
              <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                This transaction was confirmed and finalized on {order.completed_at ? new Date(order.completed_at).toLocaleString() : 'recently'}. Thank you for trading through WILRICH STORE.
              </p>
            </div>
          </div>
        );
      case 'cancelled':
        return (
          <div className="bg-stone-100 border border-stone-200 rounded-2xl p-4 sm:p-5 flex items-start space-x-3 mb-6 shadow-xs">
            <XCircle className="w-5 h-5 text-stone-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-stone-900">Order Cancelled</h3>
              <p className="text-xs text-stone-700 mt-1 leading-relaxed">
                This order was cancelled on {order.cancelled_at ? new Date(order.cancelled_at).toLocaleString() : 'recently'}. The inventory reservation has been released.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between page-transition">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/app/orders"
            className="inline-flex items-center text-xs font-semibold text-stone-600 hover:text-quantum-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to My Orders
          </Link>

          <span className="text-xs font-mono text-stone-500">
            Created: {new Date(order.created_at).toLocaleString()}
          </span>
        </div>

        {/* Success Alert */}
        {actionSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-semibold text-emerald-800 mb-6 flex items-center shadow-xs page-transition">
            <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600 shrink-0" />
            {actionSuccess}
          </div>
        )}

        {/* Error Alert */}
        {actionError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs font-semibold text-red-800 mb-6 flex items-center shadow-xs page-transition">
            <AlertCircle className="w-4 h-4 mr-2 text-red-600 shrink-0" />
            {actionError}
          </div>
        )}

        {/* Status Banner */}
        {renderStatusBanner()}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Order Snapshots & Handoff Guide */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items Card */}
            <div className="glass-panel rounded-2xl p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-ice-200">
                <div>
                  <div className="text-xs uppercase font-bold text-stone-400">Order Reference</div>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="text-lg font-mono font-bold text-quantum-700">
                      {order.public_reference}
                    </span>
                    <button
                      onClick={copyReference}
                      className="p-1 hover:bg-quantum-50 text-stone-400 hover:text-quantum-600 rounded transition-colors"
                      title="Copy Reference"
                    >
                      {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-ice-100 text-stone-800 border border-ice-300">
                    {order.item_type === 'account' ? 'CODM Account' : 'CP In-Game Currency'}
                  </span>
                </div>
              </div>

              <div className="py-6">
                <h2 className="text-base font-bold text-stone-900 mb-2">
                  {order.item_title_snapshot}
                </h2>
                {order.item_description_snapshot && (
                  <p className="text-xs text-stone-600 whitespace-pre-line leading-relaxed bg-ice-50/70 p-3.5 rounded-xl border border-ice-200">
                    {order.item_description_snapshot}
                  </p>
                )}
              </div>

              {/* Price Calculation Table */}
              <div className="pt-4 border-t border-ice-200 space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Unit Snapshot Price</span>
                  <span className="font-semibold text-stone-900">
                    {order.price_currency} {Number(order.unit_price_amount).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Quantity</span>
                  <span className="font-semibold text-stone-900">{order.quantity}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-stone-900 pt-3 border-t border-ice-200">
                  <span>Total Authoritative Price</span>
                  <PriceDisplay
                    amount={order.total_price_amount}
                    baseCurrency={order.price_currency}
                    size="normal"
                  />
                </div>
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="glass-panel rounded-2xl p-6 shadow-xs">
              <h3 className="text-sm font-bold text-stone-900 mb-4 flex items-center">
                <ShieldCheck className="w-4 h-4 text-quantum-600 mr-2" />
                Next Steps for Fulfilling This Order
              </h3>

              <ol className="space-y-4 text-xs text-stone-600 list-decimal list-inside">
                <li className="leading-relaxed">
                  <strong>Click "Continue on WhatsApp":</strong> A secure chat with the verified seller will open with your order reference pre-populated.
                </li>
                <li className="leading-relaxed">
                  <strong>Verify Order Details:</strong> Confirm the agreed price and account/CP bundle credentials with the vendor.
                </li>
                <li className="leading-relaxed">
                  <strong>Safe Inspection:</strong> For accounts, verify login credentials and bind your phone/email immediately before confirming completion.
                </li>
                <li className="leading-relaxed">
                  <strong>Support &amp; Disputes:</strong> If any discrepancies arise, contact support with reference <code>{order.public_reference}</code>.
                </li>
              </ol>
            </div>
          </div>

          {/* Right Column: Actions & Vendor Card */}
          <div className="space-y-6">
            {/* Primary Action Card */}
            <div className="glass-panel rounded-2xl p-6 shadow-xs">
              <h3 className="text-xs uppercase font-bold text-stone-400 mb-4">Handoff Actions</h3>

              {order.status !== 'cancelled' && order.whatsapp_handoff_url ? (
                <button
                  onClick={handleWhatsappOpen}
                  className="w-full flex items-center justify-center px-4 py-3 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-md mb-3"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Continue on WhatsApp
                </button>
              ) : null}

              {order.whatsapp_opened_at && (
                <p className="text-[11px] text-center text-stone-500 mb-3">
                  WhatsApp opened on {new Date(order.whatsapp_opened_at).toLocaleTimeString()}
                </p>
              )}

              {/* Cancel Button (only allowed if pending) */}
              {order.status === 'pending' && (
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="w-full py-2.5 px-3 border border-red-200 text-red-700 hover:bg-red-50 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {cancelling ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      Cancelling...
                    </>
                  ) : (
                    'Cancel Order'
                  )}
                </button>
              )}
            </div>

            {/* Vendor Profile Card */}
            <div className="glass-panel rounded-2xl p-6 shadow-xs">
              <div className="text-xs uppercase font-bold text-stone-400 mb-3">Assigned Vendor</div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl glass-button font-bold flex items-center justify-center text-sm shadow-xs">
                  {order.vendor?.store_name?.charAt(0) || 'V'}
                </div>
                <div>
                  <div className="font-bold text-stone-900 text-sm">
                    {order.vendor?.store_name || order.vendor?.name}
                  </div>
                  <div className="text-xs font-mono text-quantum-700">
                    {order.vendor?.whatsapp_number ? `+${order.vendor.whatsapp_number}` : 'WhatsApp Verified'}
                  </div>
                </div>
              </div>

              {order.vendor?.store_slug && (
                <Link
                  to={`/app/vendors/${order.vendor.store_slug}`}
                  className="w-full inline-flex items-center justify-center px-3 py-2 border border-ice-300 rounded-xl text-xs font-semibold text-stone-800 bg-white/80 hover:bg-white transition-colors"
                >
                  <Store className="w-3.5 h-3.5 mr-1.5 text-quantum-600" /> View Vendor Storefront
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="glass-panel border-t border-ice-200 py-6 text-center text-xs text-stone-500 mt-12">
        <p>&copy; {new Date().getFullYear()} WILRICH STORE. Order Details.</p>
      </footer>
    </div>
  );
}
