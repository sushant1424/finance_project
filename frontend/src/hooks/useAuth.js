import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  login,
  register,
  fetchMe,
  updateProfile,
  logout,
  clearError,
  initializeAuth,
  selectUser,
  selectIsAuthenticated,
  selectCurrency,
  selectShowCents,
} from '@/store/authSlice';

export function useAuth() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector((s) => s.auth.loading);
  const error = useSelector((s) => s.auth.error);
  const initialized = useSelector((s) => s.auth.initialized);
  const token = useSelector((s) => s.auth.token);
  const currency = useSelector(selectCurrency);
  const showCents = useSelector(selectShowCents);

  useEffect(() => {
    if (token && !initialized) {
      dispatch(fetchMe());
    } else if (!token && !initialized) {
      dispatch(initializeAuth());
    }
  }, [token, initialized, dispatch]);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    initialized,
    currency,
    showCents,
    login: useCallback((c) => dispatch(login(c)), [dispatch]),
    register: useCallback((d) => dispatch(register(d)), [dispatch]),
    logout: useCallback(() => dispatch(logout()), [dispatch]),
    updateProfile: useCallback((d) => dispatch(updateProfile(d)), [dispatch]),
    clearError: useCallback(() => dispatch(clearError()), [dispatch]),
    refreshUser: useCallback(() => dispatch(fetchMe()), [dispatch]),
  };
}

export default useAuth;
