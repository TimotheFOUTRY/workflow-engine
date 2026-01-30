import api from './api';

export const assigneeApi = {
  getAssignees: (search = '', limit = 10) => 
    api.get('/assignees', { params: { search, limit } })
};
