import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ admin = false }: { admin?: boolean }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();
  if (loading) return <LoadingSpinner fullScreen message="Restoring your session" />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (admin && !user?.is_staff) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
