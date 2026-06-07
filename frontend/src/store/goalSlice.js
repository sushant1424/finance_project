import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import goalApi from '@/api/goalApi';

export const fetchGoals = createAsyncThunk('goals/fetch', async (_, { rejectWithValue }) => {
  try {
    return await goalApi.list();
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Failed to load goals');
  }
});

export const createGoal = createAsyncThunk('goals/create', async (data, { rejectWithValue }) => {
  try {
    return await goalApi.create(data);
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Failed to create goal');
  }
});

export const updateGoal = createAsyncThunk(
  'goals/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await goalApi.update(id, data);
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to update goal');
    }
  },
);

export const deleteGoal = createAsyncThunk('goals/delete', async (id, { rejectWithValue }) => {
  try {
    await goalApi.remove(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Failed to delete goal');
  }
});

export const contributeToGoal = createAsyncThunk(
  'goals/contribute',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await goalApi.contribute(id, data);
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to add contribution');
    }
  },
);

const goalSlice = createSlice({
  name: 'goals',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGoals.pending, (state) => { state.loading = true; })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createGoal.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateGoal.fulfilled, (state, action) => {
        const idx = state.items.findIndex((g) => g.id === action.payload.id);
        if (idx >= 0) state.items[idx] = action.payload;
      })
      .addCase(deleteGoal.fulfilled, (state, action) => {
        state.items = state.items.filter((g) => g.id !== action.payload);
      })
      .addCase(contributeToGoal.fulfilled, (state, action) => {
        const idx = state.items.findIndex((g) => g.id === action.payload.id);
        if (idx >= 0) state.items[idx] = action.payload;
      });
  },
});

export default goalSlice.reducer;
