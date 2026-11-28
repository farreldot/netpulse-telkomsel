import { handleExpiredSession } from '../utils/sessionManager';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Helper untuk melakukan HTTP Request ke Backend REST API
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('netpulse_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    let data;
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      if (response.status === 401) {
        handleExpiredSession('expired');
      }
      const error = new Error(data.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.status === 401) {
      handleExpiredSession('expired');
    }
    console.error(`[API Error] ${endpoint}:`, err);
    throw err;
  }
}

// 1. Auth Service
export const authApi = {
  login: (credentials) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  getProfile: () => request('/auth/me', {
    method: 'GET',
  }),
};

// 2. BTS Sites Service
export const sitesApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/sites${query ? `?${query}` : ''}`, { method: 'GET' });
  },
  getById: (id) => request(`/sites/${id}`, { method: 'GET' }),
  create: (siteData) => request('/sites', {
    method: 'POST',
    body: JSON.stringify(siteData),
  }),
  update: (id, siteData) => request(`/sites/${id}`, {
    method: 'PUT',
    body: JSON.stringify(siteData),
  }),
  delete: (id) => request(`/sites/${id}`, {
    method: 'DELETE',
  }),
};

// 3. Signal Logs Service
export const signalLogsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/signal-logs${query ? `?${query}` : ''}`, { method: 'GET' });
  },
  getById: (id) => request(`/signal-logs/${id}`, { method: 'GET' }),
  create: (logData) => request('/signal-logs', {
    method: 'POST',
    body: JSON.stringify(logData),
  }),
  delete: (id) => request(`/signal-logs/${id}`, {
    method: 'DELETE',
  }),
};

// 4. Users Management Service (Admin Only)
export const usersApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/users${query ? `?${query}` : ''}`, { method: 'GET' });
  },
  getById: (id) => request(`/users/${id}`, { method: 'GET' }),
  create: (userData) => request('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  update: (id, userData) => request(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),
  delete: (id) => request(`/users/${id}`, {
    method: 'DELETE',
  }),
};

export default {
  auth: authApi,
  sites: sitesApi,
  signalLogs: signalLogsApi,
  users: usersApi,
};
