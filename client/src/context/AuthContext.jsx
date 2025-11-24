import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api, { setAuthToken } from '../lib/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const TOKEN_KEY = 'df_token';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      setAuthToken(storedToken);
      fetchProfile(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
    } catch (error) {
      console.error('Fetch profile error:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const { data } = await api.post('/auth/login', credentials);
      setAuthToken(data.token);
      localStorage.setItem(TOKEN_KEY, data.token);
      setUser(data.user);
      toast.success('Welcome back!');
      return data.user;
    } catch (error) {
      const message = error.response?.data?.message || 'Unable to sign in';
      toast.error(message);
      throw error;
    }
  };

  const register = async (payload) => {
    try {
      const { data } = await api.post('/auth/register', payload);
      setAuthToken(data.token);
      localStorage.setItem(TOKEN_KEY, data.token);
      setUser(data.user);
      toast.success('Account created');
      return data.user;
    } catch (error) {
      const message = error.response?.data?.message || 'Unable to register';
      toast.error(message);
      throw error;
    }
  };

  const requestPasswordReset = async (email) => {
    try {
      await api.post('/auth/request-reset', { email });
      toast.success('If the email exists, you will receive instructions');
    } catch (error) {
      const message = error.response?.data?.message || 'Unable to send reset link';
      toast.error(message);
      throw error;
    }
  };

  const resetPassword = async (payload) => {
    try {
      await api.post('/auth/reset-password', payload);
      toast.success('Password updated');
    } catch (error) {
      const message = error.response?.data?.message || 'Unable to reset password';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setAuthToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'admin',
    login,
    register,
    requestPasswordReset,
    resetPassword,
    logout,
    refreshProfile: fetchProfile
  }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
