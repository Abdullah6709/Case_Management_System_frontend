// Centralized API Configuration for Frontend
// Default deployed backend URL: https://case-management-system-backend-s9ko.onrender.com
export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://case-management-system-backend-s9ko.onrender.com').replace(/\/$/, '');

export const API_ENDPOINTS = {
  BASE: API_BASE_URL,
  AUTH: `${API_BASE_URL}/api/auth`,
  SUPER_ADMIN: `${API_BASE_URL}/api/superadmin`,
  MASTERS: `${API_BASE_URL}/api/masters`,
  FIRM: `${API_BASE_URL}/api/firm`,
  UPLOADS: `${API_BASE_URL}/uploads`,
};

export default API_BASE_URL;
