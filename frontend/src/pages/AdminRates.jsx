import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import apiClient from '../api/client';
import { RefreshCw, CheckCircle, AlertCircle, TrendingUp, Save } from 'lucide-react';

export default function AdminRates() {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    quote_currency: 'USD',
    rate: '',
    source: 'Admin Managed',
  });

  const fetchRates = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/exchange-rates');
      setRates(res.data.data);
    } catch (err) {
      console.error('Failed to load rates', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      await apiClient.patch('/admin/exchange-rates', {
        base_currency: 'TZS',
        quote_currency: form.quote_currency,
        rate: parseFloat(form.rate),
        source: form.source,
      });

      setSuccess(`Exchange rate for TZS / ${form.quote_currency} updated successfully.`);
      fetchRates();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update rate.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Header */}
        <div className="bg-white border border-cream-300 rounded-xl p-6 sm:p-8 mb-8 shadow-xs">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-torch-700 bg-torch-50 px-2.5 py-1 rounded border border-torch-200">
              Platform Configuration
            </span>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight mt-2.5">
              Exchange Rate Management
            </h1>
            <p className="text-sm text-stone-600 mt-1">
              Configure secondary display currency conversion rates for customer estimates. Authoritative order values remain in base currency (TZS).
            </p>
          </div>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" />
              <span>{success}</span>
            </div>
            <button onClick={() => setSuccess('')} className="text-xs text-emerald-700 underline font-semibold cursor-pointer">
              Dismiss
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-torch-50 border border-torch-200 rounded-xl text-torch-800 text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 text-torch-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Active Rates Table */}
          <div className="md:col-span-2 bg-white border border-cream-300 rounded-xl shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-cream-200 flex items-center justify-between bg-cream-50/50">
              <h2 className="text-base font-bold text-stone-900 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-torch-600" />
                Active Rate Table
              </h2>
              <button
                onClick={fetchRates}
                className="p-1.5 text-stone-500 hover:text-torch-600 rounded hover:bg-cream-200 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-cream-200 text-left text-sm">
                <thead className="bg-cream-100 text-stone-700 font-semibold text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Currency Pair</th>
                    <th className="px-6 py-3.5">Multiplier Rate</th>
                    <th className="px-6 py-3.5">Inverse (1 Quote = TZS)</th>
                    <th className="px-6 py-3.5">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-200">
                  {rates.map((r) => (
                    <tr key={r.id} className="hover:bg-cream-50/75 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-torch-700">
                        {r.base_currency} &rarr; {r.quote_currency}
                      </td>
                      <td className="px-6 py-4 font-mono font-semibold text-stone-800">
                        {r.rate}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-stone-500">
                        {r.rate > 0 ? (1 / r.rate).toLocaleString(undefined, { maximumFractionDigits: 1 }) : '—'} TZS
                      </td>
                      <td className="px-6 py-4 text-xs text-stone-600">
                        {r.source}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Update Rate Form */}
          <div className="bg-white border border-cream-300 rounded-xl p-6 shadow-xs">
            <h3 className="text-base font-bold text-stone-900 mb-4 pb-2 border-b border-cream-200">
              Update Rate
            </h3>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Target Currency</label>
                <select
                  value={form.quote_currency}
                  onChange={(e) => setForm((prev) => ({ ...prev, quote_currency: e.target.value }))}
                  className="w-full px-3 py-2 border border-cream-300 rounded text-sm bg-cream-50/50 text-stone-800 focus:outline-none focus:ring-1 focus:ring-torch-500 focus:border-torch-500"
                >
                  <option value="USD">USD (US Dollar)</option>
                  <option value="NGN">NGN (Nigerian Naira)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Multiplier (1 TZS = X {form.quote_currency})
                </label>
                <input
                  type="number"
                  step="0.00000001"
                  required
                  value={form.rate}
                  onChange={(e) => setForm((prev) => ({ ...prev, rate: e.target.value }))}
                  placeholder={form.quote_currency === 'USD' ? '0.00038' : '0.58'}
                  className="w-full px-3 py-2 border border-cream-300 rounded text-sm font-mono bg-cream-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-torch-500 focus:border-torch-500 text-stone-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Source Label</label>
                <input
                  type="text"
                  value={form.source}
                  onChange={(e) => setForm((prev) => ({ ...prev, source: e.target.value }))}
                  className="w-full px-3 py-2 border border-cream-300 rounded text-sm bg-cream-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-torch-500 focus:border-torch-500 text-stone-800"
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full flex items-center justify-center px-4 py-2.5 bg-torch-500 hover:bg-torch-600 text-white rounded text-sm font-semibold transition-colors shadow-xs disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {updating ? 'Saving...' : 'Apply Rate'}
              </button>
            </form>
          </div>
        </div>
      </main>

      <footer className="bg-cream-50 border-t border-cream-300 py-6 text-center text-xs text-stone-500">
        <p>&copy; {new Date().getFullYear()} WILRICH STORE. Platform Exchange Rates.</p>
      </footer>
    </div>
  );
}
