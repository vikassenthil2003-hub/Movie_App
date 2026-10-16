import axios from 'axios';

// Normalize API base URL so that both relative '/api/v1' and absolute URLs work reliably
const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim();
const API_BASE_URL = rawApiUrl
  ? rawApiUrl.replace(/\/+$/, '').endsWith('/api/v1')
    ? rawApiUrl.replace(/\/+$/, '')
    : rawApiUrl.replace(/\/+$/, '').endsWith('/api')
    ? `${rawApiUrl.replace(/\/+$/, '')}/v1`
    : `${rawApiUrl.replace(/\/+$/, '')}/api/v1`
  : '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cineverse_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for automatic error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0]?.message ||
      error.message ||
      'An unexpected error occurred.';

    if (error.code === 'ERR_NETWORK' || message === 'Network Error') {
      message = 'Cannot connect to backend server. Please verify the API is running at http://localhost:5000.';
    }

    // If 401 and token exists, clear expired token
    if (error.response?.status === 401 && localStorage.getItem('cineverse_token')) {
      // Don't auto logout on public page calls
      if (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/my-bookings')) {
        localStorage.removeItem('cineverse_token');
        localStorage.removeItem('cineverse_user');
        window.location.href = '/login';
      }
    }

    return Promise.reject({
      message,
      status: error.response?.status,
      data: error.response?.data,
      response: error.response,
    });
  }
);

export default api;