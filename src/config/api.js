// Centralized API Configuration for Frontend
// Default local backend API URL: http://localhost:5000
export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

export const API_ENDPOINTS = {
  BASE: API_BASE_URL,
  AUTH: `${API_BASE_URL}/api/auth`,
  SUPER_ADMIN: `${API_BASE_URL}/api/superadmin`,
  MASTERS: `${API_BASE_URL}/api/masters`,
  FIRM: `${API_BASE_URL}/api/firm`,
  UPLOADS: `${API_BASE_URL}/uploads`,
};

export default API_BASE_URL;
