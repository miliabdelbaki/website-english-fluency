import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

const STORAGE_TOKEN_KEY = 'pfe_token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_TOKEN_KEY) || '');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!token);

  useEffect(() => {
    if (token) {
      localStorage.setItem(STORAGE_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(STORAGE_TOKEN_KEY);
    }
  }, [token]);

  useEffect(() => {
    // If we already have a token but no user (page refresh), fetch current user.
    const fetchUser = async () => {
      if (!token || user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await api.get('/api/auth/me');
        setUser(response.data.student);
      } catch {
        setToken('');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token, user]);

  const signIn = useCallback((newToken, userData) => {
    setToken(newToken);
    setUser(userData);
    setLoading(false);
  }, []);

  const signOut = useCallback(() => {
    setToken('');
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      signIn,
      signOut,
    }),
    [token, user, loading, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
