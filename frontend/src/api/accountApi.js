import client from '@/api/client';

export const accountApi = {
  list: async () => {
    const res = await client.get('/accounts');
    return res.data;
  },
  get: async (id) => {
    const res = await client.get(`/accounts/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await client.post('/accounts', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await client.put(`/accounts/${id}`, data);
    return res.data;
  },
  setDefault: async (id) => {
    const res = await client.post(`/accounts/${id}/set-default`);
    return res.data;
  },
  remove: async (id) => {
    const res = await client.delete(`/accounts/${id}`);
    return res.data;
  },
};

export default accountApi;
