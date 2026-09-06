import client from '@/api/client';

export const categoryApi = {
  list: async () => {
    const res = await client.get('/categories');
    return res.data;
  },
  create: async (data) => {
    const res = await client.post('/categories', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await client.put(`/categories/${id}`, data);
    return res.data;
  },
  remove: async (id) => {
    const res = await client.delete(`/categories/${id}`);
    return res.data;
  },
};

export default categoryApi;
