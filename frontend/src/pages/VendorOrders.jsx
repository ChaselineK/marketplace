import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import PriceDisplay from '../components/common/PriceDisplay';
import apiClient from '../api/client';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Check,
  Ban,
  Play,
  Info,
  Loader2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

export default function VendorOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/vendor/orders');
      setOrders(res.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load received orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, targetStatus) => {
    let confirmMsg = `Are you sure you want to transition this order to "${targetStatus.toUpperCase()}"?`;
    if (targetStatus === 'completed') {
      confirmMsg += '\n\nNote: If this is an Account listing, it will automatically be marked as SOLD in public search.';
    }

    if (!window.confirm(confirmMsg)) {
      return;
    }

    try {
      setActionLoading(orderId);
      setActionError(null);
      const res = await apiClient.patch(`/vendor/orders/${orderId}/status`, {
        status: targetStatus,
      });

      const updated = res.data.data;
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? updated : o))
      );

      const statusLabels = {
        processing: 'Payment Received / In Progress',
        completed: 'Paid, Fulfilled & Marked Sold',
        cancelled: 'Cancelled',
      };

      setSuccessMessage(
        `Order ${updated.public_reference} updated to "${statusLabels[targetStatus] || targetStatus}".`
      );
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setActionError({
        orderId,
        message: err.response?.data?.message || 'Failed to update order status. Please retry.',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 mr-1" /> Pending Contact
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-quantum-50 text-quantum-800 border border-quantum-200">
            <Clock className="w-3 h-3 mr-1 text-quantum-600" /> In Progress
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Fulfilled (Sold)
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200">
            <XCircle className="w-3 h-3 mr-1" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-ice-100 text-stone-700">
            {status}
          </span>
        );
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'all') return true;
    return o.status === statusFilter;
  });

  return (
    <div className="min-h-screen flex flex-col justify-between page-transition">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Header */}
        <div className="glass-panel-elevated rounded-2xl p-6 sm:p-8 mb-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
                Customer Orders Received
              </h1>
              <p className="text-sm text-stone-600 mt-1">
                Fulfill customer orders, verify WhatsApp payments, and update fulfillment progress.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center space-x-1.5 bg-white/70 p-1.5 rounded-xl border border-ice-200 text-xs font-medium backdrop-blur-xs">
              {['all', 'pending', 'processing', 'completed', 'cancelled'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                    statusFilter === tab
                      ? 'glass-button font-semibold shadow-xs'
                      : 'text-stone-700 hover:text-quantum-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Success Banner (Success State) */}
        {successMessage && (
          <div className="p-4 bg-emerald-50/90 border border-emerald-200 rounded-2xl text-xs font-semibold text-emerald-800 mb-6 flex items-center shadow-xs page-transition">
            <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Action Error Banner (Error State) */}
        {actionError && (
          <div className="p-4 bg-red-50/90 border border-red-200 rounded-2xl text-xs text-red-800 mb-6 flex items-center justify-between shadow-xs page-transition">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{actionError.message}</span>
            </div>
            <button
              onClick={() => setActionError(null)}
              className="text-red-700 hover:text-red-900 font-bold ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Invariant Policy Notice */}
        <div className="mb-6 p-4 glass-panel rounded-2xl text-xs text-stone-700 flex items-start space-x-2.5">
          <Info className="w-4 h-4 text-quantum-600 shrink-0 mt-0.5" />
          <span>
            <strong>Automatic Inventory Sync:</strong> Transitioning an order to <strong>Paid &amp; Completed</strong> atomically marks the listed account as <code>sold</code> and tallies it in platform sales reports.
          </span>
        </div>

        {/* Content (Loading, Empty, and Populated States) */}
        {loading ? (
          /* Loading State */
          <div className="py-20 text-center text-sm font-medium page-transition">
            <div className="glass-panel p-8 rounded-2xl max-w-sm mx-auto flex flex-col items-center">
              <Loader2 className="w-8 h-8 animate-spin text-quantum-600 mb-3" />
              <p className="text-stone-700">Loading received orders...</p>
            </div>
          </div>
        ) : error ? (
          /* General Error State */
          <div className="glass-panel p-6 rounded-2xl text-sm text-red-800 border-red-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchOrders}
              className="px-3 py-1.5 glass-button text-xs rounded-lg"
            >
              Retry
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          /* Empty State */
          <div className="glass-panel-elevated rounded-2xl p-12 text-center max-w-md mx-auto shadow-xs page-transition">
            <ShoppingBag className="w-12 h-12 text-quantum-500 mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-stone-900">No customer orders found</h3>
            <p className="text-sm text-stone-500 mt-1 mb-4">
              {statusFilter === 'all'
                ? "You haven't received any customer orders yet."
                : `No orders currently match the "${statusFilter}" filter.`}
            </p>
            {statusFilter !== 'all' && (
              <button
                onClick={() => setStatusFilter('all')}
                className="px-4 py-2 glass-button text-xs font-semibold rounded-lg"
              >
                Show All Orders
              </button>
            )}
          </div>
        ) : (
          <div className="glass-panel rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-ice-200 text-left text-sm">
                <thead className="bg-ice-50/70 text-stone-700 text-xs uppercase font-semibold">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">Reference</th>
                    <th scope="col" className="px-6 py-3.5">Customer</th>
                    <th scope="col" className="px-6 py-3.5">Item Snapshot</th>
                    <th scope="col" className="px-6 py-3.5">Agreed Price</th>
                    <th scope="col" className="px-6 py-3.5">Status</th>
                    <th scope="col" className="px-6 py-3.5">Ordered At</th>
                    <th scope="col" className="px-6 py-3.5 text-right">Fulfillment Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ice-100">
                  {filteredOrders.map((order) => {
                    const isRowBusy = actionLoading === order.id;

                    return (
                      <tr key={order.id} className="hover:bg-white/60 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono font-bold text-quantum-700 text-xs">
                            {order.public_reference}
                          </span>
                          {order.whatsapp_opened_at && (
                            <div className="text-[10px] text-emerald-700 font-medium mt-0.5">
                              Customer clicked WhatsApp
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-stone-900 text-xs sm:text-sm">
                            {order.customer?.name || 'Customer'}
                          </div>
                          <div className="text-[11px] font-mono text-stone-500">
                            {order.customer?.email}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-stone-900 text-xs">
                            {order.item_title_snapshot}
                          </div>
                          <div className="text-[11px] text-stone-500">
                            Qty: {order.quantity} &bull; {order.item_type === 'account' ? 'CODM Account' : 'CP Currency'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <PriceDisplay
                            amount={order.total_price_amount}
                            baseCurrency={order.price_currency}
                            size="small"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-stone-500 font-mono">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                          <div className="flex items-center justify-end space-x-2">
                            {/* Actions for Pending State */}
                            {order.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(order.id, 'processing')}
                                  disabled={isRowBusy}
                                  className="inline-flex items-center px-3 py-1.5 glass-button text-white rounded-lg font-medium text-xs shadow-xs disabled:opacity-50"
                                  title="Mark payment acknowledged and begin fulfillment"
                                >
                                  {isRowBusy ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                                  ) : (
                                    <Play className="w-3 h-3 mr-1" />
                                  )}
                                  Mark Paid &amp; Process
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                                  disabled={isRowBusy}
                                  className="inline-flex items-center px-2.5 py-1.5 border border-stone-200 text-stone-600 hover:bg-stone-50 rounded-lg font-medium text-xs disabled:opacity-50 transition-colors"
                                >
                                  <Ban className="w-3 h-3 mr-1" /> Cancel
                                </button>
                              </>
                            )}

                            {/* Actions for Processing State */}
                            {order.status === 'processing' && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(order.id, 'completed')}
                                  disabled={isRowBusy}
                                  className="inline-flex items-center px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-xs shadow-xs transition-colors disabled:opacity-50"
                                  title="Mark order fulfilled and mark account sold"
                                >
                                  {isRowBusy ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                                  ) : (
                                    <Check className="w-3 h-3 mr-1" />
                                  )}
                                  Mark Fulfilled &amp; Sold
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                                  disabled={isRowBusy}
                                  className="inline-flex items-center px-2.5 py-1.5 border border-stone-200 text-stone-600 hover:bg-stone-50 rounded-lg font-medium text-xs disabled:opacity-50 transition-colors"
                                >
                                  <Ban className="w-3 h-3 mr-1" /> Cancel
                                </button>
                              </>
                            )}

                            {/* Completed Status */}
                            {order.status === 'completed' && (
                              <span className="inline-flex items-center text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Fulfilled &amp; Sold
                              </span>
                            )}

                            {/* Cancelled Status */}
                            {order.status === 'cancelled' && (
                              <span className="text-[11px] font-semibold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200">
                                Cancelled
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <footer className="glass-panel border-t border-ice-200 py-6 text-center text-xs text-stone-500 mt-12">
        <p>&copy; {new Date().getFullYear()} WILRICH STORE. Vendor Orders Management.</p>
      </footer>
    </div>
  );
}
