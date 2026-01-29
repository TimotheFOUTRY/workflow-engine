import api from './api';

export const taskApi = {
  getMyTasks: (params) => api.get('/tasks/my-tasks', { params }),
  getTask: (id) => api.get(`/tasks/${id}`),
  completeTask: (id, data) => api.post(`/tasks/${id}/complete`, data),
  reassignTask: (id, assignedTo) => api.post(`/tasks/${id}/reassign`, { assignedTo }),
  updateTaskStatus: (id, status) => api.put(`/tasks/${id}/status`, { status }),
  getTaskStatistics: () => api.get('/tasks/statistics'),
};

export default taskApi;
