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
 * Authenticated users lend here, receiving a "profile" 'type' by default.
 * Includes sidebars, and main-content-pane based on the page 'type'.
 * User can either stay or visit one their servers, obtaining a "server" 'type'.
 * Expects authentication details; if missing, it navigates to the homepage.
 *
 */

const MainPage = ({ type }) => {
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
  const channelDetails = useServer("channelDetails");
  const activeConversation = useMisc("activeConversation");

  // Consume the Auth context using custom hook
  const access_token = useAuth("token");

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
        payload: {
          id: data.conversation._id,
          profileId: data.memberProfile._id,
          name: data.memberProfile.name,
          image: data.memberProfile.image ? data.memberProfile.image : null,
        },
      });
    } catch (err) {
      handleError(err, authDispatch);
    }
  };

  const fetchChannelData = async () => {
    try {
      const [response, messages] = await Promise.all([
        get(`/channels/${params.serverId}/${params.channelId}`, access_token),
        get(`/messages/fetch?channelId=${params.channelId}`, access_token),
      ]);

      const [channelData, messageData] = await Promise.all([
        handleResponse(response, authDispatch),
        handleResponse(messages, authDispatch),
      ]);

      const channelDetails = {
        ...channelData.channel[1],
        messages: { data: messageData.messages, cursor: messageData.newCursor },
      };

      serverDispatch({
        type: "SET_CUSTOM",
        payload: {
          serverDetails: channelData.server,
          channelDetails: channelDetails,
        },
      });
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
      handleError(err, authDispatch);
    }
  };

  console.log("type", type);

  useEffect(() => {
    if (type == "server") {
      navigate(
        `/servers/${params.serverId}/${servers[params.serverId].channels[0]}`
      );
    } else if (type == "channel") {
      params.channelId && !channelDetails && fetchChannelData();
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

      if (type === "conversation") {
        fetchConversation();
      }
    }
  }, [type, params.serverId, params.channelId, params.memberProfileId]);

  if (
    (params.channelId && !channelDetails) ||
    (params.serverId && !serverDetails) ||
    (params.memberProfileId && !activeConversation && !allConversations)
  ) {
    return null;
  }

  return (
    <main className="h-screen flex w-screen">
      <div className="h-full w-[72px] bg-main10 flex-shrink-0">
        <NavigationSidebar />
      </div>
      <div className="w-[240px] bg-main08 flex-shrink-0 ">
        {type === "conversation" || type === "messages" ? (
          <ConversationSidebar />
        ) : (
          <ChannelSidebar />
        )}
      </div>
      <div className="w-full h-full">
        <MainWrapper type={type} />
      </div>
    </main>
  );
};

export default MainPage;
