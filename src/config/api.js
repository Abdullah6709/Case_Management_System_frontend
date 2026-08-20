// Centralized API Configuration for Frontend
// Fallback to the live Render backend in production, or localhost in local development
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  const isLocal = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  return isLocal ? 'http://localhost:5000' : 'https://case-management-system-backend-s9ko.onrender.com';
};

export const API_BASE_URL = getApiBaseUrl().replace(/\/$/, '');

export const API_ENDPOINTS = {
  BASE: API_BASE_URL,
  AUTH: `${API_BASE_URL}/api/auth`,
  SUPER_ADMIN: `${API_BASE_URL}/api/superadmin`,
  MASTERS: `${API_BASE_URL}/api/masters`,
  FIRM: `${API_BASE_URL}/api/firm`,
  UPLOADS: `${API_BASE_URL}/uploads`,
};

export default API_BASE_URL;
