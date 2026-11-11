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
    // Current date in YYYY-MM-DD
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Storefront Banner */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 mb-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200">
                Vendor Workspace
              </span>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-2">
                {profile?.store_name || user?.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2 font-mono">
                {profile?.store_slug && (
                  <span>Store Slug: <strong className="text-slate-700">@{profile.store_slug}</strong></span>
                )}
                {profile?.whatsapp_number && (
                  <span className="flex items-center text-emerald-700">
                    <Phone className="w-3.5 h-3.5 mr-1" /> WhatsApp: +{profile.whatsapp_number}
                  </span>
                )}
              </div>
            </div>

            {/* Date filter for daily sales */}
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="font-medium text-slate-600">Business Date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
            {error}
          </div>
        )}

        {/* Daily Sales & Revenue Aggregates */}
        {dashboardData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Today Completed Sales */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Daily Completed Sales
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {dashboardData.daily_sales.timezone}
                </span>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 mt-2">
                TZS {Number(dashboardData.daily_sales.total_sales_amount).toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                <strong>{dashboardData.daily_sales.completed_orders_count}</strong> orders completed on {dashboardData.daily_sales.date}
              </div>
            </div>

            {/* All Time Sales */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                All-Time Revenue
              </span>
              <div className="text-2xl font-extrabold text-slate-900 mt-2">
                TZS {Number(dashboardData.all_time_sales.total_sales_amount).toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                <strong>{dashboardData.all_time_sales.completed_orders_count}</strong> lifetime fulfilled orders
              </div>
            </div>

            {/* Inventory Status */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Inventory Stock
              </span>
              <div className="text-2xl font-extrabold text-slate-900 mt-2">
                {dashboardData.inventory.accounts_published} <span className="text-sm font-normal text-slate-500">Live Accounts</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {dashboardData.inventory.accounts_sold} sold &bull; {dashboardData.inventory.cp_bundles_total} CP bundles
              </div>
            </div>

            {/* Active Tickets */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Active Disputes / Tickets
              </span>
              <div className="text-2xl font-extrabold text-amber-600 mt-2">
                {dashboardData.tickets.open + dashboardData.tickets.in_progress} <span className="text-sm font-normal text-slate-500">Active</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {dashboardData.tickets.resolved} resolved &bull; {dashboardData.tickets.closed} closed
              </div>
            </div>
          </div>
        )}

        {/* Quick Links & Management Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <Link
            to="/vendor/accounts"
            className="bg-white border border-slate-200 rounded-lg p-5 hover:border-slate-400 transition-colors shadow-xs flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center text-slate-800">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Manage Accounts</h3>
                <p className="text-[11px] text-slate-500">Add, edit, or upload images</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </Link>

          <Link
            to="/vendor/cp"
            className="bg-white border border-slate-200 rounded-lg p-5 hover:border-slate-400 transition-colors shadow-xs flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">CP Pricing</h3>
                <p className="text-[11px] text-slate-500">Configure bundle packages</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </Link>

          <Link
            to="/vendor/orders"
            className="bg-white border border-slate-200 rounded-lg p-5 hover:border-slate-400 transition-colors shadow-xs flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Order Queue</h3>
                <p className="text-[11px] text-slate-500">
                  {dashboardData?.orders.pending || 0} pending contact
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>

        {/* Recent Orders Stream */}
        {dashboardData?.recent_orders?.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs mb-8">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Recent Orders Received
              </h2>
              <Link
                to="/vendor/orders"
                className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center"
              >
                View all orders <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {dashboardData.recent_orders.map((o) => (
                <div key={o.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-slate-900 mr-2">
                      {o.public_reference}
                    </span>
                    <span className="font-medium text-slate-700">
                      {o.item_title_snapshot}
                    </span>
                    <span className="text-slate-400 ml-2">
                      &bull; Customer: {o.customer?.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-bold text-slate-900">
                      {o.price_currency} {Number(o.total_price_amount).toLocaleString()}
                    </span>
                    <span className="capitalize px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-semibold">
                      {o.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timezone & Security Guarantee Banner */}
        <div className="border border-slate-200 bg-white rounded-lg p-6 text-xs text-slate-600">
          <div className="font-semibold text-slate-900 flex items-center mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600 mr-2" />
            Timezone-Safe Reporting Policy
          </div>
          All completed daily sales aggregations are calculated using the <code>Africa/Dar_es_Salaam</code> business timezone. Historical sales records remain permanent and immutable across all business periods.
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} WILRICH STORE. Vendor Management Workspace.</p>
      </footer>
    </div>
  );
}
