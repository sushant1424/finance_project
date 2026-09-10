import { createSlice } from '@reduxjs/toolkit';

const storedTheme = localStorage.getItem('finsight_theme') || 'light';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarExpanded: true,
    theme: storedTheme,
    dateRange: { from: null, to: null },
  },
  reducers: {
    setSidebarExpanded: (state, action) => {
      state.sidebarExpanded = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('finsight_theme', action.payload);
    },
    setDateRange: (state, action) => {
      state.dateRange = action.payload;
    },
  },
});

export const { setSidebarExpanded, setTheme, setDateRange } = uiSlice.actions;
export default uiSlice.reducer;
