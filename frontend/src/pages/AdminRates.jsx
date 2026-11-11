import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import apiClient from '../api/client';
import { RefreshCw, CheckCircle, AlertCircle, TrendingUp, Save, Loader2 } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col justify-between page-transition">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Header */}
        <div className="glass-panel-elevated rounded-2xl p-6 sm:p-8 shadow-xs">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-quantum-700 bg-quantum-50 px-2.5 py-1 rounded-full border border-quantum-200">
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
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm flex items-center justify-between shadow-xs">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" />
              <span>{success}</span>
            </div>
            <button onClick={() => setSuccess('')} className="text-xs text-emerald-700 underline font-semibold">
              Dismiss
            </button>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-sm flex items-center shadow-xs">
            <AlertCircle className="w-4 h-4 mr-2 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Active Rates Table */}
          <div className="md:col-span-2 glass-panel rounded-2xl shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-ice-200 flex items-center justify-between bg-ice-50/70">
              <h2 className="text-xs uppercase font-bold text-stone-700 tracking-wider">
                Configured Currency Pairs (Base: TZS)
              </h2>
              <button
                onClick={fetchRates}
                className="text-stone-500 hover:text-quantum-600 p-1 rounded-lg transition-colors"
                title="Refresh Rates"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-stone-500 font-medium">
                <Loader2 className="w-6 h-6 animate-spin text-quantum-600 mx-auto mb-2" />
                Loading rates...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-ice-100 text-left text-xs">
                  <thead className="text-stone-500 uppercase font-semibold">
                    <tr>
                      <th className="px-6 py-3">Currency Pair</th>
                      <th className="px-6 py-3">Multiplier Rate</th>
                      <th className="px-6 py-3">Source</th>
                      <th className="px-6 py-3 text-right">Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ice-100">
                    {rates.map((r) => (
                      <tr key={r.id} className="hover:bg-white/60 transition-colors">
                        <td className="px-6 py-3.5 font-bold text-stone-900 font-mono">
                          {r.base_currency} / {r.quote_currency}
                        </td>
                        <td className="px-6 py-3.5 font-mono text-quantum-700 font-semibold">
                          {r.rate}
                        </td>
                        <td className="px-6 py-3.5 text-stone-600">
                          {r.source || 'Admin Managed'}
                        </td>
                        <td className="px-6 py-3.5 text-right font-mono text-stone-500 text-[11px]">
                          {new Date(r.updated_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Update Rate Form */}
          <div className="glass-panel-elevated rounded-2xl p-6 shadow-xs h-fit space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-ice-200">
              <TrendingUp className="w-4 h-4 text-quantum-600" />
              <h2 className="text-xs uppercase font-bold text-stone-900 tracking-wider">
                Update Display Rate
              </h2>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Target Currency</label>
                <select
                  value={form.quote_currency}
                  onChange={(e) => setForm({ ...form, quote_currency: e.target.value })}
                  className="w-full px-3 py-2 border border-ice-300 rounded-xl bg-white/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum-500 font-mono"
                >
                  <option value="USD">USD (US Dollar)</option>
                  <option value="NGN">NGN (Nigerian Naira)</option>
                  <option value="KES">KES (Kenyan Shilling)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Multiplier Rate</label>
                <input
                  type="number"
                  step="0.00000001"
                  required
                  value={form.rate}
                  onChange={(e) => setForm({ ...form, rate: e.target.value })}
                  placeholder={form.quote_currency === 'USD' ? '0.00038' : '0.58'}
                  className="w-full px-3 py-2 border border-ice-300 rounded-xl font-mono bg-white/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum-500"
                />
                <span className="text-[11px] text-stone-500 mt-1 block">
                  1 TZS * Multiplier = Converted Value.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Rate Source Label</label>
                <input
                  type="text"
                  required
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                  className="w-full px-3 py-2 border border-ice-300 rounded-xl bg-white/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum-500"
                />
              </div>

              <button
                type="submit"
                disabled={updating || !form.rate}
                className="w-full py-2 px-4 glass-button text-white rounded-xl font-semibold shadow-xs disabled:opacity-50 flex items-center justify-center transition-all"
              >
                <Save className="w-3.5 h-3.5 mr-1.5" />
                {updating ? 'Updating...' : 'Save Exchange Rate'}
              </button>
            </form>
          </div>
        </div>
      </main>

      <footer className="glass-panel border-t border-ice-200 py-6 text-center text-xs text-stone-500 mt-12">
        <p>&copy; {new Date().getFullYear()} WILRICH STORE. Currency Configuration.</p>
      </footer>
    </div>
  );
}
