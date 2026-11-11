import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const apiUrl = import.meta.env.VITE_API_URL || `${apiBaseUrl}/api/v1`;

export const apiClient = axios.create({
  baseURL: apiUrl,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  withXSRFToken: true,
});

// Direct client for non-versioned endpoints like /sanctum/csrf-cookie
export const rootClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json',
  },
  withCredentials: true,
  withXSRFToken: true,
});

export const getCsrfCookie = async () => {
  return rootClient.get('/sanctum/csrf-cookie');
};

export default apiClient;

