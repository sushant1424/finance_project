import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authApi from '@/api/authApi';
import { getStoredToken, setStoredToken, clearStoredToken } from '@/api/client';
import { DEFAULT_CURRENCY } from '@/constants/currencies';
import { getApiErrorMessage } from '@/utils/apiError';

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    return await authApi.login(credentials);
  } catch (err) {
    return rejectWithValue(getApiErrorMessage(err, 'Login failed'));
  }
});

export const register = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    return await authApi.register(data);
  } catch (err) {
    return rejectWithValue(getApiErrorMessage(err, 'Registration failed'));
  }
});

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    return await authApi.getMe();
  } catch (err) {
    return rejectWithValue(getApiErrorMessage(err, 'Failed to load profile'));
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (data, { rejectWithValue }) => {
  try {
    return await authApi.updateProfile(data);
  } catch (err) {
    return rejectWithValue(getApiErrorMessage(err, 'Update failed'));
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: getStoredToken(),
    loading: false,
    error: null,
    initialized: false,
  },
  reducers: {
    logout: (state) => {
      authApi.logout();
      state.user = null;
      state.token = null;
      state.error = null;
      state.initialized = true;
    },
    initializeAuth: (state) => {
      if (!state.token) {
        state.initialized = true;
      }
    },
    setToken: (state, action) => {
      state.token = action.payload;
      setStoredToken(action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null; };
    const rejected = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      .addCase(login.pending, pending)
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.access_token;
        state.user = action.payload.user;
        state.error = null;
        state.initialized = true;
        setStoredToken(action.payload.access_token);
      })
      .addCase(login.rejected, rejected)
      .addCase(register.pending, pending)
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.access_token;
        state.user = action.payload.user;
        state.error = null;
        state.initialized = true;
        setStoredToken(action.payload.access_token);
      })
      .addCase(register.rejected, rejected)
      .addCase(fetchMe.pending, pending)
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.initialized = true;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        clearStoredToken();
        state.initialized = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateProfile.rejected, rejected);
  },
});

export const { logout, setToken, clearError, initializeAuth } = authSlice.actions;
export const selectUser = (state) => state.auth.user;
export const selectCurrency = (state) => state.auth.user?.currency ?? DEFAULT_CURRENCY;
export const selectShowCents = (state) => state.auth.user?.show_cents ?? true;
export const selectIsAuthenticated = (state) => !!state.auth.token && !!state.auth.user;
export default authSlice.reducer;
