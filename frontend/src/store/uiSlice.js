import { createSlice } from '@reduxjs/toolkit';

const storedTheme = localStorage.getItem('finsight_theme') || 'light';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarExpanded: true,
    theme: storedTheme,
    activeModal: null,
    confirmDialog: null,
    dateRange: { from: null, to: null },
    compactMode: false,
  },
  reducers: {
    setSidebarExpanded: (state, action) => {
      state.sidebarExpanded = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('finsight_theme', action.payload);
    },
    openModal: (state, action) => {
      state.activeModal = action.payload;
    },
    closeModal: (state) => {
      state.activeModal = null;
    },
    setDateRange: (state, action) => {
      state.dateRange = action.payload;
    },
    setCompactMode: (state, action) => {
      state.compactMode = action.payload;
    },
  },
});

export const {
  setSidebarExpanded,
  setTheme,
  openModal,
  closeModal,
  setDateRange,
  setCompactMode,
} = uiSlice.actions;

export const selectSidebarExpanded = (state) => state.ui.sidebarExpanded;
export const selectTheme = (state) => state.ui.theme;
export default uiSlice.reducer;
