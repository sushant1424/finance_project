import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import analyticsApi from '@/api/analyticsApi';

export const fetchDashboard = createAsyncThunk('analytics/dashboard', async (_, { rejectWithValue }) => {
  try {
    return await analyticsApi.dashboard();
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Failed to load dashboard');
  }
});

export const fetchCashflow = createAsyncThunk(
  'analytics/cashflow',
  async (months = 6, { rejectWithValue }) => {
    try {
      return await analyticsApi.cashflow(months);
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to load cashflow');
    }
  },
);

export const fetchCategoryBreakdown = createAsyncThunk(
  'analytics/categories',
  async ({ dateFrom, dateTo }, { rejectWithValue }) => {
    try {
      return await analyticsApi.categories(dateFrom, dateTo);
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to load categories');
    }
  },
);

export const fetchMonthlyComparison = createAsyncThunk(
  'analytics/monthly',
  async (year, { rejectWithValue }) => {
    try {
      return await analyticsApi.monthly(year);
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to load monthly data');
    }
  },
);

export const fetchSpendingTrend = createAsyncThunk(
  'analytics/trend',
  async ({ dateFrom, dateTo, alpha }, { rejectWithValue }) => {
    try {
      return await analyticsApi.trend(dateFrom, dateTo, alpha);
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to load trend');
    }
  },
);

export const fetchInsights = createAsyncThunk('analytics/insights', async (_, { rejectWithValue }) => {
  try {
    return await analyticsApi.insights();
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Failed to load insights');
  }
});

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: {
    dashboard: null,
    insights: null,
    cashflow: [],
    categories: [],
    monthly: [],
    trend: null,
    loading: false,
    error: null,
    trendAlpha: 0.3,
  },
  reducers: {
    setTrendAlpha: (state, action) => {
      state.trendAlpha = action.payload;
    },
    clearAnalytics: (state) => {
      state.dashboard = null;
      state.insights = null;
      state.cashflow = [];
      state.categories = [];
      state.monthly = [];
      state.trend = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => { state.loading = true; })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCashflow.fulfilled, (state, action) => { state.cashflow = action.payload; })
      .addCase(fetchCategoryBreakdown.fulfilled, (state, action) => { state.categories = action.payload; })
      .addCase(fetchMonthlyComparison.fulfilled, (state, action) => { state.monthly = action.payload; })
      .addCase(fetchSpendingTrend.fulfilled, (state, action) => { state.trend = action.payload; })
      .addCase(fetchInsights.fulfilled, (state, action) => { state.insights = action.payload; });
  },
});

export const { setTrendAlpha, clearAnalytics } = analyticsSlice.actions;
export default analyticsSlice.reducer;
