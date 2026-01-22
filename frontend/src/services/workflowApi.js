import api from './api';

export const workflowApi = {
  // Workflows
  getAllWorkflows: (params) => api.get('/workflows', { params }),
  getWorkflow: (id) => api.get(`/workflows/${id}`),
  createWorkflow: (data) => api.post('/workflows', data),
  updateWorkflow: (id, data) => api.put(`/workflows/${id}`, data),
  deleteWorkflow: (id) => api.delete(`/workflows/${id}`),
  
  // Workflow instances
  startWorkflow: (id, data) => api.post(`/workflows/${id}/start`, { data }),
  getWorkflowInstances: (id, params) => api.get(`/workflows/${id}/instances`, { params }),
  getWorkflowInstance: (instanceId) => api.get(`/workflows/instances/${instanceId}`),
  cancelWorkflowInstance: (instanceId) => api.post(`/workflows/instances/${instanceId}/cancel`),
};

export default workflowApi;
