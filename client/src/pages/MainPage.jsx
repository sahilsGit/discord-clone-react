// Imports
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavigationSidebar from "@/components/navigation/navigationSidebar";
import ServerSidebar from "@/components/server/sidebar/serverSidebar";
import useServer from "@/hooks/useServer";
import useAuth from "@/hooks/useAuth";
import MessagesSidebar from "@/components/messages/sidebar/messagesSidebar";
import MainContentWrapper from "@/components/main/mainContentWrapper";
import { handleError, handleResponse } from "@/lib/response-handler";
import { get } from "@/services/api-service";

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
  const authDispatch = useAuth("dispatch");
  const servers = useServer("servers");
  let data;

  console.log(type);

  // Consume the Auth context using custom hook
  const access_token = useAuth("token");

  const fetchConversation = async () => {
    if (params.memberId === params.myMemberId) {
      return;
    }
    try {
      const response = get(
        `/conversations/${params.memberId}/${params.myMemberId}`,
        access_token
      );

      return handleResponse(response, authDispatch);
    } catch (err) {
      handleError(err, authDispatch);
    }
  };

  const fetchChannelData = async () => {
    try {
      const response = await get(
        `/channels/${params.serverId}/${params.channelId}`,
        access_token
      );

      const data = await handleResponse(response, authDispatch);

      serverDispatch({
        type: "SET_CUSTOM",
        payload: {
          serverDetails: data.server,
          channelDetails: data.channel[1],
        },
      });

      console.log(data.server);
    } catch (err) {
      const errCode = handleError(err, authDispatch);

      if (errCode === 404) {
        navigate("/@me/conversations");
      }
    }
  };

  const fetchAllConversations = async () => {
    try {
      const response = await get(
        `/conversations/${serverDetails.myMembership._id}`,
        access_token
      );

      const data = handleResponse(response, authDispatch);
    } catch (err) {
      const errCode = handleError(err, authDispatch);
    }
  };

  useEffect(() => {
    if (type == "channel" || type == "server") {
      params.channelId
        ? fetchChannelData()
        : navigate(
            `/servers/${params.serverId}/${
              servers[params.serverId].channels[0]
            }`
          );
    } else {
      serverDispatch({
        type: "SET_CUSTOM",
        payload: {
          serverDetails: null,
          channelDetails: null,
        },
      });
      // if (!allConversations || !allConversations?.length)
      //   serverDetails && fetchAllConversations();

      if (type === "conversation") data = fetchConversation();
      else data = null;
    }
  }, [type, params.serverId, params.channelId]);

  return (
    <main className="h-screen flex">
      <div className="h-full w-[72px] bg-main10 flex-shrink-0">
        <NavigationSidebar />
      </div>

      {type !== "messages" && !serverDetails ? (
        <div className="h-full w-[240px] bg-main08 flex-shrink-0 ">
          <p>Loading...</p>
        </div>
      ) : (
        <>
          <div className="h-full w-[240px] bg-main08 flex-shrink-0 ">
            {type === "messages" || type === "conversation" ? (
              <MessagesSidebar type={type} />
            ) : (
              <ServerSidebar />
            )}
          </div>

          <div className="w-full">
            <MainContentWrapper type={type} data={data} />
          </div>
        </>
      )}
    </main>
  );
};

export default MainPage;
