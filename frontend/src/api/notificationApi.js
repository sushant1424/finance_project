import client from '@/api/client';

export const notificationApi = {
  list: async () => {
    const res = await client.get('/notifications');
    return res.data;
  },
  markRead: async (id) => {
    const res = await client.put(`/notifications/${encodeURIComponent(id)}/read`);
    return res.data;
  },
  markAllRead: async () => {
    const res = await client.put('/notifications/read-all');
    return res.data;
  },
};

export default notificationApi;
