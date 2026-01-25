import React, { createContext, useState, useEffect } from 'react';
import { checkAuth, logout as logoutAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await checkAuth();
        setUser(res.user);
        setIsAuthenticated(true);
      } catch {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };
  const logout = async () => {
    try {
      await logoutAPI();
    } catch (error) {
      console.log('Logout error:', error.message);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };
  const value = {
    user,
    setUser,
    isAuthenticated,
    setIsAuthenticated,
    loading,
    setLoading,
    login,
    logout,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
