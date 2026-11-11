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
} from 'lucide-react';

export default function AdminPortal() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [dashLoading, setDashLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });

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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Welcome Banner */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                Super Admin Console
              </span>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-2">
                Platform Operations &amp; Governance
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Oversee platform-wide sales in <code>Africa/Dar_es_Salaam</code>, monitor vendor metrics, and audit administrative actions.
              </p>
            </div>

            {/* Date Picker */}
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="font-medium text-slate-600">Reporting Date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Platform Overview Metrics */}
        {dashboardData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                <span>Daily Completed Sales</span>
                <span className="text-[10px] font-mono">{dashboardData.daily_sales.timezone}</span>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 mt-2">
                TZS {Number(dashboardData.daily_sales.total_sales_amount).toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                <strong>{dashboardData.daily_sales.completed_orders_count}</strong> orders on {dashboardData.daily_sales.date}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Platform Lifetime Volume
              </span>
              <div className="text-2xl font-extrabold text-slate-900 mt-2">
                TZS {Number(dashboardData.all_time_sales.total_sales_amount).toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                <strong>{dashboardData.all_time_sales.completed_orders_count}</strong> fulfilled orders
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Inventory &amp; Listings
              </span>
              <div className="text-2xl font-extrabold text-slate-900 mt-2">
                {dashboardData.platform_totals.active_accounts} <span className="text-sm font-normal text-slate-500">Live Accounts</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {dashboardData.platform_totals.sold_accounts} sold &bull; {dashboardData.platform_totals.total_cp_bundles} CP bundles
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Registered Users &amp; Vendors
              </span>
              <div className="text-2xl font-extrabold text-slate-900 mt-2">
                {dashboardData.platform_totals.total_vendors} <span className="text-sm font-normal text-slate-500">Vendors</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {dashboardData.platform_totals.total_customers} Customers &bull; {dashboardData.platform_totals.open_tickets} Open Disputes
              </div>
            </div>
          </div>
        )}

        {/* Vendor Sales Breakdown Table */}
        {dashboardData?.vendor_breakdown?.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-3 border-b border-slate-100">
              Vendor Sales Performance Breakdown ({dashboardData.daily_sales.date})
            </h2>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold uppercase">
                  <tr>
                    <th scope="col" className="px-4 py-3">Store Name</th>
                    <th scope="col" className="px-4 py-3">Store Slug</th>
                    <th scope="col" className="px-4 py-3">Today Orders</th>
                    <th scope="col" className="px-4 py-3">Today Sales (TZS)</th>
                    <th scope="col" className="px-4 py-3">Lifetime Orders</th>
                    <th scope="col" className="px-4 py-3 text-right">Lifetime Sales (TZS)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dashboardData.vendor_breakdown.map((vb) => (
                    <tr key={vb.vendor_id} className="hover:bg-slate-50/75">
                      <td className="px-4 py-3 font-bold text-slate-900">{vb.store_name}</td>
                      <td className="px-4 py-3 font-mono text-slate-500">@{vb.store_slug}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{vb.today_orders_count}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">
                        TZS {Number(vb.today_sales_amount).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{vb.all_time_orders_count}</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900">
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
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Approved Vendors Directory</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage vendor access credentials and toggle active storefront statuses.
              </p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5 mr-1.5" />
              Provision New Vendor
            </button>
          </div>

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 font-semibold flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              {successMessage}
            </div>
          )}

          {loadingVendors ? (
            <div className="py-8 text-center text-xs text-slate-500">Loading vendors...</div>
          ) : vendors.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">No vendor accounts registered.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold uppercase">
                  <tr>
                    <th scope="col" className="px-4 py-3">Store</th>
                    <th scope="col" className="px-4 py-3">Admin User</th>
                    <th scope="col" className="px-4 py-3">WhatsApp Number</th>
                    <th scope="col" className="px-4 py-3">Status</th>
                    <th scope="col" className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vendors.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/75">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{v.vendor_profile?.store_name || 'No Store'}</div>
                        <div className="font-mono text-slate-500 text-[11px]">@{v.vendor_profile?.store_slug}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{v.name}</div>
                        <div className="font-mono text-slate-500 text-[11px]">{v.email}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-700">
                        {v.vendor_profile?.whatsapp_number ? `+${v.vendor_profile.whatsapp_number}` : '-'}
                      </td>
                      <td className="px-4 py-3">
                        {v.is_active ? (
                          <span className="inline-flex items-center text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold text-[11px] border border-emerald-200">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-red-700 bg-red-50 px-2 py-0.5 rounded font-semibold text-[11px] border border-red-200">
                            Suspended
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleToggleStatus(v.id)}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
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
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
            <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-slate-100">
              <History className="w-4 h-4 text-slate-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Recent Administrative Audit Trail
              </h2>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {dashboardData.recent_audit_logs.map((log) => (
                <div key={log.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-slate-400 text-[11px]">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </span>
                    <span className="font-bold text-slate-900">
                      {log.actor?.name || 'System'}
                    </span>
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {log.action}
                    </span>
                    {log.metadata && (
                      <span className="text-slate-500 text-[11px] hidden sm:inline">
                        {JSON.stringify(log.metadata)}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(log.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create Vendor Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
            <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Provision New Vendor Account</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  &times;
                </button>
              </div>

              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-start">
                  <AlertCircle className="w-4 h-4 mr-1.5 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleCreateVendor} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vendor Manager Full Name *</label>
                  <input
                    type="text"
                    required
                    name="name"
                    value={vendorForm.name}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Login Email *</label>
                    <input
                      type="email"
                      required
                      name="email"
                      value={vendorForm.email}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Initial Password *</label>
                    <input
                      type="password"
                      required
                      name="password"
                      value={vendorForm.password}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Store Front Name *</label>
                  <input
                    type="text"
                    required
                    name="store_name"
                    placeholder="e.g. Bravo Armory"
                    value={vendorForm.store_name}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Verified WhatsApp Number (E.164 without +) *</label>
                  <input
                    type="text"
                    required
                    name="whatsapp_number"
                    placeholder="e.g. 255712345678"
                    value={vendorForm.whatsapp_number}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Store Description</label>
                  <textarea
                    rows={2}
                    name="description"
                    value={vendorForm.description}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div className="flex items-center space-x-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="w-1/2 py-2 px-3 border border-slate-300 rounded text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-1/2 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Provisioning...' : 'Create Vendor'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} WILRICH STORE. Super Admin Console.</p>
      </footer>
    </div>
  );
}
