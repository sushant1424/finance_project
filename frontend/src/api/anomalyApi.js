import client from '@/api/client';

export const anomalyApi = {
  list: async (params = {}) => {
    const res = await client.get('/anomalies', { params });
    return res.data;
  },

  review: async (transactionId) => {
    const res = await client.put(`/anomalies/${transactionId}/review`);
    return res.data;
  },

  recalculate: async () => {
    const res = await client.post('/anomalies/recalculate');
    return res.data;
  },
};

export default anomalyApi;
