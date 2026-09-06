import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import transactionApi from "@/api/transactionApi";
import { getApiErrorMessage } from "@/utils/apiError";

export const fetchTransactions = createAsyncThunk(
  "transactions/fetch",
  async (params, { rejectWithValue }) => {
    try {
      return await transactionApi.list(params);
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, "Failed to load transactions"));
    }
  },
);

export const createTransaction = createAsyncThunk(
  "transactions/create",
  async (data, { rejectWithValue }) => {
    try {
      return await transactionApi.create(data);
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, "Failed to create transaction"));
    }
  },
);

export const updateTransaction = createAsyncThunk(
  "transactions/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await transactionApi.update(id, data);
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, "Failed to update transaction"));
    }
  },
);

export const deleteTransaction = createAsyncThunk(
  "transactions/delete",
  async (id, { rejectWithValue }) => {
    try {
      await transactionApi.remove(id);
      return id;
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, "Failed to delete transaction"));
    }
  },
);

export const bulkDeleteTransactions = createAsyncThunk(
  "transactions/bulkDelete",
  async (ids, { rejectWithValue }) => {
    try {
      await transactionApi.bulkDelete(ids);
      return ids;
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, "Failed to delete transactions"));
    }
  },
);

const transactionSlice = createSlice({
  name: "transactions",
  initialState: {
    items: [],
    total: 0,
    page: 1,
    filters: { sort_by: "date", sort_order: "desc", page: 1, limit: 10 },
    loading: false,
    error: null,
    selectedIds: [],
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    toggleSelect: (state, action) => {
      const id = action.payload;
      const idx = state.selectedIds.indexOf(id);
      if (idx >= 0) state.selectedIds.splice(idx, 1);
      else state.selectedIds.push(id);
    },
    clearSelection: (state) => {
      state.selectedIds = [];
    },
    selectAll: (state) => {
      state.selectedIds = state.items.map((t) => t.id);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items ?? action.payload;
        state.total = action.payload.total ?? state.items.length;
        state.page = action.payload.page ?? state.filters.page;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.total += 1;
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        const idx = state.items.findIndex((t) => t.id === action.payload.id);
        if (idx >= 0) state.items[idx] = action.payload;
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t.id !== action.payload);
        state.selectedIds = state.selectedIds.filter(
          (id) => id !== action.payload,
        );
        state.total -= 1;
      })
      .addCase(bulkDeleteTransactions.fulfilled, (state, action) => {
        const ids = new Set(action.payload);
        state.items = state.items.filter((t) => !ids.has(t.id));
        state.selectedIds = [];
        state.total -= action.payload.length;
      });
  },
});

export const { setFilters, toggleSelect, clearSelection, selectAll } =
  transactionSlice.actions;
export default transactionSlice.reducer;
