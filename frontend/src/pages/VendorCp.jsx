import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import PriceDisplay from '../components/common/PriceDisplay';
import apiClient from '../api/client';
import { Coins, Plus, CheckCircle, AlertCircle, RefreshCw, Trash2 } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 mb-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                CP Pricing Manager
              </span>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-2">
                Manage CP Bundles
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Set custom prices for standard Call of Duty: Mobile CP packages.
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center px-4 py-2 bg-slate-900 text-white rounded text-sm font-medium hover:bg-slate-800 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add CP Bundle
            </button>
          </div>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" />
              <span>{success}</span>
            </div>
            <button onClick={() => setSuccess('')} className="text-xs text-emerald-700 underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Bundles Table */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Your Active Bundles ({bundles.length})</h2>
            <button
              onClick={fetchBundles}
              className="p-1.5 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-sm text-slate-500">Loading CP bundles...</div>
          ) : bundles.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-500">
              <Coins className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">No CP bundles configured</h3>
              <p className="text-xs text-slate-500 mt-1">
                Click &quot;Add CP Bundle&quot; to publish your first currency rate.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Bundle Amount</th>
                    <th className="px-6 py-3">Price</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {bundles.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-bold text-slate-900 flex items-center">
                        <Coins className="w-4 h-4 mr-2 text-amber-600" />
                        {b.formatted_title}
                      </td>
                      <td className="px-6 py-4 font-mono font-medium text-slate-900">
                        {b.price_currency} {Number(b.price_amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(b.id)}
                          className="text-xs text-rose-600 hover:text-rose-900 p-1"
                          title="Delete Bundle"
                        >
                          <Trash2 className="w-4 h-4 inline" />
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
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 border border-slate-200 shadow-lg">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">Add CP Bundle</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                  ✕
                </button>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded text-rose-800 text-xs flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCreate} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Standard Bundle Size
                  </label>
                  <select
                    name="cp_amount"
                    value={form.cp_amount}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="80">80 CP</option>
                    <option value="420">420 CP</option>
                    <option value="880">880 CP</option>
                    <option value="2400">2,400 CP</option>
                    <option value="5000">5,000 CP</option>
                    <option value="10800">10,800 CP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Your Sale Price (TZS)
                  </label>
                  <input
                    name="price_amount"
                    type="number"
                    required
                    min="1"
                    value={form.price_amount}
                    onChange={handleChange}
                    placeholder="e.g. 65000"
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm font-mono focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Authoritative sale price charged to customers.
                  </span>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-slate-300 rounded text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-sm font-medium disabled:opacity-50"
                  >
                    {submitting ? 'Adding...' : 'Add Bundle'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} WILRICH STORE. Vendor CP Management.</p>
      </footer>
    </div>
  );
}

