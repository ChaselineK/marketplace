import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import PriceDisplay from '../components/common/PriceDisplay';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import {
  Store,
  ShieldCheck,
  Package,
  ShoppingBag,
  Coins,
  ArrowRight,
  Phone,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  LifeBuoy,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function VendorPortal() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });

  const fetchDashboard = async (date) => {
    try {
      setLoading(true);
      const res = await apiClient.get('/vendor/dashboard', {
        params: { date: date || undefined },
      });
      setDashboardData(res.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load vendor dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard(selectedDate);
  }, [selectedDate]);

  const profile = user?.vendor_profile;

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Storefront Banner */}
        <div className="bg-white border border-cream-300 rounded-xl p-6 sm:p-8 mb-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-torch-700 bg-torch-50 px-2.5 py-1 rounded border border-torch-200">
                Vendor Workspace
              </span>
              <h1 className="text-2xl font-bold text-stone-900 tracking-tight mt-2.5">
                {profile?.store_name || user?.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 mt-2 font-mono">
                {profile?.store_slug && (
                  <span>Store Slug: <strong className="text-stone-800">@{profile.store_slug}</strong></span>
                )}
                {profile?.whatsapp_number && (
                  <span className="flex items-center text-torch-700 font-semibold">
                    <Phone className="w-3.5 h-3.5 mr-1" /> WhatsApp: +{profile.whatsapp_number}
                  </span>
                )}
              </div>
            </div>

            {/* Date filter for daily sales */}
            <div className="flex items-center space-x-2 bg-cream-100 border border-cream-300 rounded-lg p-2 text-xs">
              <Calendar className="w-4 h-4 text-torch-600" />
              <span className="font-semibold text-stone-700">Business Date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-white border border-cream-300 rounded px-2 py-1 text-stone-900 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-torch-500 focus:border-torch-500"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-torch-50 border border-torch-200 rounded-xl text-sm text-torch-800 mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 shrink-0 text-torch-600" />
            {error}
          </div>
        )}

        {/* Daily Sales & Revenue Aggregates */}
        {dashboardData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Today Completed Sales */}
            <div className="bg-white border border-cream-300 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                  Daily Completed Sales
                </span>
                <span className="text-[10px] font-mono text-stone-400">
                  {dashboardData.daily_sales.timezone}
                </span>
              </div>
              <div className="text-2xl font-extrabold text-stone-900 mt-2">
                TZS {Number(dashboardData.daily_sales.total_sales_amount).toLocaleString()}
              </div>
              <div className="text-xs text-stone-500 mt-1">
                <strong>{dashboardData.daily_sales.completed_orders_count}</strong> orders completed on {dashboardData.daily_sales.date}
              </div>
            </div>

            {/* All Time Sales */}
            <div className="bg-white border border-cream-300 rounded-xl p-5 shadow-xs">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1">
                All-Time Revenue
              </span>
              <div className="text-2xl font-extrabold text-stone-900 mt-2">
                TZS {Number(dashboardData.all_time_sales.total_sales_amount).toLocaleString()}
              </div>
              <div className="text-xs text-stone-500 mt-1">
                <strong>{dashboardData.all_time_sales.completed_orders_count}</strong> lifetime fulfilled orders
              </div>
            </div>

            {/* Inventory Status */}
            <div className="bg-white border border-cream-300 rounded-xl p-5 shadow-xs">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1">
                Inventory Stock
              </span>
              <div className="text-2xl font-extrabold text-stone-900 mt-2">
                {dashboardData.inventory.accounts_published} <span className="text-sm font-normal text-stone-500">Live Accounts</span>
              </div>
              <div className="text-xs text-stone-500 mt-1">
                {dashboardData.inventory.accounts_sold} sold &bull; {dashboardData.inventory.cp_bundles_total} CP bundles
              </div>
            </div>

            {/* Active Tickets */}
            <div className="bg-white border border-cream-300 rounded-xl p-5 shadow-xs">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1">
                Active Disputes / Tickets
              </span>
              <div className="text-2xl font-extrabold text-torch-700 mt-2">
                {dashboardData.tickets.open + dashboardData.tickets.in_progress} <span className="text-sm font-normal text-stone-500">Active</span>
              </div>
              <div className="text-xs text-stone-500 mt-1">
                {dashboardData.tickets.resolved} resolved &bull; {dashboardData.tickets.closed} closed
              </div>
            </div>
          </div>
        )}

        {/* Quick Links & Management Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <Link
            to="/vendor/accounts"
            className="group bg-white border border-cream-300 rounded-xl p-5 hover:border-torch-400 hover:shadow-sm transition-all flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-cream-200 flex items-center justify-center text-torch-600 group-hover:bg-torch-500 group-hover:text-white transition-colors">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900 group-hover:text-torch-600 transition-colors">
                  Manage Accounts
                </h3>
                <p className="text-[11px] text-stone-500">Add, edit, or upload images</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-torch-600 group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link
            to="/vendor/cp"
            className="group bg-white border border-cream-300 rounded-xl p-5 hover:border-torch-400 hover:shadow-sm transition-all flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-cream-200 flex items-center justify-center text-torch-600 group-hover:bg-torch-500 group-hover:text-white transition-colors">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900 group-hover:text-torch-600 transition-colors">
                  CP Pricing
                </h3>
                <p className="text-[11px] text-stone-500">Configure bundle packages</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-torch-600 group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link
            to="/vendor/orders"
            className="group bg-white border border-cream-300 rounded-xl p-5 hover:border-torch-400 hover:shadow-sm transition-all flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-cream-200 flex items-center justify-center text-torch-600 group-hover:bg-torch-500 group-hover:text-white transition-colors">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900 group-hover:text-torch-600 transition-colors">
                  Order Queue
                </h3>
                <p className="text-[11px] text-stone-500">
                  {dashboardData?.orders.pending || 0} pending contact
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-torch-600 group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>

        {/* Recent Orders Stream */}
        {dashboardData?.recent_orders?.length > 0 && (
          <div className="bg-white border border-cream-300 rounded-xl p-6 shadow-xs mb-8">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-cream-200">
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                Recent Orders Received
              </h2>
              <Link
                to="/vendor/orders"
                className="text-xs font-semibold text-torch-700 hover:text-torch-800 flex items-center"
              >
                View all orders <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            <div className="divide-y divide-cream-100">
              {dashboardData.recent_orders.map((o) => (
                <div key={o.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-torch-700 mr-2">
                      {o.public_reference}
                    </span>
                    <span className="font-medium text-stone-800">
                      {o.item_title_snapshot}
                    </span>
                    <span className="text-stone-400 ml-2">
                      &bull; Customer: {o.customer?.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-bold text-stone-900">
                      {o.price_currency} {Number(o.total_price_amount).toLocaleString()}
                    </span>
                    <span className="capitalize px-2 py-0.5 rounded bg-cream-200 text-stone-800 text-[11px] font-semibold border border-cream-300">
                      {o.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timezone & Security Guarantee Banner */}
        <div className="border border-cream-300 bg-white rounded-xl p-6 text-xs text-stone-600 shadow-xs">
          <div className="font-semibold text-stone-900 flex items-center mb-1">
            <ShieldCheck className="w-4 h-4 text-torch-600 mr-2" />
            Timezone-Safe Reporting Policy
          </div>
          All completed daily sales aggregations are calculated using the <code>Africa/Dar_es_Salaam</code> business timezone. Historical sales records remain permanent and immutable across all business periods.
        </div>
      </main>

      <footer className="bg-cream-50 border-t border-cream-300 py-6 text-center text-xs text-stone-500">
        <p>&copy; {new Date().getFullYear()} WILRICH STORE. Vendor Management Workspace.</p>
      </footer>
    </div>
  );
}
