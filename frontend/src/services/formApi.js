import api from './api';

export const formApi = {
  getAllForms: (params) => api.get('/forms', { params }),
  getForm: (id) => api.get(`/forms/${id}`),
  createForm: (data) => api.post('/forms', data),
  updateForm: (id, data) => api.put(`/forms/${id}`, data),
  deleteForm: (id) => api.delete(`/forms/${id}`),
  validateFormData: (id, data) => api.post(`/forms/${id}/validate`, { data }),
  renderForm: (id) => api.get(`/forms/${id}/render`),
};

export default formApi;
