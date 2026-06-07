import client from '@/api/client';

export const netWorthApi = {
  listSnapshots: async () => {
    const res = await client.get('/networth/snapshots');
    return res.data;
  },

  createSnapshot: async (data) => {
    const res = await client.post('/networth/snapshot', data);
    return res.data;
  },

  deleteSnapshot: async (id) => {
    const res = await client.delete(`/networth/snapshot/${id}`);
    return res.data;
  },
};

export default netWorthApi;
