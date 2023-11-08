import React, { useState, useEffect } from "react";
import InitialModal from "@/components/modals/initialModal";
import { get } from "@/services/apiService";
import { useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { handleResponse, handleError } from "@/services/responseHandler";

const InitialProfile = () => {
  const navigate = useNavigate();
  const user = useAuth("user");
  const access_token = useAuth("token");
  const [servers, setServers] = useState([]);
  const [isInitialModalOpen, setInitialModalOpen] = useState(false);
  const dispatch = useAuth("dispatch");

  useEffect(() => {
    const handlePopulation = async () => {
      const headers = {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
        Origin: "http://localhost:5173",
      };

      console.log(user);

      try {
        const response = await get(`/servers/${user}/servers`, headers, {
          credentials: "include",
        });

        const data = await handleResponse(response, dispatch);
        setServers(data.servers); // Update the state with the fetched servers
        console.log(data.servers);
        if (data.servers.length === 0) {
          // If no servers are available, open the dialog
          setInitialModalOpen(true);
        }
      } catch (err) {
        handleError(err);
      }
    };

    handlePopulation();
  }, []);

  useEffect(() => {
    if (servers.length > 0) {
      navigate(`/servers/${servers[0].id}`);
    }
  }, [servers, navigate]);

  return <div>{isInitialModalOpen && <InitialModal />}</div>;
};

export default InitialProfile;
