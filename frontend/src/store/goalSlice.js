import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import goalApi from '@/api/goalApi';
import { getApiErrorMessage } from '@/utils/apiError';

export const fetchGoals = createAsyncThunk('goals/fetch', async (_, { rejectWithValue }) => {
  try {
    return await goalApi.list();
  } catch (err) {
    return rejectWithValue(getApiErrorMessage(err, 'Failed to load goals'));
  }
});

export const createGoal = createAsyncThunk('goals/create', async (data, { rejectWithValue }) => {
  try {
    return await goalApi.create(data);
  } catch (err) {
    return rejectWithValue(getApiErrorMessage(err, 'Failed to create goal'));
  }
});

export const updateGoal = createAsyncThunk(
  'goals/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await goalApi.update(id, data);
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, 'Failed to update goal'));
    }
  },
);

export const deleteGoal = createAsyncThunk('goals/delete', async (id, { rejectWithValue }) => {
  try {
    await goalApi.remove(id);
    return id;
  } catch (err) {
    return rejectWithValue(getApiErrorMessage(err, 'Failed to delete goal'));
  }
});

export const contributeToGoal = createAsyncThunk(
  'goals/contribute',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await goalApi.contribute(id, data);
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, 'Failed to add contribution'));
    }
  },
);

export const completeGoal = createAsyncThunk(
  'goals/complete',
  async (id, { rejectWithValue }) => {
    try {
      return await goalApi.complete(id);
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, 'Failed to complete goal'));
    }
  },
);

export const withdrawGoal = createAsyncThunk(
  'goals/withdraw',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await goalApi.withdraw(id, data);
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, 'Failed to withdraw goal'));
    }
  },
);

export const convertGoal = createAsyncThunk(
  'goals/convert',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await goalApi.convert(id, data);
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, 'Failed to convert goal'));
    }
  },
);

function upsertGoal(state, goal) {
  const idx = state.items.findIndex((g) => g.id === goal.id);
  if (idx >= 0) state.items[idx] = goal;
  else state.items.unshift(goal);
}

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
        state.items.unshift(action.payload);
      })
      .addCase(updateGoal.fulfilled, (state, action) => {
        upsertGoal(state, action.payload);
      })
      .addCase(deleteGoal.fulfilled, (state, action) => {
        state.items = state.items.filter((g) => g.id !== action.payload);
      })
      .addCase(contributeToGoal.fulfilled, (state, action) => {
        upsertGoal(state, action.payload);
      })
      .addCase(completeGoal.fulfilled, (state, action) => {
        upsertGoal(state, action.payload);
      })
      .addCase(withdrawGoal.fulfilled, (state, action) => {
        upsertGoal(state, action.payload);
      })
      .addCase(convertGoal.fulfilled, (state, action) => {
        // New goal returned; refresh list is safer, but upsert the new one
        state.items.unshift(action.payload);
      });
  },
});

export default goalSlice.reducer;
