import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "@/context/authContext.jsx"; // Import your AuthContext
import ServerCreationDialog from "@/components/models/serverCreation";
import { get } from "@/service/apiService";

const InitialProfile = () => {
  const { user } = useContext(AuthContext);
  const [servers, setServers] = useState([]);

  const headers = {
    "Content-Type": "application/json",
    Origin: "http://localhost:5173",
  };

  useEffect(() => {
    if (user) {
      // const serversOptions = {
      //   method: "GET", // Use the appropriate method
      //   headers, // Reuse the headers
      //   credentials: "include",
      //   // Add custom options for the second fetch here
      // };

      // fetch(
      //   `http://localhost:4000/api/profile/${user.profileId}/servers`,
      //   serversOptions
      // ).then((response) => response.json());

      get(`/profile/${user.profileId}/servers`, headers, {
        credentials: "include",
      }).then((data) => {
        setServers(data); // Update the state with the fetched servers
      });
    }
  }, [user]);

  return (
    <div>
      <h1>Great, you are in!</h1>
      {servers.length > 0 ? (
        <div>Loading server {servers[0]}</div>
      ) : (
        <ServerCreationDialog />
      )}
    </div>
  );
};

export default InitialProfile;
