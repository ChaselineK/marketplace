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
  MessageSquare,
  ChevronDown,
  Check,
  Ban,
  Play,
  Info,
} from 'lucide-react';

export default function VendorOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);
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
    let confirmMsg = `Are you sure you want to mark this order as ${targetStatus.toUpperCase()}?`;
    if (targetStatus === 'completed') {
      confirmMsg += '\n\nNote: If this is an Account listing, it will automatically be marked as SOLD in your inventory.';
    }

    if (!window.confirm(confirmMsg)) {
      return;
    }

    try {
      setActionLoading(orderId);
      const res = await apiClient.patch(`/vendor/orders/${orderId}/status`, {
        status: targetStatus,
      });

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? res.data.data : o))
      );
      setSuccessMessage(`Order updated to ${targetStatus} successfully.`);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status.');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 mr-1" /> Pending Contact
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <Clock className="w-3 h-3 mr-1" /> In Progress
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-cream-200 text-stone-700 border border-cream-300">
            <XCircle className="w-3 h-3 mr-1" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-cream-200 text-stone-700">
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
    <div className="min-h-screen bg-cream-100 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Header */}
        <div className="bg-white border border-cream-300 rounded-xl p-6 mb-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-torch-700 bg-torch-50 px-2.5 py-1 rounded border border-torch-200">
                Vendor Workspace
              </span>
              <h1 className="text-2xl font-bold text-stone-900 tracking-tight mt-2.5">
                Customer Orders Received
              </h1>
              <p className="text-sm text-stone-600 mt-1">
                Fulfill customer orders, track payments on WhatsApp, and update fulfillment progress.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center space-x-1.5 bg-cream-200 p-1 rounded-lg border border-cream-300 text-xs font-medium">
              {['all', 'pending', 'processing', 'completed', 'cancelled'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1.5 rounded capitalize transition-colors ${
                    statusFilter === tab
                      ? 'bg-torch-500 text-white shadow-xs font-semibold'
                      : 'text-stone-700 hover:text-torch-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Success / Alert Banner */}
        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 mb-6 flex items-center">
            <Check className="w-4 h-4 mr-2" />
            {successMessage}
          </div>
        )}

        {/* Invariant Policy Notice */}
        <div className="mb-6 p-4 bg-cream-200 border border-cream-300 rounded-xl text-xs text-stone-700 flex items-start space-x-2">
          <Info className="w-4 h-4 text-torch-600 shrink-0 mt-0.5" />
          <span>
            <strong>Automatic Inventory Sync:</strong> Transitioning an account order to <strong>Completed</strong> will atomically transition the listed CODM account to <code>sold</code> status, immediately removing it from public search.
          </span>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20 text-center text-sm text-stone-500 font-medium">Loading received orders...</div>
        ) : error ? (
          <div className="p-4 bg-torch-50 border border-torch-200 rounded-xl text-sm text-torch-800 mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 shrink-0 text-torch-600" />
            {error}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white border border-cream-300 rounded-xl p-12 text-center shadow-xs">
            <ShoppingBag className="w-12 h-12 text-stone-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-stone-900">No customer orders</h3>
            <p className="text-sm text-stone-500 mt-1">
              {statusFilter === 'all'
                ? "You haven't received any customer orders yet."
                : `No orders currently in "${statusFilter}" status.`}
            </p>
          </div>
        ) : (
          <div className="bg-white border border-cream-300 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-cream-200 text-left text-sm">
                <thead className="bg-cream-100 text-stone-700 text-xs uppercase font-semibold">
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
                <tbody className="divide-y divide-cream-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-cream-50/75 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-torch-700 text-xs">
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
                          {order.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(order.id, 'processing')}
                                disabled={actionLoading === order.id}
                                className="inline-flex items-center px-2.5 py-1.5 bg-torch-500 hover:bg-torch-600 text-white rounded font-medium text-xs transition-colors shadow-xs disabled:opacity-50"
                              >
                                <Play className="w-3 h-3 mr-1" /> Process
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                                disabled={actionLoading === order.id}
                                className="inline-flex items-center px-2.5 py-1.5 border border-torch-200 text-torch-700 hover:bg-torch-50 rounded font-medium text-xs transition-colors disabled:opacity-50"
                              >
                                <Ban className="w-3 h-3 mr-1" /> Cancel
                              </button>
                            </>
                          )}

                          {order.status === 'processing' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(order.id, 'completed')}
                                disabled={actionLoading === order.id}
                                className="inline-flex items-center px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-medium text-xs transition-colors shadow-xs disabled:opacity-50"
                              >
                                <Check className="w-3 h-3 mr-1" /> Complete Order
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                                disabled={actionLoading === order.id}
                                className="inline-flex items-center px-2.5 py-1.5 border border-torch-200 text-torch-700 hover:bg-torch-50 rounded font-medium text-xs transition-colors disabled:opacity-50"
                              >
                                <Ban className="w-3 h-3 mr-1" /> Cancel
                              </button>
                            </>
                          )}

                          {order.status === 'completed' && (
                            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                              Fulfilled
                            </span>
                          )}

                          {order.status === 'cancelled' && (
                            <span className="text-[11px] font-semibold text-stone-500 bg-cream-200 px-2 py-1 rounded border border-cream-300">
                              Cancelled
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-cream-50 border-t border-cream-300 py-6 text-center text-xs text-stone-500">
        <p>&copy; {new Date().getFullYear()} WILRICH STORE. Vendor Orders Management.</p>
      </footer>
    </div>
  );
}
