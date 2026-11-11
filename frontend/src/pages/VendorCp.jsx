import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import PriceDisplay from '../components/common/PriceDisplay';
import apiClient from '../api/client';
import { Coins, Plus, CheckCircle, AlertCircle, RefreshCw, Trash2, Loader2 } from 'lucide-react';

export default function VendorCp() {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    cp_amount: 2400,
    price_amount: '',
    price_currency: 'TZS',
    status: 'published',
  });

  const fetchBundles = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/vendor/cp-bundles');
      setBundles(res.data.data);
    } catch (err) {
      console.error('Failed to load CP bundles', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBundles();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await apiClient.post('/vendor/cp-bundles', form);
      setSuccess('CP bundle added successfully.');
      setShowModal(false);
      setForm({
        cp_amount: 2400,
        price_amount: '',
        price_currency: 'TZS',
        status: 'published',
      });
      fetchBundles();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create CP bundle.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this CP bundle?')) return;
    try {
      await apiClient.delete(`/vendor/cp-bundles/${id}`);
      setSuccess('CP bundle removed.');
      fetchBundles();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete bundle.');
    }
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
                Manage CP Bundles
              </h1>
              <p className="text-sm text-stone-600 mt-1">
                Set custom prices for standard Call of Duty: Mobile CP packages.
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center px-4 py-2.5 glass-button text-white rounded-xl text-sm font-semibold shadow-xs"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add CP Bundle
            </button>
          </div>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm flex items-center justify-between shadow-xs">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" />
              <span>{success}</span>
            </div>
            <button onClick={() => setSuccess('')} className="text-xs text-emerald-700 underline font-semibold">
              Dismiss
            </button>
          </div>
        )}

        {/* Bundles Table */}
        <div className="glass-panel rounded-2xl shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-sm font-medium">
              <Loader2 className="w-8 h-8 animate-spin text-quantum-600 mx-auto mb-2" />
              <p className="text-stone-700">Loading CP bundles...</p>
            </div>
          ) : bundles.length === 0 ? (
            <div className="p-12 text-center text-sm text-stone-500">
              <Coins className="w-10 h-10 text-quantum-500 mx-auto mb-3 opacity-60" />
              <h3 className="text-base font-bold text-stone-900">No CP bundles configured</h3>
              <p className="text-xs text-stone-500 mt-1">
                Configure your bundle pricing to start selling CP in the marketplace.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-ice-200 text-left text-sm">
                <thead className="bg-ice-50/70 text-stone-700 font-semibold text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Bundle Size</th>
                    <th className="px-6 py-3.5">Selling Price</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ice-100">
                  {bundles.map((bundle) => (
                    <tr key={bundle.id} className="hover:bg-white/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-stone-900">{bundle.formatted_title}</div>
                        <div className="text-xs text-stone-500">{bundle.cp_amount.toLocaleString()} In-game CP</div>
                      </td>
                      <td className="px-6 py-4 font-mono font-medium text-stone-900">
                        {bundle.price_currency} {Number(bundle.price_amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Active Listing
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(bundle.id)}
                          className="text-xs px-2.5 py-1 rounded-lg text-stone-500 hover:text-red-600 hover:bg-red-50 inline-flex items-center cursor-pointer transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline mr-1" /> Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal: Add CP Bundle */}
        {showModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 page-transition">
            <div className="glass-panel-elevated rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-ice-200">
                <h3 className="text-lg font-bold text-stone-900">Configure CP Bundle</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-stone-400 hover:text-stone-600 font-bold text-lg"
                >
                  ✕
                </button>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 mr-1 mt-0.5 shrink-0 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCreate} className="mt-4 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Standard CP Denomination</label>
                  <select
                    name="cp_amount"
                    value={form.cp_amount}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-ice-300 rounded-xl bg-white/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum-500 text-stone-800"
                  >
                    <option value={80}>80 CP</option>
                    <option value={420}>420 CP</option>
                    <option value={880}>880 CP</option>
                    <option value={2400}>2,400 CP</option>
                    <option value={5000}>5,000 CP</option>
                    <option value={10800}>10,800 CP</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Unit Price</label>
                    <input
                      name="price_amount"
                      type="number"
                      required
                      min="1"
                      value={form.price_amount}
                      onChange={handleChange}
                      placeholder="e.g. 65000"
                      className="w-full px-3 py-2 border border-ice-300 rounded-xl font-mono bg-white/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum-500 text-stone-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Currency</label>
                    <select
                      name="price_currency"
                      value={form.price_currency}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-ice-300 rounded-xl bg-white/80 text-stone-800 focus:outline-none focus:ring-1 focus:ring-quantum-500"
                    >
                      <option value="TZS">TZS (Tanzanian Shilling)</option>
                      <option value="USD">USD (US Dollar)</option>
                      <option value="NGN">NGN (Nigerian Naira)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-ice-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-ice-300 rounded-xl font-semibold text-stone-700 hover:bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 glass-button text-white rounded-xl font-semibold shadow-xs disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : 'Save Bundle'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <footer className="glass-panel border-t border-ice-200 py-6 text-center text-xs text-stone-500 mt-12">
        <p>&copy; {new Date().getFullYear()} WILRICH STORE. Vendor CP Manager.</p>
      </footer>
    </div>
  );
}
