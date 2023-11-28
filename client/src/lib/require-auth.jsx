import useAuth from "@/hooks/useAuth";
import useServer from "@/hooks/useServer";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const RequireAuth = ({ children }) => {
  const user = useAuth("user");
  const access_token = useAuth("token");
  const navigate = useNavigate();
  const serverDispatch = useServer("dispatch");

  useEffect(() => {
    if (!user || !access_token) {
      serverDispatch({ type: "RESET_STATE" });
      navigate("/");
    }
  }, [user, access_token]);

  return user && access_token ? children : <p>Loading...</p>;
};

export default RequireAuth;
