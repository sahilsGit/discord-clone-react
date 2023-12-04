import useAuth from "@/hooks/useAuth";
import useServer from "@/hooks/useServer";
import { get } from "@/services/api-service";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { handleResponse } from "./response-handler";

const RequireAuth = ({ children }) => {
  const user = useAuth("user");
  const access_token = useAuth("token");
  const navigate = useNavigate();
  const serverDispatch = useServer("dispatch");
  const profileId = useAuth("id");
  const authDispatch = useAuth("dispatch");

  useEffect(() => {
    const refreshAuthDetails = async () => {
      try {
        const response = await get("/auth/refresh", access_token);
        await handleResponse(response, authDispatch, serverDispatch);
      } catch (err) {
        serverDispatch({ type: "RESET_STATE" });
        navigate("/");
      }
    };

    if (!user || !access_token) {
      serverDispatch({ type: "RESET_STATE" });
      navigate("/");
    }

    if (!profileId) {
      refreshAuthDetails();
    }
  }, [user, access_token, profileId]);

  return user && access_token ? children : <p>Loading...</p>;
};

export default RequireAuth;
