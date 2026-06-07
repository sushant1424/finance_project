import client from '@/api/client';

export const transactionApi = {
  list: async (params = {}) => {
    const res = await client.get('/transactions', { params });
    return res.data;
  },

  create: async (data) => {
    const res = await client.post('/transactions', data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await client.put(`/transactions/${id}`, data);
    return res.data;
  },

  remove: async (id) => {
    const res = await client.delete(`/transactions/${id}`);
    return res.data;
  },

  bulkDelete: async (ids) => {
    const res = await client.delete('/transactions/bulk', { data: { ids } });
    return res.data;
  },

  exportCsv: async (params = {}) => {
    const res = await client.get('/transactions/export', {
      params,
      responseType: 'blob',
    });
    return res.data;
  },
};

export default transactionApi;
