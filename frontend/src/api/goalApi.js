import client from '@/api/client';

export const goalApi = {
  list: async () => {
    const res = await client.get('/goals');
    return res.data;
  },

  create: async (data) => {
    const res = await client.post('/goals', data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await client.put(`/goals/${id}`, data);
    return res.data;
  },

  remove: async (id) => {
    const res = await client.delete(`/goals/${id}`);
    return res.data;
  },

  contribute: async (id, data) => {
    const res = await client.post(`/goals/${id}/contribute`, data);
    return res.data;
  },

  getContributions: async (id) => {
    const res = await client.get(`/goals/${id}/contributions`);
    return res.data;
  },
};

export default goalApi;
