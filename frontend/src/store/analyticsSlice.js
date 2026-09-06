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

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: {
    dashboard: null,
    cashflow: [],
    categories: [],
    monthly: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearAnalytics: (state) => {
      state.dashboard = null;
      state.cashflow = [];
      state.categories = [];
      state.monthly = [];
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
      .addCase(fetchMonthlyComparison.fulfilled, (state, action) => { state.monthly = action.payload; });
  },
});

export const { clearAnalytics } = analyticsSlice.actions;
export default analyticsSlice.reducer;
