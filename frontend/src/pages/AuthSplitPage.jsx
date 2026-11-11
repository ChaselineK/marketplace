import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Lock,
  Mail,
  User,
  Phone,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Loader2,
  Gamepad2,
  Coins,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import CodmLogo from '../components/common/CodmLogo';

export default function AuthSplitPage({ initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode);
  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Keep internal mode in sync with route if user navigates back/forward
  useEffect(() => {
    if (location.pathname === '/register') {
      setMode('register');
    } else if (location.pathname === '/login') {
      setMode('login');
    }
  }, [location.pathname]);

  // Handle switching tabs and updating the URL cleanly
  const handleSwitchMode = (targetMode) => {
    setMode(targetMode);
    if (targetMode === 'login' && location.pathname !== '/login') {
      navigate('/login', { replace: true, state: location.state });
    } else if (targetMode === 'register' && location.pathname !== '/register') {
      navigate('/register', { replace: true, state: location.state });
    }
  };

  // Redirect if already logged in
  const redirectAfterAuth = (authUser) => {
    const from = location.state?.from?.pathname;
    if (from && from !== '/login' && from !== '/register') {
      navigate(from, { replace: true });
      return;
    }

    if (authUser.role === 'super_admin') {
      navigate('/admin', { replace: true });
    } else if (authUser.role === 'vendor') {
      navigate('/vendor', { replace: true });
    } else {
      navigate('/app', { replace: true });
    }
  };

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  // Register Form State
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  });
  const [registerError, setRegisterError] = useState('');
  const [registerSubmitting, setRegisterSubmitting] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginSubmitting(true);

    try {
      const loggedUser = await login(loginEmail, loginPassword, remember);
      redirectAfterAuth(loggedUser);
    } catch (err) {
      setLoginError(
        err.response?.data?.errors?.email?.[0] ||
        err.response?.data?.message ||
        'Unable to sign in. Please verify your email and password.'
      );
    } finally {
      setLoginSubmitting(false);
    }
  };

  const handleRegisterChange = (e) => {
    setRegisterData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');

    if (registerData.password !== registerData.password_confirmation) {
      setRegisterError('Passwords do not match.');
      return;
    }

    setRegisterSubmitting(true);
    try {
      const createdUser = await register(registerData);
      redirectAfterAuth(createdUser);
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        const firstErrorKey = Object.keys(errors)[0];
        setRegisterError(errors[firstErrorKey][0]);
      } else {
        setRegisterError(err.response?.data?.message || 'Registration failed. Please check your inputs.');
      }
    } finally {
      setRegisterSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-6 lg:p-8 page-transition">
      {/* Split Card Container */}
      <div className="w-full max-w-6xl glass-panel-elevated rounded-3xl overflow-hidden shadow-2xl border border-ice-200 grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        
        {/* Left Side: Store Intro & Mode Switch Buttons (30% Coca Brown) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-coca-950 via-coca-900 to-coca-950 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Ambient Glow Orbs */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-electric-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blush-400/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Intro Section */}
          <div className="relative z-10">
            {/* Official Call of Duty: Mobile Black Logo & Branding */}
            <div className="flex items-center space-x-3.5 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-black overflow-hidden flex items-center justify-center shadow-lg shrink-0">
                <img src="/codm-logo.jpg" alt="Call of Duty: Mobile" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase tracking-widest text-electric-300">
                  Call of Duty: Mobile
                </span>
                <span className="text-[10px] text-blush-200/80 font-medium">
                  Authoritative Intermediary Hub
                </span>
              </div>
            </div>

            {/* Store Name - Exactly 1 line, Two-tone, Heavy Font Weight */}
            <div className="text-2xl sm:text-3xl font-black tracking-tight whitespace-nowrap flex items-center mb-3">
              <span className="text-white">WILRICH</span>
              <span className="text-electric-400 ml-2">STORE</span>
            </div>

            <p className="text-xs sm:text-sm text-blush-200 leading-relaxed max-w-md">
              The premier marketplace for verified Call of Duty: Mobile accounts, mythic blueprints, and instant CP packages with secure WhatsApp fulfillment.
            </p>

            {/* Feature Highlights */}
            <div className="mt-8 space-y-3.5">
              <div className="flex items-start space-x-3">
                <div className="w-7 h-7 rounded-lg bg-electric-500/20 border border-electric-400/30 flex items-center justify-center text-electric-300 shrink-0 mt-0.5">
                  <Gamepad2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Verified CODM Accounts</div>
                  <div className="text-[11px] text-blush-200 leading-tight">Inspect mythic weapons, legendary armories, and confirmed progression.</div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-7 h-7 rounded-lg bg-electric-500/20 border border-electric-400/30 flex items-center justify-center text-electric-300 shrink-0 mt-0.5">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Competitive CP Bundles</div>
                  <div className="text-[11px] text-blush-200 leading-tight">Vendor-backed pricing with immediate WhatsApp fulfillment handoffs.</div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-7 h-7 rounded-lg bg-electric-500/20 border border-electric-400/30 flex items-center justify-center text-electric-300 shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Direct Dispute Mediation</div>
                  <div className="text-[11px] text-blush-200 leading-tight">Open support tickets with verified image evidence and admin mediation.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Switcher: 2 Buttons (Login & Register) */}
          <div className="relative z-10 mt-8 pt-6 border-t border-white/15">
            <div className="text-[11px] font-bold uppercase tracking-wider text-blush-300 mb-2.5">
              Choose Action
            </div>
            <div className="grid grid-cols-2 gap-3 bg-white/10 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
              <button
                type="button"
                onClick={() => handleSwitchMode('login')}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                  mode === 'login'
                    ? 'bg-electric-600 text-white shadow-md shadow-electric-600/40 ring-1 ring-white/20'
                    : 'text-blush-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>Sign In</span>
                {mode === 'login' && <CheckCircle2 className="w-3.5 h-3.5 ml-1 text-blush-200" />}
              </button>

              <button
                type="button"
                onClick={() => handleSwitchMode('register')}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                  mode === 'register'
                    ? 'bg-electric-600 text-white shadow-md shadow-electric-600/40 ring-1 ring-white/20'
                    : 'text-blush-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>Register</span>
                {mode === 'register' && <CheckCircle2 className="w-3.5 h-3.5 ml-1 text-blush-200" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Form (Login or Register with Smooth Transition) */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white/70 backdrop-blur-md relative">
          
          {/* Form Switch Transition */}
          <div className="max-w-md mx-auto w-full page-transition" key={mode}>
            {mode === 'login' ? (
              /* LOGIN FORM */
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl sm:text-3xl font-black text-coca-950 tracking-tight">
                    Sign In to <span className="whitespace-nowrap"><span className="text-coca-950">WILRICH</span> <span className="text-electric-600">STORE</span></span>
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600 mt-1">
                    Enter your account credentials to continue trading or managing storefronts.
                  </p>
                </div>

                {loginError && (
                  <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-start space-x-2 shadow-2xs">
                    <AlertCircle className="w-4 h-4 mr-1 mt-0.5 shrink-0 text-red-600" />
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1" htmlFor="login-email">
                      Email Address *
                    </label>
                    <div className="relative rounded-xl shadow-2xs">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        id="login-email"
                        type="email"
                        required
                        autoComplete="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-ice-300 rounded-xl text-sm bg-white/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum-500 focus:border-quantum-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1" htmlFor="login-password">
                      Password *
                    </label>
                    <div className="relative rounded-xl shadow-2xs">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="login-password"
                        type="password"
                        required
                        autoComplete="current-password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-ice-300 rounded-xl text-sm bg-white/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum-500 focus:border-quantum-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex items-center text-xs pt-1">
                    <label className="flex items-center text-stone-600 select-none cursor-pointer">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="rounded border-ice-300 text-quantum-600 focus:ring-quantum-500 mr-2 cursor-pointer"
                      />
                      Remember this session
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loginSubmitting}
                    className="w-full flex justify-center items-center py-2.5 px-4 rounded-xl text-sm font-bold text-white glass-button disabled:opacity-50 transition-all shadow-md mt-2 cursor-pointer"
                  >
                    {loginSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Authenticating...
                      </>
                    ) : (
                      <>
                        Sign In <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              /* REGISTER FORM */
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Create Customer Account
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600 mt-1">
                    Get started with verified account orders and live WhatsApp vendor handoffs.
                  </p>
                </div>

                {registerError && (
                  <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-start space-x-2 shadow-2xs">
                    <AlertCircle className="w-4 h-4 mr-1 mt-0.5 shrink-0 text-red-600" />
                    <span>{registerError}</span>
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1" htmlFor="register-name">
                      Full Name *
                    </label>
                    <div className="relative rounded-xl shadow-2xs">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        id="register-name"
                        name="name"
                        type="text"
                        required
                        value={registerData.name}
                        onChange={handleRegisterChange}
                        className="block w-full pl-10 pr-3 py-2 border border-ice-300 rounded-xl text-sm bg-white/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum-500 focus:border-quantum-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1" htmlFor="register-email">
                      Email Address *
                    </label>
                    <div className="relative rounded-xl shadow-2xs">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        id="register-email"
                        name="email"
                        type="email"
                        required
                        value={registerData.email}
                        onChange={handleRegisterChange}
                        className="block w-full pl-10 pr-3 py-2 border border-ice-300 rounded-xl text-sm bg-white/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum-500 focus:border-quantum-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* WhatsApp Phone */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1" htmlFor="register-phone">
                      WhatsApp Phone Number (Optional)
                    </label>
                    <div className="relative rounded-xl shadow-2xs">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        id="register-phone"
                        name="phone"
                        type="tel"
                        value={registerData.phone}
                        onChange={handleRegisterChange}
                        className="block w-full pl-10 pr-3 py-2 border border-ice-300 rounded-xl text-sm bg-white/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum-500 focus:border-quantum-500 transition-colors font-mono"
                      />
                    </div>
                    <span className="text-[10px] text-stone-500 mt-1 block">
                      Include country code (e.g. 255682850544) for instant WhatsApp handoffs.
                    </span>
                  </div>

                  {/* Passwords grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1" htmlFor="register-password">
                        Password *
                      </label>
                      <div className="relative rounded-xl shadow-2xs">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          id="register-password"
                          name="password"
                          type="password"
                          required
                          value={registerData.password}
                          onChange={handleRegisterChange}
                          className="block w-full pl-10 pr-3 py-2 border border-ice-300 rounded-xl text-sm bg-white/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum-500 focus:border-quantum-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1" htmlFor="register-confirm">
                        Confirm Password *
                      </label>
                      <div className="relative rounded-xl shadow-2xs">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          id="register-confirm"
                          name="password_confirmation"
                          type="password"
                          required
                          value={registerData.password_confirmation}
                          onChange={handleRegisterChange}
                          className="block w-full pl-10 pr-3 py-2 border border-ice-300 rounded-xl text-sm bg-white/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum-500 focus:border-quantum-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={registerSubmitting}
                    className="w-full flex justify-center items-center py-2.5 px-4 rounded-xl text-sm font-bold text-white glass-button disabled:opacity-50 transition-all shadow-md mt-4 cursor-pointer"
                  >
                    {registerSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Creating Customer Account...
                      </>
                    ) : (
                      <>
                        Complete Registration <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center text-xs text-stone-500">
                  By registering, you agree to WILRICH STORE{' '}
                  <Link to="/policies" className="text-quantum-600 underline hover:text-quantum-700">
                    Terms of Service &amp; Policies
                  </Link>.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
