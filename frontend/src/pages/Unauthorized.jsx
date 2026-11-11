import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function Unauthorized() {
  const { user, isSuperAdmin, isVendor } = useAuth();

  const getHomePath = () => {
    if (!user) return '/login';
    if (isSuperAdmin) return '/admin';
    if (isVendor) return '/vendor';
    return '/app';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-lg p-8 shadow-xs text-center">
        <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">403 — Access Denied</h1>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          You do not have permission to access this portal or resource. Access is strictly controlled by backend role authorization policies.
        </p>
        <Link
          to={getHomePath()}
          className="inline-flex items-center justify-center px-4 py-2 bg-slate-900 text-white rounded text-sm font-medium hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Return to My Portal
        </Link>
      </div>
    </div>
  );
}

