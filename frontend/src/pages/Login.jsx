import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectAfterLogin = (user) => {
    const from = location.state?.from?.pathname;
    if (from && from !== '/login') {
      navigate(from, { replace: true });
      return;
    }

    if (user.role === 'super_admin') {
      navigate('/admin', { replace: true });
    } else if (user.role === 'vendor') {
      navigate('/vendor', { replace: true });
    } else {
      navigate('/app', { replace: true });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const user = await login(email, password, remember);
      redirectAfterLogin(user);
    } catch (err) {
      setError(
        err.response?.data?.errors?.email?.[0] ||
        err.response?.data?.message ||
        'Unable to sign in. Please verify your credentials.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setSubmitting(true);
    try {
      const user = await login(demoEmail, demoPassword, false);
      redirectAfterLogin(user);
    } catch (err) {
      setError(err.response?.data?.message || 'Quick login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="w-12 h-12 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-xl mx-auto tracking-wider shadow-xs">
          WS
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
          Sign in to WILRICH STORE
        </h2>
        <p className="mt-1 text-center text-sm text-slate-600">
          Or{' '}
          <Link to="/register" className="font-medium text-slate-900 underline hover:text-slate-700">
            register for a customer account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xs border border-slate-200 sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-6 p-3 bg-rose-50 border border-rose-200 rounded text-rose-800 text-sm flex items-start">
              <AlertCircle className="w-4 h-4 mr-2 mt-0.5 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="email">
                Email address
              </label>
              <div className="relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="password">
                Password
              </label>
              <div className="relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 mr-2"
                />
                Remember me
              </label>
              <span className="text-xs text-slate-500">Secure Sanctum Cookie Session</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 transition-colors shadow-xs"
            >
              {submitting ? 'Authenticating...' : 'Sign in'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </form>

          {/* Quick Demo Logins for Easy Phase Verification */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
              Quick Test Accounts (Seeded)
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@wilrichstore.com', 'Password123!')}
                className="p-2 border border-emerald-200 bg-emerald-50 text-emerald-900 rounded font-medium text-left hover:bg-emerald-100 transition-colors"
              >
                <div className="font-semibold">Super Admin</div>
                <div className="text-[10px] text-emerald-700 truncate">admin@wilrichstore.com</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('vendor1@wilrichstore.com', 'Password123!')}
                className="p-2 border border-indigo-200 bg-indigo-50 text-indigo-900 rounded font-medium text-left hover:bg-indigo-100 transition-colors"
              >
                <div className="font-semibold">Vendor 1 (Alpha)</div>
                <div className="text-[10px] text-indigo-700 truncate">vendor1@wilrichstore.com</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('vendor2@wilrichstore.com', 'Password123!')}
                className="p-2 border border-indigo-200 bg-indigo-50 text-indigo-900 rounded font-medium text-left hover:bg-indigo-100 transition-colors"
              >
                <div className="font-semibold">Vendor 2 (Bravo)</div>
                <div className="text-[10px] text-indigo-700 truncate">vendor2@wilrichstore.com</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('customer@wilrichstore.com', 'Password123!')}
                className="p-2 border border-blue-200 bg-blue-50 text-blue-900 rounded font-medium text-left hover:bg-blue-100 transition-colors"
              >
                <div className="font-semibold">Customer (John)</div>
                <div className="text-[10px] text-blue-700 truncate">customer@wilrichstore.com</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

