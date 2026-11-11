import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Lock, AlertCircle, ArrowRight, Shield, Loader2 } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password_confirmation) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await register(formData);
      navigate('/app', { replace: true });
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        const firstErrorKey = Object.keys(errors)[0];
        setError(errors[firstErrorKey][0]);
      } else {
        setError(err.response?.data?.message || 'Registration failed. Please check your inputs.');
      }
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
          Create customer account
        </h2>
        <p className="mt-1 text-center text-sm text-stone-600">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-quantum-600 hover:text-quantum-700 underline">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="glass-panel-elevated py-8 px-6 shadow-xl sm:rounded-2xl sm:px-10 border border-ice-200">
          <div className="mb-6 p-3 bg-quantum-50/70 border border-quantum-200 rounded-xl text-stone-800 text-xs flex items-start space-x-2">
            <Shield className="w-4 h-4 mr-1 mt-0.5 shrink-0 text-quantum-600" />
            <div>
              <strong>Security Policy:</strong> Public registration assigns the <strong>Customer</strong> role. Vendor accounts are exclusively provisioned by the Super Admin.
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 mr-1 mt-0.5 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1" htmlFor="name">
                Full name
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="block w-full pl-10 pr-3 py-2 border border-ice-300 rounded-xl text-sm placeholder-stone-400 bg-white/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum-500 focus:border-quantum-500 transition-colors"
                />
              </div>
            </div>

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
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="block w-full pl-10 pr-3 py-2 border border-ice-300 rounded-xl text-sm placeholder-stone-400 bg-white/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum-500 focus:border-quantum-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1" htmlFor="phone">
                Phone / WhatsApp number
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+255 700 000 000"
                  className="block w-full pl-10 pr-3 py-2 border border-ice-300 rounded-xl text-sm placeholder-stone-400 bg-white/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum-500 focus:border-quantum-500 transition-colors"
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
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2 border border-ice-300 rounded-xl text-sm placeholder-stone-400 bg-white/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum-500 focus:border-quantum-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1" htmlFor="password_confirmation">
                Confirm password
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password_confirmation"
                  name="password_confirmation"
                  type="password"
                  required
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2 border border-ice-300 rounded-xl text-sm placeholder-stone-400 bg-white/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum-500 focus:border-quantum-500 transition-colors"
                />
              </div>
            </div>

            <p className="text-[11px] text-stone-500 pt-1 leading-normal">
              By registering, you agree to WILRICH STORE{' '}
              <Link to="/terms" className="text-quantum-600 underline">Terms of Service</Link> and{' '}
              <Link to="/policies" className="text-quantum-600 underline">Buyer Protection Policy</Link>.
            </p>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex justify-center items-center py-2.5 px-4 rounded-xl text-sm font-semibold glass-button disabled:opacity-50 transition-all shadow-md mt-4"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Creating account...
                </>
              ) : (
                <>
                  Register as Customer <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
