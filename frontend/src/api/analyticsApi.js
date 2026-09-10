import client from "@/api/client";

export const analyticsApi = {
  dashboard: async () => {
    const res = await client.get("/analytics/dashboard");
    return res.data;
  },

  cashflow: async (months = 6) => {
    const res = await client.get("/analytics/cashflow", { params: { months } });
    return res.data;
  },

  categories: async (dateFrom, dateTo) => {
    const res = await client.get("/analytics/categories", {
      params: { date_from: dateFrom, date_to: dateTo },
    });
    return res.data;
  },

  monthly: async (year) => {
    const res = await client.get("/analytics/monthly", { params: { year } });
    return res.data;
  },

  savingsRate: async () => {
    const res = await client.get("/analytics/savings-rate");
    return res.data;
  },

  spendingClusters: async () => {
    const res = await client.get("/analytics/spending-clusters");
    return res.data;
  },

  monthlyRecap: async (month, year) => {
    const res = await client.get("/analytics/monthly-recap", {
      params: {
        ...(month != null ? { month } : {}),
        ...(year != null ? { year } : {}),
      },
    });
    return res.data;
  },

  anomalies: async (period = "this_month", includeAcknowledged = false) => {
    const res = await client.get("/analytics/anomalies", {
      params: { period, include_acknowledged: includeAcknowledged },
    });
    return res.data;
  },
};

export default analyticsApi;
