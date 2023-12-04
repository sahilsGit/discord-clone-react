// Imports
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavigationSidebar from "@/components/navigation/navigationSidebar";
import ServerSidebar from "@/components/server/sidebar/serverSidebar";
import useServer from "@/hooks/useServer";
import useAuth from "@/hooks/useAuth";
import MessagesSidebar from "@/components/messages/sidebar/messagesSidebar";
import MainContentWrapper from "@/components/main/mainContentWrapper";

/*
 * MainPage
 *
 * This component represents the main page of the application.
 * Authenticated users lend here, recieving a "profile" 'type' by default.
 * Includes sidebars, and main-content-pane based on the page 'type'.
 * User can either stay or visit one their servers, obtaining a "server" 'type'.
 * Expects authentication details; if missing, it navigates to the hompeage.
 */

const MainPage = ({ type }) => {
  console.log("INSIDE MAIN PAGE");

  const params = useParams();
  const navigate = useNavigate();

  // Consume the Servers context using custom hook
  const serverDetails = useServer("serverDetails");
  const serverDispatch = useServer("dispatch");
  const activeChannel = useServer("activeChannel");
  const activeServer = useServer("activeServer");

  // Consume the Auth context using custom hook
  const user = useAuth("user");
  const access_token = useAuth("token");

  useEffect(() => {
    (!user || !access_token) && navigate("/");

    if (type === "messages") {
      serverDispatch({
        type: "SET_CUSTOM",
        payload: {
          activeChannel: null,
          activeServer: null,
          serverDetails: null,
          serverCandidate: null,
          channelCandidate: null,
        },
      });
    } else {
      if (
        (params.serverId && activeServer !== params.serverId) ||
        !serverDetails
      ) {
        serverDispatch({
          type: "SET_SERVER_CANDIDATE",
          payload: params.serverId,
        });
      }

      if (params.channelId && activeChannel !== params.channelId) {
        serverDispatch({
          type: "SET_CHANNEL_CANDIDATE",
          payload: params.channelId,
        });
      }
    }
  }, [type, params.serverId, params.channelId]);

  useEffect(() => {
    activeServer &&
      activeChannel &&
      navigate(`/servers/${activeServer}/${activeChannel}`);
  }, [activeServer, activeChannel]);

  return (
    <main className="h-screen flex">
      <div className="h-full w-[72px] bg-main10 flex-shrink-0">
        <NavigationSidebar />
      </div>
      <div className="h-full w-[240px] bg-main08 flex-shrink-0">
        {type !== "messages" && !serverDetails ? (
          <p>Loading...</p>
        ) : type === "messages" ? (
          <MessagesSidebar />
        ) : (
          <ServerSidebar />
        )}
      </div>
      <div className="w-full">
        <MainContentWrapper type={type} />
      </div>
    </main>
  );
};

export default MainPage;
