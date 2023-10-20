import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "@/context/authContext.jsx"; // Import your AuthContext
import InitialModal from "@/components/models/initial-modal";

const InitialProfile = () => {
  const { user } = useContext(AuthContext);
  const [servers, setServers] = useState([]);

  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append("Origin", "http://localhost:5173");

  useEffect(() => {
    if (user) {
      const serversOptions = {
        method: "GET", // Use the appropriate method
        headers, // Reuse the headers
        credentials: "include",
        // Add custom options for the second fetch here
      };

      fetch(
        `http://localhost:4000/api/profile/${user.profileId}/servers`,
        serversOptions
      )
        .then((response) => response.json())
        .then((data) => {
          setServers(data); // Update the state with the fetched servers
          alert(JSON.stringify(servers, null, 4));
        });
    }
  }, [user]);

  return (
    <div>
      <h1>Great, you are in!</h1>
      {servers.length > 0 ? (
        <div>Loading server {servers[0]}</div>
      ) : (
        <InitialModal />
      )}
    </div>
  );
};

export default InitialProfile;
