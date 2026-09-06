import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/store/authSlice';
import transactionReducer from '@/store/transactionSlice';
import budgetReducer from '@/store/budgetSlice';
import goalReducer from '@/store/goalSlice';
import analyticsReducer from '@/store/analyticsSlice';
import uiReducer from '@/store/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    transactions: transactionReducer,
    budgets: budgetReducer,
    goals: goalReducer,
    analytics: analyticsReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export default store;
