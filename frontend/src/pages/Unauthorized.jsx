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
    <div className="min-h-screen bg-cream-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-cream-300 rounded-xl p-8 shadow-xs text-center">
        <div className="w-12 h-12 rounded-full bg-torch-50 border border-torch-200 flex items-center justify-center text-torch-600 mx-auto mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-stone-900 mb-2">403 — Access Denied</h1>
        <p className="text-sm text-stone-600 mb-6 leading-relaxed">
          You do not have permission to access this portal or resource. Access is strictly controlled by backend role authorization policies.
        </p>
        <Link
          to={getHomePath()}
          className="inline-flex items-center justify-center px-4 py-2 bg-torch-500 hover:bg-torch-600 text-white rounded text-sm font-semibold transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Return to My Portal
        </Link>
      </div>
    </div>
  );
}
