import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import PriceDisplay from '../components/common/PriceDisplay';
import apiClient from '../api/client';
import { ShoppingBag, ArrowRight, Clock, CheckCircle2, AlertCircle, XCircle, Loader2 } from 'lucide-react';

export default function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/orders');
      setOrders(res.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 mr-1" /> Pending WhatsApp Contact
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-quantum-50 text-quantum-800 border border-quantum-200">
            <Clock className="w-3 h-3 mr-1 text-quantum-600" /> Processing / In Progress
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Completed (Sold)
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
              <span className="text-xs font-semibold uppercase tracking-wider text-quantum-700 bg-quantum-50 px-2.5 py-1 rounded-full border border-quantum-200">
                Customer Account
              </span>
              <h1 className="text-2xl font-bold text-stone-900 tracking-tight mt-2.5">
                My Orders
              </h1>
              <p className="text-sm text-stone-600 mt-1">
                Track your active purchases, verify order references, and continue WhatsApp handoffs.
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

        {/* Content (Loading, Error, and Populated/Empty States) */}
        {loading ? (
          <div className="py-20 text-center text-sm font-medium page-transition">
            <div className="glass-panel p-8 rounded-2xl max-w-sm mx-auto flex flex-col items-center">
              <Loader2 className="w-8 h-8 animate-spin text-quantum-600 mb-3" />
              <p className="text-stone-700">Loading your orders...</p>
            </div>
          </div>
        ) : error ? (
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
          <div className="glass-panel-elevated rounded-2xl p-12 text-center max-w-md mx-auto shadow-xs page-transition">
            <ShoppingBag className="w-12 h-12 text-quantum-500 mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-stone-900">No orders found</h3>
            <p className="text-sm text-stone-500 mt-1 mb-6">
              {statusFilter === 'all'
                ? "You haven't placed any orders yet."
                : `No orders currently matching status "${statusFilter}".`}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link
                to="/app/accounts"
                className="px-4 py-2.5 glass-button text-xs font-semibold rounded-xl"
              >
                Browse CODM Accounts
              </Link>
              <Link
                to="/app/cp"
                className="px-4 py-2.5 border border-ice-300 bg-white/80 hover:bg-white text-stone-800 rounded-xl text-xs font-semibold transition-colors"
              >
                Browse CP Bundles
              </Link>
            </div>
          </div>
        ) : (
          <div className="glass-panel rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-ice-200 text-left text-sm">
                <thead className="bg-ice-50/70 text-stone-700 text-xs uppercase font-semibold">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">Order Reference</th>
                    <th scope="col" className="px-6 py-3.5">Item Details</th>
                    <th scope="col" className="px-6 py-3.5">Vendor</th>
                    <th scope="col" className="px-6 py-3.5">Amount</th>
                    <th scope="col" className="px-6 py-3.5">Status</th>
                    <th scope="col" className="px-6 py-3.5">Placed On</th>
                    <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ice-100">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/60 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-quantum-700 text-xs">
                          {order.public_reference}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-stone-900 text-xs sm:text-sm">
                          {order.item_title_snapshot}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          {order.item_type === 'account' ? 'Unique CODM Account' : `CP Bundle (${order.quantity}x)`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs font-medium text-stone-900">
                          {order.vendor?.store_name || 'Vendor'}
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
                        <Link
                          to={`/app/orders/${order.public_reference}`}
                          className="inline-flex items-center font-semibold text-quantum-700 hover:text-quantum-900 bg-quantum-50 hover:bg-quantum-100 px-3 py-1.5 rounded-lg border border-quantum-200 transition-colors"
                        >
                          View Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <footer className="glass-panel border-t border-ice-200 py-6 text-center text-xs text-stone-500 mt-12">
        <p>&copy; {new Date().getFullYear()} WILRICH STORE. Customer Orders.</p>
      </footer>
    </div>
  );
}
