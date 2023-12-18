import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavigationSidebar from "@/components/navigation/navigationSidebar";
import useServer from "@/hooks/useServer";
import useAuth from "@/hooks/useAuth";
import { handleError, handleResponse } from "@/lib/response-handler";
import { get } from "@/services/api-service";
import useMisc from "@/hooks/useMisc";
import ConversationSidebar from "@/components/conversation/sidebar/conversationSidebar";
import MainWrapper from "@/components/main/mainWrapper";
import ChannelSidebar from "@/components/channel/sidebar/channelSidebar";

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
  const allConversations = useMisc("allConversations");
  const miscDispatch = useMisc("dispatch");
  const profileId = useAuth("id");
  const activeConversation = useMisc("activeConversation");
  let data;

  // Consume the Auth context using custom hook
  const access_token = useAuth("token");

  console.log(type);

  const fetchConversation = async () => {
    if (params.memberProfileId === params.myProfileId) {
      return;
    }
    try {
      const response = await get(
        `/conversations/${params.memberProfileId}/${params.myProfileId}`,
        access_token
      );

      const data = await handleResponse(response, authDispatch);

      miscDispatch({
        type: "SET_ACTIVE_CONVERSATION",
        payload: data.conversation._id,
      });
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
      const response = await get(`/conversations/${profileId}`, access_token);

      const data = await handleResponse(response, authDispatch);

      miscDispatch({
        type: "SET_CONVERSATIONS",
        payload: data.convProfile,
      });
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

      if (!allConversations || !allConversations?.length)
        fetchAllConversations();

      if (type === "conversation") data = fetchConversation();
      else {
        if (activeConversation)
          navigate(`/@me/conversations/${activeConversation}/${profileId}`);
        else data = null;
      }
    }
  }, [type, params.serverId, params.channelId, params.memberProfileId]);

  return (
    <main className="h-screen flex w-screen">
      <div className="h-full w-[72px] bg-main10 flex-shrink-0">
        <NavigationSidebar />
      </div>
      <div className="w-[240px] bg-main08 flex-shrink-0 ">
        {type === "messages" || type === "conversation" || !serverDetails ? (
          <ConversationSidebar type={type} />
        ) : (
          <ChannelSidebar />
        )}
      </div>
      <div className="w-full h-full">
        <MainWrapper type={type} data={data} />
      </div>
    </main>
  );
};

export default MainPage;
