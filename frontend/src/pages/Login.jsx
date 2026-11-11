import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 page-transition">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-2xl mx-auto tracking-wider glass-button shadow-lg">
          WS
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-stone-900">
          Sign in to WILRICH STORE
        </h2>
        <p className="mt-1 text-center text-sm text-stone-600">
          Or{' '}
          <Link to="/register" className="font-semibold text-quantum-600 hover:text-quantum-700 underline">
            register for a customer account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="glass-panel-elevated py-8 px-6 shadow-xl sm:rounded-2xl sm:px-10 border border-ice-200">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 mr-1 mt-0.5 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1" htmlFor="email">
                Email address
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="block w-full pl-10 pr-3 py-2.5 border border-ice-300 rounded-xl text-sm placeholder-stone-400 bg-white/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum-500 focus:border-quantum-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1" htmlFor="password">
                Password
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 border border-ice-300 rounded-xl text-sm placeholder-stone-400 bg-white/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum-500 focus:border-quantum-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center text-stone-600 select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-ice-300 text-quantum-600 focus:ring-quantum-500 mr-2"
                />
                Remember me
              </label>
              <span className="text-stone-400 font-mono">Quantum Auth</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex justify-center items-center py-2.5 px-4 rounded-xl text-sm font-semibold glass-button disabled:opacity-50 transition-all shadow-md"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign in <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins for Easy Phase Verification */}
          <div className="mt-8 pt-6 border-t border-ice-200">
            <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-3 flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-quantum-600" />
              Quick Test Accounts (Seeded)
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@wilrichstore.com', 'Password123!')}
                className="p-2 border border-quantum-200 bg-quantum-50/70 text-stone-900 rounded-xl font-medium text-left hover:bg-quantum-100 transition-colors"
              >
                <div className="font-semibold text-quantum-700">Super Admin</div>
                <div className="text-[10px] text-stone-500 truncate">admin@wilrichstore.com</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('vendor1@wilrichstore.com', 'Password123!')}
                className="p-2 border border-ice-300 bg-white/70 text-stone-900 rounded-xl font-medium text-left hover:bg-white transition-colors"
              >
                <div className="font-semibold text-stone-900">Vendor 1 (Alpha)</div>
                <div className="text-[10px] text-stone-500 truncate">vendor1@wilrichstore.com</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('vendor2@wilrichstore.com', 'Password123!')}
                className="p-2 border border-ice-300 bg-white/70 text-stone-900 rounded-xl font-medium text-left hover:bg-white transition-colors"
              >
                <div className="font-semibold text-stone-900">Vendor 2 (Bravo)</div>
                <div className="text-[10px] text-stone-500 truncate">vendor2@wilrichstore.com</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('customer@wilrichstore.com', 'Password123!')}
                className="p-2 border border-ice-300 bg-white/70 text-stone-900 rounded-xl font-medium text-left hover:bg-white transition-colors"
              >
                <div className="font-semibold text-stone-900">Customer (John)</div>
                <div className="text-[10px] text-stone-500 truncate">customer@wilrichstore.com</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
