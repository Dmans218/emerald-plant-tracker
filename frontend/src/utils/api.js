import axios from 'axios';

// In production (single container), use relative paths
// In development, use the environment variable or default to localhost:420
const API_BASE_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:420');

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.error || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// Plants API
export const plantsApi = {
  getAll: (params) => api.get('/plants', { params }),
  getById: (id) => api.get(`/plants/${id}`),
  create: (data) => api.post('/plants', data),
  update: (id, data) => api.put(`/plants/${id}`, data),
  delete: (id) => api.delete(`/plants/${id}`),
  getGrowTents: () => api.get('/plants/grow-tents'),
};

// Logs API
export const logsApi = {
  getAll: (params) => api.get('/logs', { params }),
  getById: (id) => api.get(`/logs/${id}`),
  create: (data) => api.post('/logs', data),
  delete: (id) => api.delete(`/logs/${id}`),
  uploadPhoto: (formData) => api.post('/logs/photo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getStats: (plantId) => api.get(`/logs/stats/${plantId}`),
};

// Environment API
export const environmentApi = {
  getAll: (params) => api.get('/environment', { params }),
  getLatest: (params) => api.get('/environment/latest', { params }),
  getWeekly: (params) => api.get('/environment/weekly', { params }),
  create: (data) => api.post('/environment', data),
  update: (id, data) => api.put(`/environment/${id}`, data),
  delete: (id) => api.delete(`/environment/${id}`),
  getGrowTents: () => api.get('/environment/grow-tents'),
};

// Health check
export const healthApi = {
  check: () => api.get('/health'),
};

export default api; 