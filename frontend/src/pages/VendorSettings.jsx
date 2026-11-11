import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import { Store, Phone, CheckCircle, AlertCircle, ExternalLink, Save, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function VendorSettings() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    store_name: '',
    whatsapp_number: '',
    description: '',
    is_published: true,
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/vendor/profile');
      const data = res.data.data;
      setProfile(data);
      setFormData({
        store_name: data.store_name || '',
        whatsapp_number: data.whatsapp_number || '',
        description: data.description || '',
        is_published: data.is_published ?? true,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load storefront profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await apiClient.patch('/vendor/profile', formData);
      setProfile(res.data.data);
      setSuccess('Storefront profile updated successfully.');
      await refreshUser();
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        setError(Object.values(errors)[0][0]);
      } else {
        setError(err.response?.data?.message || 'Failed to update profile.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between page-transition">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="glass-panel-elevated rounded-2xl p-6 sm:p-8 mb-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-quantum-700 bg-quantum-50 px-2.5 py-1 rounded-full border border-quantum-200">
                Storefront Settings
              </span>
              <h1 className="text-2xl font-bold text-stone-900 tracking-tight mt-2.5">
                Manage Your Storefront
              </h1>
              <p className="text-sm text-stone-600 mt-1">
                Update your public store name, WhatsApp fulfilment contact, and store description.
              </p>
            </div>

            {profile?.store_slug && (
              <Link
                to={`/app/vendors/${profile.store_slug}`}
                target="_blank"
                className="inline-flex items-center text-xs font-semibold text-stone-800 hover:text-quantum-600 border border-ice-300 rounded-xl px-3 py-2 bg-white/80 hover:bg-white transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1.5 text-quantum-600" />
                Live Storefront
              </Link>
            )}
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

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-sm flex items-center shadow-xs">
            <AlertCircle className="w-4 h-4 mr-2 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-sm font-medium">
            <Loader2 className="w-8 h-8 animate-spin text-quantum-600 mx-auto mb-2" />
            <p className="text-stone-700">Loading profile...</p>
          </div>
        ) : (
          <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-xs">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1" htmlFor="store_name">
                  Store Display Name *
                </label>
                <input
                  id="store_name"
                  type="text"
                  name="store_name"
                  required
                  value={formData.store_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-ice-300 rounded-xl text-sm bg-white/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum-500 text-stone-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1" htmlFor="store_slug">
                  Storefront Slug (Permanent Identifier)
                </label>
                <input
                  id="store_slug"
                  type="text"
                  disabled
                  value={profile?.store_slug || ''}
                  className="w-full px-3 py-2 border border-ice-200 rounded-xl text-sm bg-ice-50 font-mono text-stone-500 cursor-not-allowed"
                />
                <span className="text-[11px] text-stone-400 mt-1 block">
                  Public URL: /app/vendors/{profile?.store_slug}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1" htmlFor="whatsapp_number">
                  WhatsApp Contact Number (Without + or spaces) *
                </label>
                <div className="relative rounded-xl shadow-2xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    id="whatsapp_number"
                    type="text"
                    name="whatsapp_number"
                    required
                    value={formData.whatsapp_number}
                    onChange={handleChange}
                    placeholder="255712345678"
                    className="block w-full pl-10 pr-3 py-2 border border-ice-300 rounded-xl text-sm bg-white/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum-500 text-stone-800 font-mono"
                  />
                </div>
                <span className="text-[11px] text-stone-500 mt-1 block">
                  Format: Country code + number (e.g., 255712345678). Used for automated handoff chat links.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1" htmlFor="description">
                  Storefront Description &amp; Policies
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Tell customers about your accounts, CP delivery speed, and operational hours..."
                  className="w-full px-3 py-2 border border-ice-300 rounded-xl text-sm bg-white/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum-500 text-stone-800"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  id="is_published"
                  type="checkbox"
                  name="is_published"
                  checked={formData.is_published}
                  onChange={handleChange}
                  className="rounded border-ice-300 text-quantum-600 focus:ring-quantum-500 cursor-pointer"
                />
                <label htmlFor="is_published" className="text-xs font-semibold text-stone-700 cursor-pointer select-none">
                  Publish Storefront (Visible in public Vendor Directory and search)
                </label>
              </div>

              <div className="pt-4 border-t border-ice-200 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2.5 glass-button text-white rounded-xl text-sm font-semibold shadow-xs disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Store Profile'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      <footer className="glass-panel border-t border-ice-200 py-6 text-center text-xs text-stone-500 mt-12">
        <p>&copy; {new Date().getFullYear()} WILRICH STORE. Vendor Settings.</p>
      </footer>
    </div>
  );
}
