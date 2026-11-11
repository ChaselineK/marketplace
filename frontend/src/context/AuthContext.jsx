import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient, { getCsrfCookie } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCurrentUser = async () => {
    try {
      const res = await apiClient.get('/me');
      setUser(res.data.user);
      setError(null);
      return res.data.user;
    } catch (err) {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email, password, remember = false) => {
    setError(null);
    await getCsrfCookie();
    const res = await apiClient.post('/login', {
      email,
      password,
      remember,
    });
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (userData) => {
    setError(null);
    await getCsrfCookie();
    const res = await apiClient.post('/register', userData);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = async () => {
    try {
      await apiClient.post('/logout');
    } catch (err) {
      console.warn('Logout error ignored:', err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role,
        isSuperAdmin: user?.role === 'super_admin',
        isVendor: user?.role === 'vendor',
        isCustomer: user?.role === 'customer',
        loading,
        error,
        login,
        register,
        logout,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

