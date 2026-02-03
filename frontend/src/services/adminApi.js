import api from './api';

export const adminApi = {
  getAllInstances: (params) => api.get('/admin/instances', { params }),
  getAllTasks: (params) => api.get('/admin/tasks', { params }),
  getWorkflowAnalytics: (params) => api.get('/admin/analytics', { params }),
  getInstanceHistory: (instanceId) => api.get(`/admin/instances/${instanceId}/history`),
  getSystemStatistics: () => api.get('/admin/statistics'),
  getAllUsers: () => api.get('/admin/users'),
};

export default adminApi;
