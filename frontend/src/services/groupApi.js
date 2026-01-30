import api from './api';

export const groupApi = {
  // Get all groups accessible to the user
  getAll: async () => {
    return await api.get('/groups');
  },

  // Get a specific group
  getById: async (id) => {
    return await api.get(`/groups/${id}`);
  },

  // Create a new group
  create: async (groupData) => {
    return await api.post('/groups', groupData);
  },

  // Update a group
  update: async (id, groupData) => {
    return await api.put(`/groups/${id}`, groupData);
  },

  // Delete a group
  delete: async (id) => {
    return await api.delete(`/groups/${id}`);
  },

  // Add a member to a group
  addMember: async (groupId, userId) => {
    return await api.post(`/groups/${groupId}/members`, { userId });
  },

  // Remove a member from a group
  removeMember: async (groupId, userId) => {
    return await api.delete(`/groups/${groupId}/members/${userId}`);
  },
};
