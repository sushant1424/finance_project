import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import budgetApi from '@/api/budgetApi';
import { getApiErrorMessage } from '@/utils/apiError';

const now = new Date();

export const fetchBudgets = createAsyncThunk(
  'budgets/fetch',
  async ({ month, year }, { rejectWithValue }) => {
    try {
      return await budgetApi.list(month, year);
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, 'Failed to load budgets'));
    }
  },
);

export const fetchBudgetSummary = createAsyncThunk(
  'budgets/fetchSummary',
  async ({ month, year }, { rejectWithValue }) => {
    try {
      return await budgetApi.summary(month, year);
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, 'Failed to load budget summary'));
    }
  },
);

export const createBudget = createAsyncThunk(
  'budgets/create',
  async (data, { rejectWithValue }) => {
    try {
      return await budgetApi.create(data);
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, 'Failed to create budget'));
    }
  },
);

export const updateBudget = createAsyncThunk(
  'budgets/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await budgetApi.update(id, data);
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, 'Failed to update budget'));
    }
  },
);

export const deleteBudget = createAsyncThunk(
  'budgets/delete',
  async (id, { rejectWithValue }) => {
    try {
      await budgetApi.remove(id);
      return id;
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, 'Failed to delete budget'));
    }
  },
);

const budgetSlice = createSlice({
  name: 'budgets',
  initialState: {
    items: [],
    summary: null,
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    loading: false,
    error: null,
  },
  reducers: {
    setMonthYear: (state, action) => {
      state.month = action.payload.month;
      state.year = action.payload.year;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBudgets.pending, (state) => { state.loading = true; })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchBudgetSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
      })
      .addCase(createBudget.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateBudget.fulfilled, (state, action) => {
        const idx = state.items.findIndex((b) => b.id === action.payload.id);
        if (idx >= 0) state.items[idx] = action.payload;
      })
      .addCase(deleteBudget.fulfilled, (state, action) => {
        state.items = state.items.filter((b) => b.id !== action.payload);
      });
  },
});

export const { setMonthYear } = budgetSlice.actions;
export default budgetSlice.reducer;
