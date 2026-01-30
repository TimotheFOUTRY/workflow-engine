import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const instanceApi = {
  getInstance: async (id) => {
    const response = await axios.get(`${API_URL}/instances/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },

  getInstancesByWorkflow: async (workflowId) => {
    const response = await axios.get(`${API_URL}/instances/workflow/${workflowId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },

  subscribe: async (instanceId) => {
    const response = await axios.post(
      `${API_URL}/instances/${instanceId}/subscribe`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  },

  unsubscribe: async (instanceId) => {
    const response = await axios.delete(
      `${API_URL}/instances/${instanceId}/subscribe`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  }
};

export default instanceApi;
