import client from '@/api/client';

export const analyticsApi = {
  dashboard: async () => {
    const res = await client.get('/analytics/dashboard');
    return res.data;
  },

  cashflow: async (months = 6) => {
    const res = await client.get('/analytics/cashflow', { params: { months } });
    return res.data;
  },

  categories: async (dateFrom, dateTo) => {
    const res = await client.get('/analytics/categories', {
      params: { date_from: dateFrom, date_to: dateTo },
    });
    return res.data;
  },

  monthly: async (year) => {
    const res = await client.get('/analytics/monthly', { params: { year } });
    return res.data;
  },

  trend: async (dateFrom, dateTo, alpha = 0.3) => {
    const res = await client.get('/analytics/trend', {
      params: { date_from: dateFrom, date_to: dateTo, alpha },
    });
    return res.data;
  },

  dayOfWeek: async (dateFrom, dateTo) => {
    const res = await client.get('/analytics/day-of-week', {
      params: { date_from: dateFrom, date_to: dateTo },
    });
    return res.data;
  },

  insights: async () => {
    const res = await client.get('/analytics/insights');
    return res.data;
  },

  digest: async () => {
    const res = await client.get('/analytics/digest');
    return res.data;
  },
};

export default analyticsApi;
