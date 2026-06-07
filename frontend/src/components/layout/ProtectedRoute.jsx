import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { selectIsAuthenticated } from '@/store/authSlice';
import AuthLoading from '@/components/common/AuthLoading';

export default function ProtectedRoute({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const token = useSelector((s) => s.auth.token);
  const initialized = useSelector((s) => s.auth.initialized);
  const loading = useSelector((s) => s.auth.loading);
  const location = useLocation();

  if (!initialized || (token && loading && !isAuthenticated)) {
    return <AuthLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return children;
}
