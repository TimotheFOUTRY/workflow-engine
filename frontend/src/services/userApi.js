import api from './api';

export const userApi = {
  // User management (admin)
  getAllUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  createUser: (userData) => api.post('/users', userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
  resetPassword: (id) => api.post(`/users/${id}/reset-password`),
  
  // User approval
  getPendingUsers: () => api.get('/users/pending'),
  approveUser: (id) => api.post(`/users/${id}/approve`),
  rejectUser: (id) => api.post(`/users/${id}/reject`),
  
  // Statistics
  getUserStatistics: () => api.get('/users/statistics'),
};

export default userApi;
