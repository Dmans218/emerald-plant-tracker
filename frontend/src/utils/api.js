import axios from 'axios';

// Relative paths in production (same origin). Dev server proxies /api via package.json proxy.
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 15000,
});

api.interceptors.response.use(
  (response) => response.data,
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
  archive: (id, data) => api.post(`/plants/${id}/archive`, data),
  unarchive: (archivedGrowId) => api.post(`/plants/archived/${archivedGrowId}/unarchive`),
  getArchivedGrows: () => api.get('/plants/archived'),
  getArchivedGrow: (id) => api.get(`/plants/archived/${id}`),
  exportArchivedGrow: (id) =>
    api.get(`/plants/archived/${id}/export`, {
      responseType: 'blob',
      headers: { Accept: 'text/csv' },
    }),
  exportArchivedTent: (tentName) =>
    api.get(`/plants/archived/tent/${encodeURIComponent(tentName)}/export`, {
      responseType: 'blob',
      headers: { Accept: 'text/csv' },
    }),
  clearTentEnvironmentData: (tentName, confirm = true, force = false) =>
    api.delete(`/plants/tent/${encodeURIComponent(tentName)}/environment`, {
      data: { confirm, force },
    }),
  getTentSummary: (tentName) =>
    api.get(`/plants/tent/${encodeURIComponent(tentName)}/summary`),
};

// Tents API (first-class tent surface)
export const tentsApi = {
  list: () => api.get('/tents'),
  getSummary: (tentName) => api.get(`/tents/${encodeURIComponent(tentName)}/summary`),
  clearEnvironment: (tentName, confirm = true, force = false) =>
    api.delete(`/tents/${encodeURIComponent(tentName)}/environment`, { data: { confirm, force } }),
};

// Logs API
export const logsApi = {
  getAll: (params) => api.get('/logs', { params }),
  getById: (id) => api.get(`/logs/${id}`),
  create: (data) => api.post('/logs', data),
  update: (id, data) => api.put(`/logs/${id}`, data),
  delete: (id) => api.delete(`/logs/${id}`),
  uploadPhoto: (formData) =>
    api.post('/logs/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getStats: (plantId) => api.get(`/logs/stats/${plantId}`),
};

// Environment API
export const environmentApi = {
  getAll: (params) => api.get('/environment', { params }),
  getLatest: (params) => api.get('/environment/latest', { params }),
  getLatestPerTent: () => api.get('/environment/latest-per-tent'),
  getWeekly: (params) => api.get('/environment/weekly', { params }),
  create: (data) => api.post('/environment', data),
  update: (id, data) => api.put(`/environment/${id}`, data),
  delete: (id) => api.delete(`/environment/${id}`),
  getGrowTents: () => api.get('/environment/grow-tents'),
};

// Health / backup
export const healthApi = {
  check: () => api.get('/health'),
};

export const backupApi = {
  download: () =>
    api.get('/backup', {
      responseType: 'blob',
    }),
};

export default api;
