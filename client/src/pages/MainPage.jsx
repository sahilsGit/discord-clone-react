// Imports
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavigationSidebar from "@/components/navigation/navigationSidebar";
import ProfileSidebar from "@/components/profile/sidebar/profileSidebar";
import ServerSidebar from "@/components/server/sidebar/serverSidebar";
import useServer from "@/hooks/useServer";
import useAuth from "@/hooks/useAuth";

/*
 * MainPage
 *
 * This component represents the main page of the application.
 * Authenticated users lend here, recieving a "profile" 'type' by default.
 * Includes sidebars, and main-content-pane based on the page 'type'.
 * User can either stay or visit one their servers, obtaining a "server" 'type'.
 * Expects authentication details; if missing, it navigates to the hompeage.
 */

const ProfilePage = ({ type }) => {
  const params = useParams();
  const navigate = useNavigate();

  // Consume the Servers context using custom hook
  const serverDetails = useServer("serverDetails");
  const serverDispatch = useServer("dispatch");

  // Consume the Auth context using custom hook
  const user = useAuth("user");
  const access_token = useAuth("token");

  const serverId = params.id;

  useEffect(() => {
    console.log("serverId did change", serverId);
    // Dispatch the new activeServer when serverId changes
    if (type === "server" && user && access_token) {
      serverDispatch({ type: "SET_ACTIVE_SERVER", payload: serverId });
    }

    // Let the user login again to fetch what's missing
    if (!user || !access_token) {
      console.log("navvvv");
      navigate("/");
    }
  }, [type, serverId, user, access_token]);

  return serverDetails || type === "profile" ? (
    <main className="h-screen flex">
      <div className="h-full w-[72px] bg-main10">
        <NavigationSidebar />
      </div>
      <div className="h-full w-[240px] bg-main08">
        {type === "server" ? <ServerSidebar /> : <ProfileSidebar />}
      </div>
    </main>
  ) : (
    <div>Loading server details...</div>
  );
};

export default ProfilePage;
