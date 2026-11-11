import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import apiClient from '../api/client';
import {
  Gamepad2,
  Plus,
  RefreshCw,
  Eye,
  Trash2,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function VendorAccounts() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    price_amount: '',
    price_currency: 'TZS',
    status: 'published',
  });

  const [selectedImages, setSelectedImages] = useState([]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/vendor/account-listings', {
        params: { status: statusFilter || undefined },
      });
      setListings(res.data.data);
    } catch (err) {
      console.error('Failed to load vendor listings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [statusFilter]);

  const handleFormChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(files);
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('price_amount', form.price_amount);
      formData.append('price_currency', form.price_currency);
      formData.append('status', form.status);

      selectedImages.forEach((img) => {
        formData.append('images[]', img);
      });

      await apiClient.post('/vendor/account-listings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccessMessage('Account listing published successfully.');
      setShowCreateModal(false);
      setForm({
        title: '',
        description: '',
        price_amount: '',
        price_currency: 'TZS',
        status: 'published',
      });
      setSelectedImages([]);
      fetchListings();
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        setFormError(Object.values(errors)[0][0]);
      } else {
        setFormError(err.response?.data?.message || 'Failed to create listing.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkSold = async (id) => {
    if (!window.confirm('Are you sure you want to mark this account as sold? It will immediately stop appearing in customer search.')) {
      return;
    }
    try {
      await apiClient.post(`/vendor/account-listings/${id}/mark-sold`);
      setSuccessMessage('Account marked as sold.');
      fetchListings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark listing as sold.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) {
      return;
    }
    try {
      await apiClient.delete(`/vendor/account-listings/${id}`);
      setSuccessMessage('Listing deleted.');
      fetchListings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete listing.');
    }
  };

  const formatPrice = (amount, currency = 'TZS') => {
    return `${currency} ${Number(amount).toLocaleString()}`;
  };

  return (
    <div className="min-h-screen flex flex-col justify-between page-transition">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Header */}
        <div className="glass-panel-elevated rounded-2xl p-6 sm:p-8 mb-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
                CODM Account Inventory
              </h1>
              <p className="text-sm text-stone-600 mt-1">
                Create, manage, and monitor your listed Call of Duty: Mobile accounts.
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center px-4 py-2.5 glass-button text-white rounded-xl text-sm font-semibold shadow-xs"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Account Listing
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm flex items-center justify-between shadow-xs">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage('')} className="text-xs text-emerald-700 underline font-semibold cursor-pointer">
              Dismiss
            </button>
          </div>
        )}

        {/* Filter bar */}
        <div className="glass-panel rounded-2xl p-4 mb-6 shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-stone-500 uppercase">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1 text-xs border border-ice-300 rounded-xl bg-white/80 text-stone-800 focus:outline-none focus:ring-1 focus:ring-quantum-500 cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="sold">Sold</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
          <button
            onClick={fetchListings}
            className="p-1.5 text-stone-500 hover:text-quantum-600 rounded-lg hover:bg-quantum-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Listings Table */}
        <div className="glass-panel rounded-2xl shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-sm font-medium">
              <Loader2 className="w-8 h-8 animate-spin text-quantum-600 mx-auto mb-2" />
              <p className="text-stone-700">Loading inventory...</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="p-12 text-center text-sm text-stone-500">
              <Gamepad2 className="w-10 h-10 text-quantum-500 mx-auto mb-3 opacity-60" />
              <h3 className="text-base font-bold text-stone-900">No account listings found</h3>
              <p className="text-xs text-stone-500 mt-1">
                Click &quot;Add Account Listing&quot; to publish your first account to the marketplace.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-ice-200 text-left text-sm">
                <thead className="bg-ice-50/70 text-stone-700 font-semibold text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Listing Title</th>
                    <th className="px-6 py-3.5">Price</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Created</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ice-100">
                  {listings.map((item) => (
                    <tr key={item.id} className="hover:bg-white/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-stone-900">{item.title}</div>
                        <div className="text-xs text-stone-500 line-clamp-1">{item.description}</div>
                      </td>
                      <td className="px-6 py-4 font-mono font-medium text-stone-900">
                        {formatPrice(item.price_amount, item.price_currency)}
                      </td>
                      <td className="px-6 py-4">
                        {item.status === 'published' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Published
                          </span>
                        )}
                        {item.status === 'sold' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-800 border border-stone-300">
                            Sold Out
                          </span>
                        )}
                        {item.status === 'draft' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            Draft
                          </span>
                        )}
                        {item.status === 'unavailable' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-800 border border-red-200">
                            Unavailable
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-stone-500 font-mono">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {item.status === 'published' && (
                          <button
                            onClick={() => handleMarkSold(item.id)}
                            className="text-xs px-2.5 py-1 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 font-semibold cursor-pointer"
                            title="Mark Sold"
                          >
                            Mark Sold
                          </button>
                        )}
                        <Link
                          to={`/app/accounts/${item.id}`}
                          target="_blank"
                          className="text-xs px-2.5 py-1 rounded-lg text-stone-600 hover:text-quantum-600 hover:bg-quantum-50 inline-flex items-center"
                          title="Preview"
                        >
                          <Eye className="w-3.5 h-3.5 inline" />
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-xs px-2.5 py-1 rounded-lg text-stone-500 hover:text-red-600 hover:bg-red-50 inline-flex items-center cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal: Create Account Listing */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 page-transition">
            <div className="glass-panel-elevated rounded-2xl max-w-xl w-full p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-ice-200">
                <h3 className="text-lg font-bold text-stone-900">Add CODM Account Listing</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-stone-400 hover:text-stone-600 font-bold text-lg"
                >
                  ✕
                </button>
              </div>

              {formError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 mr-1 mt-0.5 shrink-0 text-red-600" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleCreateListing} className="mt-4 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Listing Title</label>
                  <input
                    name="title"
                    required
                    value={form.title}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-ice-300 rounded-xl bg-white/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum-500 text-stone-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Sale Price</label>
                    <input
                      name="price_amount"
                      type="number"
                      required
                      min="1"
                      value={form.price_amount}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-ice-300 rounded-xl font-mono bg-white/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum-500 text-stone-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Currency</label>
                    <select
                      name="price_currency"
                      value={form.price_currency}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-ice-300 rounded-xl bg-white/80 text-stone-800 focus:outline-none focus:ring-1 focus:ring-quantum-500"
                    >
                      <option value="TZS">TZS (Tanzanian Shilling)</option>
                      <option value="USD">USD (US Dollar)</option>
                      <option value="NGN">NGN (Nigerian Naira)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Description &amp; Specs</label>
                  <textarea
                    name="description"
                    required
                    rows={4}
                    value={form.description}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-ice-300 rounded-xl bg-white/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum-500 text-stone-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Upload Images (JPEG, PNG, WebP — Max 5MB)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="w-full text-xs text-stone-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-quantum-50 file:text-quantum-700 hover:file:bg-quantum-100 cursor-pointer"
                  />
                  <span className="text-[11px] text-stone-500 mt-1 block">
                    Images are verified server-side for valid MIME and dimensions.
                  </span>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-ice-200">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-ice-300 rounded-xl font-semibold text-stone-700 hover:bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 glass-button text-white rounded-xl font-semibold shadow-xs disabled:opacity-50"
                  >
                    {submitting ? 'Publishing...' : 'Publish Listing'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <footer className="glass-panel border-t border-ice-200 py-6 text-center text-xs text-stone-500 mt-12">
        <p>&copy; {new Date().getFullYear()} WILRICH STORE. Vendor Accounts.</p>
      </footer>
    </div>
  );
}
