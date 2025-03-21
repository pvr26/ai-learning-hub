import axios from '../utils/axios';

const authService = {
  async login(username, password) {
    try {
      console.log('Attempting login...');
      const response = await axios.post('/api/auth/login', { username, password });
      console.log('Login response:', response.data);
      
      if (response.data.access_token) {
        console.log('Setting token in localStorage');
        localStorage.setItem('token', response.data.access_token);
        console.log('Token set successfully');
        return response.data;
      }
      throw new Error('No token received');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async register(username, password) {
    try {
      const response = await axios.post('/api/auth/register', { username, password });
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  async getCurrentUser() {
    try {
      console.log('Getting current user...');
      const token = localStorage.getItem('token');
      console.log('Current token:', token ? 'Present' : 'Missing');
      
      const response = await axios.get('/api/auth/me');
      console.log('Current user response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      if (error.response?.status === 401) {
        console.log('Token expired or invalid, clearing...');
        this.logout();
      }
      throw error;
    }
  },

  logout() {
    console.log('Logging out...');
    localStorage.removeItem('token');
    console.log('Token removed from localStorage');
  },

  isAuthenticated() {
    const token = localStorage.getItem('token');
    console.log('Checking authentication:', token ? 'Authenticated' : 'Not authenticated');
    return !!token;
  }
};

export default authService; 