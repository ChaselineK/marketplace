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
    <div className="min-h-screen flex items-center justify-center p-4 page-transition">
      <div className="max-w-md w-full glass-panel-elevated rounded-2xl p-8 shadow-xl text-center">
        <div className="w-14 h-14 rounded-2xl bg-quantum-50 border border-quantum-200 flex items-center justify-center text-quantum-600 mx-auto mb-4 shadow-sm">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold text-stone-900 mb-2">403 &bull; Authorization Boundary</h1>
        <p className="text-sm text-stone-600 mb-6 leading-relaxed">
          You do not have clearance to access this portal or resource. Access is strictly controlled by backend role authorization policies.
        </p>
        <Link
          to={getHomePath()}
          className="inline-flex items-center justify-center px-4 py-2.5 glass-button rounded-xl text-sm font-semibold shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Return to My Workspace
        </Link>
      </div>
    </div>
  );
}
