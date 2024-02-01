import useAuth from "@/hooks/useAuth";
import { get } from "@/services/api-service";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { handleError, handleResponse } from "./response-handler";

const RequireAuth = ({ children }) => {
  const user = useAuth("user");
  const access_token = useAuth("token");
  const navigate = useNavigate();
  const profileId = useAuth("id");
  const authDispatch = useAuth("dispatch");
  const name = useAuth("name");
  const image = useAuth("image");
  const email = useAuth("email");
  const about = useAuth("about");

  useEffect(() => {
    const refreshUserDetails = async () => {
      try {
        const response = await get("/auth/refresh", access_token);
        console.log(response);
        const data = await handleResponse(response, authDispatch);

        authDispatch({
          type: "SET_CUSTOM",
          payload: {
            about: data.about,
            email: data.email,
            image: data.image,
            name: data.name,
            profileId: data.profileId,
            user: data.user,
          },
        });
      } catch (error) {
        console.log("here", error);
        handleError(error, authDispatch);
      }
    };

    if (user && access_token) {
      (!profileId || !name || !about === null || !image === null || !email) &&
        refreshUserDetails();
    } else {
      authDispatch({ type: "RESET_STATE" });
      navigate("/");
    }
  }, [user, access_token]);

  return !profileId ||
    !image === null ||
    !name ||
    !about === null ||
    !email ||
    !user ||
    !access_token
    ? null
    : children;
};

export default RequireAuth;
