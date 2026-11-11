import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import { Store, Phone, CheckCircle, AlertCircle, ExternalLink, Save } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 mb-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200">
                Storefront Settings
              </span>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-2">
                Manage Your Storefront
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Update your public store name, WhatsApp fulfilment contact, and store description.
              </p>
            </div>

            {profile?.store_slug && (
              <Link
                to={`/app/vendors/${profile.store_slug}`}
                target="_blank"
                className="inline-flex items-center text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 rounded px-3 py-2 bg-slate-50"
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                View Public Storefront
              </Link>
            )}
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

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">Loading settings...</div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-xs">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Public Store Name
                </label>
                <input
                  name="store_name"
                  type="text"
                  required
                  value={formData.store_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Store Slug (Public URL Identifier)
                </label>
                <input
                  type="text"
                  disabled
                  value={profile?.store_slug || ''}
                  className="w-full px-3 py-2 border border-slate-200 rounded text-sm bg-slate-100 text-slate-500 font-mono cursor-not-allowed"
                />
                <span className="text-xs text-slate-500 mt-1 block">
                  Store slugs are assigned and guarded by the platform.
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  WhatsApp Contact Number (International Format)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    name="whatsapp_number"
                    type="text"
                    required
                    value={formData.whatsapp_number}
                    onChange={handleChange}
                    placeholder="255712345678"
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded text-sm font-mono focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <span className="text-xs text-slate-500 mt-1 block">
                  Digits only without + or spaces (e.g. 255712345678). Used for prefilled WhatsApp order handoff.
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Storefront Description
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Tell customers about your accounts, CP delivery speed, and operational hours..."
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <label className="flex items-center text-sm font-medium text-slate-700 select-none">
                  <input
                    type="checkbox"
                    name="is_published"
                    checked={formData.is_published}
                    onChange={handleChange}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 mr-2"
                  />
                  Publish storefront to marketplace
                </label>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-xs"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} WILRICH STORE. Vendor Settings.</p>
      </footer>
    </div>
  );
}

