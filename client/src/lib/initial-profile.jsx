import React, { useEffect, useState } from "react";
import InitialModal from "@/components/modals/initialModal";
import { get } from "@/services/apiService";
import { useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { handleResponse, handleError } from "@/services/responseHandler";
import useServer from "@/hooks/useServer";

const InitialProfile = () => {
  console.log("INSIDE INITIAL PROFILE");
  const serverDispatch = useServer("dispatch");
  const navigate = useNavigate();
  const [isInitialModalOpen, setInitialModalOpen] = useState(false);
  const authDispatch = useAuth("dispatch");
  const user = useAuth("user");
  const access_token = useAuth("token");
  const activeServer = useServer("activeServer");
  const servers = useServer("servers");

  const fetchServers = async () => {
    try {
      const response = await get(`/servers/${user}/getAll`, access_token);
      const data = await handleResponse(response, authDispatch);

      if (data.servers.length > 0) {
        console.log("Got data, ", data);
        const customPayload = {
          servers: data.servers,
          activeServer: activeServer || data.servers[0].id,
        };
        serverDispatch({ type: "SET_CUSTOM", payload: customPayload });
      } else {
        setInitialModalOpen(true);
        setFetching(false);
      }
    } catch (err) {
      handleError(err);
    }
  };

  useEffect(() => {
    if (!activeServer || !servers) {
      fetchServers();
    }
  }, []);

  useEffect(() => {
    if (activeServer && servers) {
      navigate(`/servers/${activeServer}`);
    }
  }, [activeServer, servers]);

  if (!servers) {
    return <div>Loading...</div>;
  }

  return <div>{isInitialModalOpen && <InitialModal />}</div>;
};

export default InitialProfile;
