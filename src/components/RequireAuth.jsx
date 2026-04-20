import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';

// Wraps a route. If not authed, redirects to /login with return path in state.
export default function RequireAuth({ children }) {
  const { isAuthed } = useAuth();
  const location = useLocation();

  if (!isAuthed) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}
