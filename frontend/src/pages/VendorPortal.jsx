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
  Loader2,
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
    <div className="min-h-screen flex flex-col justify-between page-transition">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Storefront Banner */}
        <div className="glass-panel-elevated rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
                {profile?.store_name || user?.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 mt-2 font-mono">
                {profile?.store_slug && (
                  <span>Store Slug: <strong className="text-stone-800">@{profile.store_slug}</strong></span>
                )}
                {profile?.whatsapp_number && (
                  <span className="flex items-center text-quantum-700 font-semibold">
                    <Phone className="w-3.5 h-3.5 mr-1" /> WhatsApp: +{profile.whatsapp_number}
                  </span>
                )}
              </div>
            </div>

            {/* Date filter for daily sales */}
            <div className="flex items-center space-x-2 glass-panel rounded-xl p-2 text-xs">
              <Calendar className="w-4 h-4 text-quantum-600" />
              <span className="font-semibold text-stone-700">Business Date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-white/80 border border-ice-300 rounded-lg px-2.5 py-1 text-stone-900 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-quantum-500 focus:border-quantum-500"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 flex items-center shadow-xs">
            <AlertCircle className="w-5 h-5 mr-2 shrink-0 text-red-600" />
            {error}
          </div>
        )}

        {/* Dashboard Metrics (Daily Sales & Lifetime Totals) */}
        {loading ? (
          <div className="py-20 text-center text-sm font-medium">
            <div className="glass-panel p-8 rounded-2xl max-w-sm mx-auto flex flex-col items-center">
              <Loader2 className="w-8 h-8 animate-spin text-quantum-600 mb-3" />
              <p className="text-stone-700">Loading performance data...</p>
            </div>
          </div>
        ) : dashboardData ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-panel rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">
                <span>Daily Sales</span>
                <span className="text-[10px] font-mono text-quantum-700">{dashboardData.daily_sales.timezone}</span>
              </div>
              <div className="text-2xl font-extrabold text-stone-900 mt-2">
                TZS {Number(dashboardData.daily_sales.total_sales_amount).toLocaleString()}
              </div>
              <div className="text-xs text-stone-500 mt-1">
                <strong>{dashboardData.daily_sales.completed_orders_count}</strong> fulfilled orders on {dashboardData.daily_sales.date}
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-5 shadow-xs">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1">
                All-Time Sales Volume
              </span>
              <div className="text-2xl font-extrabold text-stone-900 mt-2">
                TZS {Number(dashboardData.all_time_sales.total_sales_amount).toLocaleString()}
              </div>
              <div className="text-xs text-stone-500 mt-1">
                <strong>{dashboardData.all_time_sales.completed_orders_count}</strong> lifetime fulfilled transactions
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-5 shadow-xs">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1">
                Live Inventory Status
              </span>
              <div className="text-2xl font-extrabold text-stone-900 mt-2">
                {dashboardData.inventory_counts.active_accounts} <span className="text-sm font-normal text-stone-500">Live Accounts</span>
              </div>
              <div className="text-xs text-stone-500 mt-1">
                {dashboardData.inventory_counts.sold_accounts} sold
                {user?.role !== 'super_admin' && (
                  <span> &bull; {dashboardData.inventory_counts.total_cp_bundles} CP bundles configured</span>
                )}
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-5 shadow-xs">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1">
                Orders &amp; Disputes
              </span>
              <div className="text-2xl font-extrabold text-stone-900 mt-2">
                {dashboardData.order_counts.pending_orders} <span className="text-sm font-normal text-stone-500">Pending Orders</span>
              </div>
              <div className="text-xs text-stone-500 mt-1">
                {dashboardData.ticket_counts.open_tickets} active dispute tickets
              </div>
            </div>
          </div>
        ) : null}

        {/* Quick Management Links */}
        <div className={`grid grid-cols-1 ${user?.role === 'super_admin' ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-6`}>
          <Link
            to="/vendor/accounts"
            className="group glass-panel rounded-2xl p-6 hover:border-quantum-400 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-quantum-50 border border-quantum-200 flex items-center justify-center text-quantum-600 mb-4 group-hover:scale-105 group-hover:bg-quantum-600 group-hover:text-white transition-all">
                <Package className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-stone-900 mb-1 group-hover:text-quantum-600 transition-colors">
                Account Inventory
              </h2>
              <p className="text-xs text-stone-600 mb-4 leading-relaxed">
                Add new CODM accounts, upload screenshots, specify pricing, and manage inventory statuses.
              </p>
            </div>
            <div className="pt-4 border-t border-ice-200 flex items-center justify-between text-xs">
              <span className="text-stone-500 font-medium">Manage Stock</span>
              <span className="inline-flex items-center font-semibold text-quantum-600 group-hover:translate-x-1 transition-transform">
                Manage Accounts <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </span>
            </div>
          </Link>

          {user?.role !== 'super_admin' && (
            <Link
              to="/vendor/cp"
              className="group glass-panel rounded-2xl p-6 hover:border-quantum-400 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-quantum-50 border border-quantum-200 flex items-center justify-center text-quantum-600 mb-4 group-hover:scale-105 group-hover:bg-quantum-600 group-hover:text-white transition-all">
                  <Coins className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-stone-900 mb-1 group-hover:text-quantum-600 transition-colors">
                  CP Bundle Pricing
                </h2>
                <p className="text-xs text-stone-600 mb-4 leading-relaxed">
                  Set authoritative TZS unit prices across standard CP bundle denominations (80 to 10,800 CP).
                </p>
              </div>
              <div className="pt-4 border-t border-ice-200 flex items-center justify-between text-xs">
                <span className="text-stone-500 font-medium">Configure Bundles</span>
                <span className="inline-flex items-center font-semibold text-quantum-600 group-hover:translate-x-1 transition-transform">
                  Set CP Rates <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </span>
              </div>
            </Link>
          )}

          <Link
            to="/vendor/orders"
            className="group glass-panel rounded-2xl p-6 hover:border-quantum-400 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-quantum-50 border border-quantum-200 flex items-center justify-center text-quantum-600 mb-4 group-hover:scale-105 group-hover:bg-quantum-600 group-hover:text-white transition-all">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-stone-900 mb-1 group-hover:text-quantum-600 transition-colors">
                Customer Orders
              </h2>
              <p className="text-xs text-stone-600 mb-4 leading-relaxed">
                Process customer purchases, record WhatsApp payments, and fulfill account or CP deliveries.
              </p>
            </div>
            <div className="pt-4 border-t border-ice-200 flex items-center justify-between text-xs">
              <span className="text-stone-500 font-medium">Orders Queue</span>
              <span className="inline-flex items-center font-semibold text-quantum-600 group-hover:translate-x-1 transition-transform">
                View Orders <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </span>
            </div>
          </Link>
        </div>

        {/* Operational Timezone Callout */}
        <div className="p-4 glass-panel rounded-2xl text-xs text-stone-700 flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-quantum-600 shrink-0" />
            <span>
              <strong>Authoritative Reporting Boundary:</strong> All daily sales summaries and reporting resets occur at midnight in <code>Africa/Dar_es_Salaam</code> (EAT).
            </span>
          </div>
          <Link
            to="/vendor/store-settings"
            className="text-quantum-700 hover:text-quantum-900 font-semibold underline shrink-0 ml-4"
          >
            Store Settings
          </Link>
        </div>
      </main>

      <footer className="glass-panel border-t border-ice-200 py-6 text-center text-xs text-stone-500 mt-12">
        <p>&copy; {new Date().getFullYear()} WILRICH STORE. Vendor Portal.</p>
      </footer>
    </div>
  );
}
