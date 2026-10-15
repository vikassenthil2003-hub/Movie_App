import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('cineverse_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('cineverse_token') || null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('cineverse_token', token);
    } else {
      localStorage.removeItem('cineverse_token');
      localStorage.removeItem('cineverse_user');
    }
  }, [token]);

  /**
   * Unified Login
   * @param {string} email
   * @param {string} password
   * @param {'user'|'admin'|'theatre'} loginMode
   */
  const login = async (email, password, loginMode = 'user') => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', {
        email,
        password,
        loginMode,
      });

      const payload = res.data || res;
      const receivedToken = payload.token;
      const receivedUser = payload.user;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('cineverse_user', JSON.stringify(receivedUser));
      return receivedUser;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Public Registration (Always role 'user')
   * Supports both an object argument `{ name, email, password, ... }` or positional args
   */
  const register = async (nameOrData, email, password, phone, preferences, referredBy) => {
    setIsLoading(true);
    try {
      let payload;
      if (typeof nameOrData === 'object' && nameOrData !== null) {
        payload = {
          name: nameOrData.name || nameOrData.fullName,
          email: nameOrData.email,
          password: nameOrData.password,
          phone: nameOrData.phone || nameOrData.mobileNumber || '',
          preferredCity: nameOrData.preferredCity || nameOrData.city || 'Chennai',
          preferences: nameOrData.preferences || { city: nameOrData.preferredCity || nameOrData.city || 'Chennai' },
          referredBy: nameOrData.referredBy || null,
        };
      } else {
        payload = {
          name: nameOrData,
          email,
          password,
          phone: phone || '',
          preferences: preferences || { city: 'Chennai' },
          referredBy: referredBy || null,
        };
      }

      const res = await api.post('/auth/register', payload);

      const payloadData = res.data || res;
      const receivedToken = payloadData.token;
      const receivedUser = payloadData.user;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('cineverse_user', JSON.stringify(receivedUser));
      return receivedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('cineverse_token');
    localStorage.removeItem('cineverse_user');
  };

  const updateUserState = (updatedFields) => {
    setUser((prev) => {
      const nextUser = { ...prev, ...updatedFields };
      localStorage.setItem('cineverse_user', JSON.stringify(nextUser));
      return nextUser;
    });
  };

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    isCustomer: user?.role === 'user',
    isTheatre: user?.role === 'theatre',
    canBook: user?.role !== 'admin',
    isLoading,
    login,
    register,
    logout,
    updateUserState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
