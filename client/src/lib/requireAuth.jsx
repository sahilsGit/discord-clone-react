import useAuth from "@/hooks/useAuth";
import { Navigate, useLocation } from "react-router-dom";

const RequireAuth = ({ children }) => {
  const user = useAuth("user");
  const location = useLocation();

  return user ? (
    children
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default RequireAuth;
