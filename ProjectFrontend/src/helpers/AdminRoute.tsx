import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const AdminRoute = () => {
  const location = useLocation();
  const { isLoggedIn, user } = useAuth();

  if (!isLoggedIn()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isAdmin = user?.Roles?.includes("Bank");

  return isAdmin ? <Outlet /> : <Navigate to="/" state={{ from: location }} replace />;
};

export default AdminRoute;