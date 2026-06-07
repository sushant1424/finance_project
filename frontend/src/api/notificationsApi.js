import client from '@/api/client';

export const notificationsApi = {
  list: async () => {
    const res = await client.get('/notifications');
    return res.data;
  },

  markRead: async (id) => {
    const res = await client.put(`/notifications/${id}/read`);
    return res.data;
  },
};

export default notificationsApi;
