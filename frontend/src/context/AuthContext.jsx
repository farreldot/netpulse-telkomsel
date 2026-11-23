import React, { createContext, useContext, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('netpulse_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('netpulse_token') || null);
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const response = await authApi.login({ username, password });
      if (response.success && response.token) {
        setToken(response.token);
        setUser(response.user);
        localStorage.setItem('netpulse_token', response.token);
        localStorage.setItem('netpulse_user', JSON.stringify(response.user));
        return { success: true, user: response.user };
      }
      throw new Error(response.message || 'Login gagal.');
    } catch (err) {
      console.error('[Login Error]', err);
      return {
        success: false,
        message: err.data?.message || err.message || 'Gagal login. Periksa username dan password.',
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('netpulse_token');
    localStorage.removeItem('netpulse_user');
  };

  const isAdmin = user?.role === 'admin';
  const isMitra = user?.role === 'mitra';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAdmin,
        isMitra,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Komponen pembungkus untuk memproteksi rute privat
 */
export const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/sites" replace />;
  }

  return children;
};
