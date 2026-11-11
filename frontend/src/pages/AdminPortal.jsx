import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import {
  Shield,
  UserPlus,
  Users,
  Store,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  Calendar,
  Package,
  ShoppingBag,
  Coins,
  History,
  LifeBuoy,
  BarChart3,
  TrendingUp,
  Flame,
  CheckCircle2,
  DollarSign,
  ArrowUpRight,
  Layers,
  Loader2,
} from 'lucide-react';

export default function AdminPortal() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [dashLoading, setDashLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });

  const [chartMetric, setChartMetric] = useState('amount'); // 'amount' | 'count'
  const [hoveredBarIndex, setHoveredBarIndex] = useState(null);

  const [vendors, setVendors] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [vendorForm, setVendorForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    store_name: '',
    whatsapp_number: '',
    description: '',
  });

  const fetchDashboard = async (date) => {
    try {
      setDashLoading(true);
      const res = await apiClient.get('/admin/dashboard', {
        params: { date: date || undefined },
      });
      setDashboardData(res.data.data);
    } catch (err) {
      console.warn('Failed to load admin dashboard:', err);
    } finally {
      setDashLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      setLoadingVendors(true);
      const res = await apiClient.get('/admin/vendors');
      setVendors(res.data.data);
    } catch (err) {
      console.error('Failed to load vendors', err);
    } finally {
      setLoadingVendors(false);
    }
  };

  useEffect(() => {
    fetchDashboard(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleFormChange = (e) => {
    setVendorForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreateVendor = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');
    setSubmitting(true);

    try {
      await apiClient.post('/admin/vendors', vendorForm);
      setSuccessMessage('Vendor created successfully with active storefront.');
      setShowCreateModal(false);
      setVendorForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        store_name: '',
        whatsapp_number: '',
        description: '',
      });
      fetchVendors();
      fetchDashboard(selectedDate);
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        setFormError(Object.values(errors)[0][0]);
      } else {
        setFormError(err.response?.data?.message || 'Failed to create vendor account.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (vendorId) => {
    try {
      await apiClient.patch(`/admin/vendors/${vendorId}/toggle-status`);
      setVendors((prev) =>
        prev.map((v) => (v.id === vendorId ? { ...v, is_active: !v.is_active } : v))
      );
      setSuccessMessage('Vendor status updated successfully.');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchDashboard(selectedDate);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update vendor status.');
    }
  };

  // Process timeline data for dynamic bar chart
  const timeline = dashboardData?.sales_chart?.timeline || [];
  const maxMetricValue = Math.max(
    ...timeline.map((point) => (chartMetric === 'amount' ? point.sales_amount : point.orders_count)),
    1
  );

  const totalChartSalesAmount = timeline.reduce((acc, p) => acc + (p.sales_amount || 0), 0);
  const totalChartOrdersCount = timeline.reduce((acc, p) => acc + (p.orders_count || 0), 0);

  const categoryAccounts = dashboardData?.sales_chart?.categories?.accounts || { count: 0, amount: 0 };
  const categoryCp = dashboardData?.sales_chart?.categories?.cp_bundles || { count: 0, amount: 0 };
  const totalCategoryAmount = (categoryAccounts.amount || 0) + (categoryCp.amount || 0);

  const accountPercent = totalCategoryAmount > 0 ? Math.round((categoryAccounts.amount / totalCategoryAmount) * 100) : 50;
  const cpPercent = totalCategoryAmount > 0 ? 100 - accountPercent : 50;

  return (
    <div className="min-h-screen flex flex-col justify-between page-transition">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Welcome Banner */}
        <div className="glass-panel-elevated rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
                Platform Operations &amp; Governance
              </h1>
              <p className="text-sm text-stone-600 mt-1">
                Oversee platform-wide sales in <code>Africa/Dar_es_Salaam</code>, monitor dynamic sales trends, and audit administrative actions.
              </p>
            </div>

            {/* Date Picker */}
            <div className="flex items-center space-x-2 glass-panel rounded-xl p-2 text-xs">
              <Calendar className="w-4 h-4 text-quantum-600" />
              <span className="font-semibold text-stone-700">Reporting Date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-white/80 border border-ice-300 rounded-lg px-2.5 py-1 text-stone-900 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-quantum-500 focus:border-quantum-500"
              />
            </div>
          </div>
        </div>

        {/* Platform Overview Metrics */}
        {dashLoading && !dashboardData ? (
          <div className="py-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-quantum-600 mx-auto mb-2" />
            <p className="text-xs text-stone-500 font-semibold">Loading platform metrics...</p>
          </div>
        ) : dashboardData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-panel rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">
                <span>Daily Completed Sales</span>
                <span className="text-[10px] font-mono text-quantum-700">{dashboardData.daily_sales.timezone}</span>
              </div>
              <div className="text-2xl font-extrabold text-stone-900 mt-2">
                TZS {Number(dashboardData.daily_sales.total_sales_amount).toLocaleString()}
              </div>
              <div className="text-xs text-stone-500 mt-1 flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                <strong>{dashboardData.daily_sales.completed_orders_count}</strong> orders on {dashboardData.daily_sales.date}
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-5 shadow-xs">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1">
                Platform Lifetime Volume
              </span>
              <div className="text-2xl font-extrabold text-stone-900 mt-2">
                TZS {Number(dashboardData.all_time_sales.total_sales_amount).toLocaleString()}
              </div>
              <div className="text-xs text-stone-500 mt-1 flex items-center">
                <TrendingUp className="w-3.5 h-3.5 text-quantum-600 mr-1" />
                <strong>{dashboardData.all_time_sales.completed_orders_count}</strong> fulfilled orders
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-5 shadow-xs">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1">
                Inventory &amp; Listings
              </span>
              <div className="text-2xl font-extrabold text-stone-900 mt-2">
                {dashboardData.platform_totals.active_accounts} <span className="text-sm font-normal text-stone-500">Live Accounts</span>
              </div>
              <div className="text-xs text-stone-500 mt-1">
                {dashboardData.platform_totals.sold_accounts} sold &bull; {dashboardData.platform_totals.total_cp_bundles} CP bundles
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-5 shadow-xs">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1">
                Registered Users &amp; Vendors
              </span>
              <div className="text-2xl font-extrabold text-stone-900 mt-2">
                {dashboardData.platform_totals.total_vendors} <span className="text-sm font-normal text-stone-500">Vendors</span>
              </div>
              <div className="text-xs text-stone-500 mt-1">
                {dashboardData.platform_totals.total_customers} Customers &bull; {dashboardData.platform_totals.open_tickets} Open Disputes
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Bar Charts Dashboard: Records all orders marked sold as sales */}
        <div className="glass-panel-elevated rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-ice-200">
            <div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-quantum-50 border border-quantum-200 flex items-center justify-center text-quantum-600">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-stone-900">
                  Dynamic Sales Dashboard &bull; Orders Marked Sold
                </h2>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Visualizing all orders transitioned to <code>completed / sold</code> across the last 14 days in real-time.
              </p>
            </div>

            {/* Metric Mode Toggle */}
            <div className="flex items-center space-x-1.5 bg-white/80 p-1.5 rounded-xl border border-ice-200 text-xs font-medium">
              <button
                type="button"
                onClick={() => setChartMetric('amount')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  chartMetric === 'amount'
                    ? 'glass-button font-semibold shadow-xs'
                    : 'text-stone-600 hover:text-quantum-600'
                }`}
              >
                Revenue (TZS)
              </button>
              <button
                type="button"
                onClick={() => setChartMetric('count')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  chartMetric === 'count'
                    ? 'glass-button font-semibold shadow-xs'
                    : 'text-stone-600 hover:text-quantum-600'
                }`}
              >
                Orders Sold (Units)
              </button>
            </div>
          </div>

          {/* Dynamic Interactive SVG Bar Chart */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row items-stretch gap-6">
              {/* Main Dynamic Bar Chart Area */}
              <div className="flex-1 glass-panel rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between min-h-[300px]">
                {/* Chart Header Totals */}
                <div className="flex items-center justify-between text-xs mb-4">
                  <div>
                    <span className="text-[11px] uppercase font-bold text-stone-400">14-Day Timeline</span>
                    <div className="font-extrabold text-stone-900 text-base mt-0.5">
                      {chartMetric === 'amount'
                        ? `TZS ${totalChartSalesAmount.toLocaleString()}`
                        : `${totalChartOrdersCount} Completed Orders Sold`}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center text-[11px] font-semibold text-quantum-700 bg-quantum-50 px-2 py-0.5 rounded-full border border-quantum-200">
                      <Flame className="w-3 h-3 mr-1 text-quantum-600" />
                      Live Sold Telemetry
                    </span>
                  </div>
                </div>

                {/* Bars Visual Container */}
                <div className="h-52 flex items-end justify-between gap-1.5 sm:gap-3 pt-6 pb-2 px-2 border-b border-ice-200">
                  {timeline.map((point, idx) => {
                    const value = chartMetric === 'amount' ? point.sales_amount : point.orders_count;
                    const heightPercent = maxMetricValue > 0 ? Math.max(Math.round((value / maxMetricValue) * 100), value > 0 ? 8 : 3) : 3;
                    const isHovered = hoveredBarIndex === idx;

                    return (
                      <div
                        key={point.date}
                        className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                        onMouseEnter={() => setHoveredBarIndex(idx)}
                        onMouseLeave={() => setHoveredBarIndex(null)}
                      >
                        {/* Hover Tooltip Card */}
                        {isHovered && (
                          <div className="absolute -top-20 z-20 glass-panel-elevated p-2.5 rounded-xl shadow-xl text-left pointer-events-none min-w-[130px] border border-ice-200 page-transition">
                            <div className="text-[10px] font-semibold text-stone-400 uppercase">
                              {point.day_name}, {point.short_label}
                            </div>
                            <div className="text-xs font-bold text-quantum-800 mt-0.5">
                              TZS {Number(point.sales_amount).toLocaleString()}
                            </div>
                            <div className="text-[10px] text-stone-600 mt-0.5">
                              {point.orders_count} orders marked sold
                            </div>
                          </div>
                        )}

                        {/* Bar Pillar */}
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-t-lg transition-all duration-300 relative ${
                            value > 0
                              ? isHovered
                                ? 'bg-gradient-to-t from-quantum-700 to-ice-400 shadow-md shadow-quantum-500/30 scale-105'
                                : 'bg-gradient-to-t from-quantum-600 to-ice-400/90 shadow-sm shadow-quantum-500/20'
                              : 'bg-ice-200/60'
                          }`}
                        >
                          {point.is_today && (
                            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-quantum-600 ring-2 ring-white" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* X-Axis Date Labels */}
                <div className="flex justify-between items-center px-2 pt-2 text-[10px] text-stone-500 font-mono">
                  {timeline.map((point, idx) => (
                    <span
                      key={point.date}
                      className={`flex-1 text-center truncate ${
                        point.is_today ? 'font-bold text-quantum-700' : ''
                      }`}
                    >
                      {idx % 2 === 0 || idx === timeline.length - 1 ? point.short_label : ''}
                    </span>
                  ))}
                </div>
              </div>

              {/* Companion Side Metrics: Category Distribution & AOV */}
              <div className="w-full md:w-80 space-y-4">
                {/* Category Sales Proportion */}
                <div className="glass-panel rounded-2xl p-5 space-y-3">
                  <span className="text-xs uppercase font-bold text-stone-400 tracking-wider">
                    Sales by Category
                  </span>

                  {/* Dual Bar */}
                  <div className="w-full h-3 rounded-full overflow-hidden flex bg-ice-200">
                    <div
                      style={{ width: `${accountPercent}%` }}
                      className="bg-quantum-600 transition-all duration-500"
                      title={`Accounts: ${accountPercent}%`}
                    />
                    <div
                      style={{ width: `${cpPercent}%` }}
                      className="bg-ice-500 transition-all duration-500"
                      title={`CP Bundles: ${cpPercent}%`}
                    />
                  </div>

                  {/* Breakdown Labels */}
                  <div className="space-y-2 pt-1 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-quantum-600" />
                        <span className="font-medium text-stone-700">Accounts Sold</span>
                      </div>
                      <span className="font-bold text-stone-900">
                        TZS {Number(categoryAccounts.amount).toLocaleString()} ({categoryAccounts.count})
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-ice-500" />
                        <span className="font-medium text-stone-700">CP Bundles Sold</span>
                      </div>
                      <span className="font-bold text-stone-900">
                        TZS {Number(categoryCp.amount).toLocaleString()} ({categoryCp.count})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Average Order Value Metric */}
                <div className="glass-panel rounded-2xl p-5">
                  <span className="text-xs uppercase font-bold text-stone-400 tracking-wider">
                    Average Order Value (AOV)
                  </span>
                  <div className="text-xl font-extrabold text-stone-900 mt-1">
                    TZS{' '}
                    {totalChartOrdersCount > 0
                      ? Math.round(totalChartSalesAmount / totalChartOrdersCount).toLocaleString()
                      : '0'}
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Calculated across all orders marked completed/sold over the last 14 days.
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Orders Marked Sold Table */}
            {dashboardData?.sales_chart?.recent_sold?.length > 0 && (
              <div className="glass-panel rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-ice-200">
                  <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-1.5" />
                    Recently Fulfilled &amp; Marked Sold Orders
                  </h3>
                  <span className="text-[10px] text-stone-500 font-mono">
                    Authoritative Audit Feed
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-ice-100 text-left text-xs">
                    <thead>
                      <tr className="text-stone-500 text-[11px] uppercase font-semibold">
                        <th className="py-2 pr-3">Ref</th>
                        <th className="py-2 px-3">Item Snapshot</th>
                        <th className="py-2 px-3">Vendor</th>
                        <th className="py-2 px-3">Customer</th>
                        <th className="py-2 px-3">Sale Amount</th>
                        <th className="py-2 pl-3 text-right">Sold At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ice-100">
                      {dashboardData.sales_chart.recent_sold.map((order) => (
                        <tr key={order.id} className="hover:bg-white/50 transition-colors">
                          <td className="py-2.5 pr-3 font-mono font-bold text-quantum-700">
                            {order.reference}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-stone-900">
                            {order.title}
                          </td>
                          <td className="py-2.5 px-3 text-stone-600">{order.vendor_name}</td>
                          <td className="py-2.5 px-3 text-stone-600">{order.customer_name}</td>
                          <td className="py-2.5 px-3 font-bold text-stone-900">
                            {order.price_currency} {Number(order.total_price_amount).toLocaleString()}
                          </td>
                          <td className="py-2.5 pl-3 text-right font-mono text-stone-500 text-[11px]">
                            {order.completed_at ? new Date(order.completed_at).toLocaleDateString() : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Vendor Sales Breakdown Table */}
        {dashboardData?.vendor_breakdown?.length > 0 && (
          <div className="glass-panel rounded-2xl p-6 shadow-xs">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-4 pb-3 border-b border-ice-200">
              Vendor Sales Performance Breakdown ({dashboardData.daily_sales.date})
            </h2>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-ice-200 text-left text-xs">
                <thead className="bg-ice-50/70 text-stone-700 font-semibold uppercase">
                  <tr>
                    <th scope="col" className="px-4 py-3">Store Name</th>
                    <th scope="col" className="px-4 py-3">Store Slug</th>
                    <th scope="col" className="px-4 py-3">Today Orders</th>
                    <th scope="col" className="px-4 py-3">Today Sales (TZS)</th>
                    <th scope="col" className="px-4 py-3">Lifetime Orders</th>
                    <th scope="col" className="px-4 py-3 text-right">Lifetime Sales (TZS)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ice-100">
                  {dashboardData.vendor_breakdown.map((vb) => (
                    <tr key={vb.vendor_id} className="hover:bg-white/60 transition-colors">
                      <td className="px-4 py-3 font-bold text-stone-900">{vb.store_name}</td>
                      <td className="px-4 py-3 font-mono text-stone-500">@{vb.store_slug}</td>
                      <td className="px-4 py-3 font-semibold text-stone-900">{vb.today_orders_count}</td>
                      <td className="px-4 py-3 font-bold text-quantum-700">
                        TZS {Number(vb.today_sales_amount).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-stone-700">{vb.all_time_orders_count}</td>
                      <td className="px-4 py-3 text-right font-bold text-stone-900">
                        TZS {Number(vb.all_time_sales_amount).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Vendors Management Section */}
        <div className="glass-panel-elevated rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-ice-200">
            <div>
              <h2 className="text-base font-bold text-stone-900">Approved Vendors Directory</h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Manage vendor access credentials and toggle active storefront statuses.
              </p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 glass-button text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 mr-1.5" />
              Provision New Vendor
            </button>
          </div>

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" />
              {successMessage}
            </div>
          )}

          {loadingVendors ? (
            <div className="py-8 text-center text-xs text-stone-500 font-medium">Loading vendors...</div>
          ) : vendors.length === 0 ? (
            <div className="py-8 text-center text-xs text-stone-500">No vendor accounts registered.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-ice-200 text-left text-xs">
                <thead className="bg-ice-50/70 text-stone-700 font-semibold uppercase">
                  <tr>
                    <th scope="col" className="px-4 py-3">Store</th>
                    <th scope="col" className="px-4 py-3">Admin User</th>
                    <th scope="col" className="px-4 py-3">WhatsApp Number</th>
                    <th scope="col" className="px-4 py-3">Status</th>
                    <th scope="col" className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ice-100">
                  {vendors.map((v) => (
                    <tr key={v.id} className="hover:bg-white/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-stone-900">{v.vendor_profile?.store_name || 'No Store'}</div>
                        <div className="font-mono text-quantum-700 text-[11px]">@{v.vendor_profile?.store_slug}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-stone-900">{v.name}</div>
                        <div className="font-mono text-stone-500 text-[11px]">{v.email}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-stone-700">
                        {v.vendor_profile?.whatsapp_number ? `+${v.vendor_profile.whatsapp_number}` : '-'}
                      </td>
                      <td className="px-4 py-3">
                        {v.is_active ? (
                          <span className="inline-flex items-center text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold text-[11px] border border-emerald-200">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-red-700 bg-red-50 px-2 py-0.5 rounded-full font-semibold text-[11px] border border-red-200">
                            Suspended
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleToggleStatus(v.id)}
                          className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                            v.is_active
                              ? 'border border-red-200 text-red-700 hover:bg-red-50'
                              : 'border border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {v.is_active ? 'Suspend Store' : 'Activate Store'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Audit Logs Stream */}
        {dashboardData?.recent_audit_logs?.length > 0 && (
          <div className="glass-panel rounded-2xl p-6 shadow-xs">
            <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-ice-200">
              <History className="w-4 h-4 text-quantum-600" />
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                Recent Administrative Audit Trail
              </h2>
            </div>

            <div className="divide-y divide-ice-100 text-xs">
              {dashboardData.recent_audit_logs.map((log) => (
                <div key={log.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-stone-400 text-[11px]">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </span>
                    <span className="font-bold text-stone-900">
                      {log.actor?.name || 'System'}
                    </span>
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-ice-100 text-stone-800 border border-ice-300">
                      {log.action}
                    </span>
                    {log.metadata && (
                      <span className="text-stone-500 text-[11px] hidden sm:inline font-mono truncate max-w-md">
                        {JSON.stringify(log.metadata)}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-stone-400 font-mono">
                    {new Date(log.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Provision Vendor Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 page-transition">
          <div className="glass-panel-elevated rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-ice-200">
              <h3 className="text-base font-bold text-stone-900">Provision New Vendor</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-stone-400 hover:text-stone-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start">
                <AlertCircle className="w-4 h-4 mr-1.5 shrink-0 mt-0.5 text-red-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateVendor} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Store Brand Name *</label>
                <input
                  type="text"
                  name="store_name"
                  required
                  value={vendorForm.store_name}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-ice-300 rounded-xl bg-white/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Vendor Manager Full Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={vendorForm.name}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-ice-300 rounded-xl bg-white/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Contact WhatsApp Number *</label>
                <input
                  type="text"
                  name="whatsapp_number"
                  required
                  value={vendorForm.whatsapp_number}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-ice-300 rounded-xl bg-white/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Login Email Address *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={vendorForm.email}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-ice-300 rounded-xl bg-white/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Password *</label>
                <input
                  type="password"
                  name="password"
                  required
                  value={vendorForm.password}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-ice-300 rounded-xl bg-white/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Store Description</label>
                <textarea
                  name="description"
                  rows={2}
                  value={vendorForm.description}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-ice-300 rounded-xl bg-white/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum-500"
                />
              </div>

              <div className="flex items-center space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-1/2 py-2 px-3 border border-ice-300 rounded-xl text-stone-700 hover:bg-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 py-2 px-3 glass-button text-white rounded-xl font-semibold shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="glass-panel border-t border-ice-200 py-6 text-center text-xs text-stone-500 mt-12">
        <p>&copy; {new Date().getFullYear()} WILRICH STORE. Super Admin Portal.</p>
      </footer>
    </div>
  );
}
