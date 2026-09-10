import client from '@/api/client';

export const recurringBillApi = {
  list: async (params = {}) => {
    const res = await client.get('/recurring-bills', { params });
    return res.data;
  },

  create: async (data) => {
    const res = await client.post('/recurring-bills', data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await client.put(`/recurring-bills/${id}`, data);
    return res.data;
  },

  remove: async (id) => {
    const res = await client.delete(`/recurring-bills/${id}`);
    return res.data;
  },

  recordPayment: async (id, payDate) => {
    const res = await client.post(`/recurring-bills/${id}/pay`, null, {
      params: payDate ? { pay_date: payDate } : {},
    });
    return res.data;
  },
};

export default recurringBillApi;
