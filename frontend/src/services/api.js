import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses (expired/invalid token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jt_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Applications
export const getApplications = (params) => api.get('/applications', { params });
export const getApplication = (id) => api.get(`/applications/${id}`);

export const createApplication = (data) => {
  if (data.resume) {
    const formData = new FormData();
    formData.append('company', data.company);
    formData.append('role', data.role);
    formData.append('dateApplied', data.dateApplied);
    formData.append('priority', data.priority);
    formData.append('status', data.status);
    formData.append('notes', data.notes || '');
    formData.append('jobUrl', data.jobUrl || '');
    formData.append('resume', data.resume);
    return api.post('/applications', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
  return api.post('/applications', data);
};

export const updateApplication = (id, data) => {
  if (data.resume) {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (key === 'resume') {
        formData.append('resume', data.resume);
      } else if (data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return api.put(`/applications/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
  return api.put(`/applications/${id}`, data);
};

export const deleteApplication = (id) => api.delete(`/applications/${id}`);

// Resume
export const uploadResume = (id, file) => {
  const formData = new FormData();
  formData.append('resume', file);
  return api.post(`/applications/${id}/resume`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteResume = (id) => api.delete(`/applications/${id}/resume`);

// Stats & Notifications
export const getStats = () => api.get('/applications/stats');
export const getNotifications = () => api.get('/applications/notifications');

export default api;
