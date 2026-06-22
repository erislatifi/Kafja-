// ============================================================
// API SERVICE - Lidhja me Backend (Kafe Nlagje - PRO IT)
// ============================================================
import axios from 'axios';

// VENDOSE adresen e backend-it tend ketu (.env ne build kohe ose direkt)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Shton token-in JWT ne çdo kerkese
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kafe_nlagje_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Nese token-i skadon, kthen perdoruesin ne login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('kafe_nlagje_token');
      localStorage.removeItem('kafe_nlagje_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
