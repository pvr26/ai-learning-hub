import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from '../utils/axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('token');
    console.log('AuthProvider - Initial token check:', token ? 'Present' : 'Missing');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('checkAuth - Token:', token ? 'Present' : 'Missing');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get('/api/auth/me');
      console.log('checkAuth - User data:', response.data);
      setUser(response.data);
    } catch (error) {
      console.error('checkAuth - Error:', error.response?.status, error.response?.data);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      setError(null);
      console.log('Login attempt for user:', username);
      const response = await axios.post('/api/auth/login', {
        username,
        password,
      });

      const { access_token, user } = response.data;
      console.log('Login successful - Setting token and user data');
      localStorage.setItem('token', access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      setUser(user);
      return user;
    } catch (error) {
      console.error('Login error:', error.response?.status, error.response?.data);
      setError(error.response?.data?.error || 'Login failed');
      throw error;
    }
  };

  const register = async (username, password) => {
    try {
      setError(null);
      console.log('Register attempt for user:', username);
      await axios.post('/api/auth/register', {
        username,
        password,
      });
      return login(username, password);
    } catch (error) {
      console.error('Registration error:', error.response?.status, error.response?.data);
      setError(error.response?.data?.error || 'Registration failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('Logout initiated');
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      console.log('Logout completed');
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 