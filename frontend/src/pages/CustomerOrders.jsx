import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import PriceDisplay from '../components/common/PriceDisplay';
import apiClient from '../api/client';
import { ShoppingBag, ArrowRight, Clock, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

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
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 mr-1" /> Pending WhatsApp Contact
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <Clock className="w-3 h-3 mr-1" /> Processing / In Progress
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

        {/* Content */}
        {loading ? (
          <div className="py-20 text-center text-sm text-stone-500 font-medium">Loading your orders...</div>
        ) : error ? (
          <div className="p-4 bg-torch-50 border border-torch-200 rounded-xl text-sm text-torch-800 mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 shrink-0 text-torch-600" />
            {error}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white border border-cream-300 rounded-xl p-12 text-center shadow-xs">
            <ShoppingBag className="w-12 h-12 text-stone-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-stone-900">No orders found</h3>
            <p className="text-sm text-stone-500 mt-1 mb-6">
              {statusFilter === 'all'
                ? "You haven't placed any orders yet."
                : `No orders currently matching status "${statusFilter}".`}
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                to="/app/accounts"
                className="px-4 py-2 bg-torch-500 text-white rounded text-xs font-semibold hover:bg-torch-600 shadow-xs transition-colors"
              >
                Browse CODM Accounts
              </Link>
              <Link
                to="/app/cp"
                className="px-4 py-2 border border-cream-300 bg-cream-200 text-stone-800 rounded text-xs font-semibold hover:bg-cream-300 transition-colors"
              >
                Browse CP Bundles
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-cream-300 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-cream-200 text-left text-sm">
                <thead className="bg-cream-100 text-stone-700 text-xs uppercase font-semibold">
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
                <tbody className="divide-y divide-cream-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-cream-50/75 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-torch-700 text-xs">
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
                          className="inline-flex items-center font-semibold text-torch-700 hover:text-torch-800 bg-cream-200 hover:bg-cream-300 px-3 py-1.5 rounded transition-colors"
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

      <footer className="bg-cream-50 border-t border-cream-300 py-6 text-center text-xs text-stone-500">
        <p>&copy; {new Date().getFullYear()} WILRICH STORE. Customer Orders.</p>
      </footer>
    </div>
  );
}
