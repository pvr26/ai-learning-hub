import axios from 'axios';

// Debug log to check environment variable
console.log('API URL:', process.env.REACT_APP_API_URL);

// Create axios instance with base URL
const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',  // Use environment variable with fallback
  withCredentials: true,  // Enable sending cookies
  headers: {
    'Content-Type': 'application/json'
  },
  paramsSerializer: {
    encode: (param) => encodeURIComponent(param),
  },
});

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance;
