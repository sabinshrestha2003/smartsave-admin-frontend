import axios from 'axios';

// Use an absolute base URL to avoid proxy issues during development
const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token ? 'Present' : 'Not Present');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
    // Log the full URL for debugging
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log('API Request:', config.method.toUpperCase(), fullUrl, config.headers);
    return config;
  },
  (error) => {
    console.error('Error in request interceptor:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.data);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('API Response Error:', error.response.data || error.message);
      if (error.response.status === 401 && error.config.url !== '/auth/logout') {
        const token = localStorage.getItem('token');
        if (token) {
          console.log('Received 401 (not logout) with token, clearing token...');
          localStorage.removeItem('token');
        } else {
          console.log('Received 401, but no token present—ignoring');
        }
      }
    } else {
      console.error('Network Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;