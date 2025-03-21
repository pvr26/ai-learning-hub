import axios from '../utils/axios';

const authService = {
  async login(username, password) {
    try {
      const response = await axios.post('/api/auth/login', { username, password });
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
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
      const response = await axios.get('/api/auth/me');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },

  logout() {
    localStorage.removeItem('token');
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
};

export default authService; 