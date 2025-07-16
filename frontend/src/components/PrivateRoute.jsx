import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContexts";

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  // loading true iken hiçbir şey gösterme (context hâlen bilgi topluyor)
  if (loading) return null;

  // user varsa erişim ver, yoksa login'e yönlendir
  return user ? children : <Navigate to="/login" replace />;
}
