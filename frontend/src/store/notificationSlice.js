import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import notificationsApi from '@/api/notificationsApi';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await notificationsApi.list();
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to load notifications');
    }
  },
);

export const markNotificationRead = createAsyncThunk(
  'notifications/markRead',
  async (id, { rejectWithValue }) => {
    try {
      await notificationsApi.markRead(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to mark as read');
    }
  },
);

export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { rejectWithValue }) => {
    try {
      await notificationsApi.markAllRead();
      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to mark all as read');
    }
  },
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    unreadCount: 0,
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items ?? [];
        state.unreadCount = action.payload.unread_count ?? 0;
      })
      .addCase(fetchNotifications.rejected, (state) => {
        state.loading = false;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const id = action.payload;
        state.items = state.items.filter((n) => n.id !== id);
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.items = [];
        state.unreadCount = 0;
      });
  },
});

export default notificationSlice.reducer;
