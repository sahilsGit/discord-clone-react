import useAuth from "@/hooks/useAuth";
import useServer from "@/hooks/useServer";
import { get } from "@/services/api-service";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleError, handleResponse } from "./response-handler";

const RequireAuth = ({ children }) => {
  const user = useAuth("user");
  const access_token = useAuth("token");
  const navigate = useNavigate();
  const profileId = useAuth("id");
  const authDispatch = useAuth("dispatch");
  const [loading, setLoading] = useState(true);

  console.log("INSIDE REQUIRE AUTH");

  useEffect(() => {
    const refreshAuthDetails = async () => {
      try {
        const response = await get("/auth/refresh", access_token);
        await handleResponse(response, authDispatch);
      } catch (err) {
        handleError(err, authDispatch);
      }
    };

    if (user && access_token) {
      !profileId ? refreshAuthDetails() : setLoading(false);
    } else {
      authDispatch({ type: "RESET_STATE" });
      navigate("/");
    }
  }, [user, access_token, profileId]);

  return loading ? <p>Loading...</p> : children;
};

export default RequireAuth;
