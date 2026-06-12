import client from '@/api/client';

export const budgetApi = {
  list: async (month, year) => {
    const res = await client.get('/budgets', { params: { month, year } });
    return res.data;
  },

  summary: async (month, year) => {
    const res = await client.get('/budgets/summary', { params: { month, year } });
    return res.data;
  },

  create: async (data) => {
    const res = await client.post('/budgets', data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await client.put(`/budgets/${id}`, data);
    return res.data;
  },

  remove: async (id) => {
    const res = await client.delete(`/budgets/${id}`);
    return res.data;
  },

  suggestions: async (month, year) => {
    const res = await client.get('/budgets/suggestions', { params: { month, year } });
    return res.data;
  },
};

export default budgetApi;
