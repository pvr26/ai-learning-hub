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
    console.log('Making request to:', config.url);
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Adding token to request headers');
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('No token found in localStorage');
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
instance.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status);
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.status);
    if (error.response?.status === 401) {
      console.log('Unauthorized, redirecting to login');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance;
