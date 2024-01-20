import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavigationSidebar from "@/components/navigation/navigationSidebar";
import useServer from "@/hooks/useServer";
import useAuth from "@/hooks/useAuth";
import { handleError, handleResponse } from "@/lib/response-handler";
import { get } from "@/services/api-service";
import ConversationSidebar from "@/components/conversation/sidebar/conversationSidebar";
import MainWrapper from "@/components/main/mainWrapper";
import ServerSidebar from "@/components/server/sidebar/serverSidebar";
import useConversations from "@/hooks/useConversations";
import { useLocation } from "react-router-dom";
/*
 * MainPage
 *
 * This component represents the main page of the application.
 * Authenticated users lend here, receiving a "profile" 'type' by default.
 * Includes sidebars, and main-content-pane based on the page 'type'.
 * User can either stay or visit one of the servers, obtaining a "server" 'type'.
 * Expects authentication details; if missing, it navigates to the homepage.
 *
 */

const MainPage = ({ type }) => {
  const params = useParams();
  const navigate = useNavigate();

  // Consume the Servers context using custom hook
  const profileId = useAuth("id");
  const activeServer = useServer("activeServer");
  const serverDispatch = useServer("dispatch");
  const servers = useServer("servers");
  const conversations = useConversations("conversations");
  const activeConversation = useConversations("activeConversation");
  const conversationsDispatch = useConversations("dispatch");
  const access_token = useAuth("token");
  const authDispatch = useAuth("dispatch");
  const user = useAuth("user");

  const location = useLocation();
  const { channel } = location.state || {};

  const fetchChannelData = async () => {
    try {
      if (!activeServer || activeServer?.id !== params.serverId) {
        const [response, server] = await Promise.all([
          get(`/channels/${params.serverId}/${params.channelId}`, access_token),
          get(`/servers/${user}/${params.serverId}`, access_token),
        ]);

        const [channelData, serverData] = await Promise.all([
          handleResponse(response, authDispatch),
          handleResponse(server, authDispatch),
        ]);

        // const sortedChannels = server.channels.sort(
        //   (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        // );

        serverDispatch({
          type: "SET_CUSTOM",
          payload: {
            channels: serverData.server.channels,
            activeServer: serverData.server,
            activeChannel: channelData.channel,
          },
        });
      } else {
        const response = await get(
          `/channels/${params.serverId}/${params.channelId}`,
          access_token
        );

        const channelData = await handleResponse(response, authDispatch);

        serverDispatch({
          type: "SET_ACTIVE_CHANNEL",
          payload: channelData.channel,
        });
      }
    } catch (err) {
      const errCode = handleError(err, authDispatch);

      if (errCode === 404 || errCode === 401) {
        navigate("/@me/conversations");
      } // The channel either does not exists or you don't have permission to view it
    } // Head over to conversations page in that case
  };

  const fetchAllConversations = async () => {
    /*
     *
     Fetch details of all the direct conversations a user has had
     *
     */
    try {
      const response = await get(`/conversations/${profileId}`, access_token);
      const data = await handleResponse(response, authDispatch);

      // Populate / Re-populate the conversations context
      conversationsDispatch({
        type: "SET_CONVERSATIONS",
        payload: data.conversations,
      });
    } catch (err) {
      handleError(err, authDispatch);
    }
  };

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const response = await get(`/servers/${user}/getAll`, access_token);
        const data = await handleResponse(response, authDispatch);

        const serverIds = Object.keys(data.servers);

        if (serverIds.length > 0)
          serverDispatch({ type: "SET_SERVERS", payload: data.servers });
        else serverDispatch({ type: "SET_SERVERS", payload: [] });
      } catch (err) {
        handleError(err, authDispatch);
      }
    };

    servers === null && fetchServers();
  }, []);

  useEffect(() => {
    if (type == "server") {
      /* 
       *
       The "server" type means that there's no channelId in the params,
       thereby navigate the user to the first channel that's saved in the context
       *
       */
      navigate(
        `/servers/${params.serverId}/${servers[params.serverId].channels[0]}`
      );
    } else if (type == "channel") {
      if (channel) {
        serverDispatch({
          type: "SET_ACTIVE_CHANNEL",
          payload: channel,
        });

        return;
      }
      /*
       *
       Fetch the channelData and initial messages they don't exist
       *
       */
      fetchChannelData();
    } else {
      /* 
       *
       This means the type is either "conversation" or "messages", 
       anyway, flush the activeServer and activeChannel to avoid stale data
       *
       */
      activeServer &&
        serverDispatch({
          type: "SET_CUSTOM",
          payload: {
            activeServer: null,
            activeChannel: null,
            channels: null,
          },
        });

      // This means conversations hasn't been fetched yet.
      conversations === null && fetchAllConversations();
    }

    /*
     *
     Explanation of Dependencies:

     type: Need to render different stuff for different "type"s
     params.serverId: User has switched the server, need to fetch everything again
     params.channelId: User has switched the channel, need to fetch new activeChannel
     *
     */
  }, [type, params.serverId, params.channelId]);

  // TODO loading state when the context is empty, so there's nothing to show

  // if (
  //   (params.channelId && !activeChannel) ||
  //   (params.serverId && !activeServer) ||
  //   (params.memberProfileId && !activeConversation && !conversations)
  // ) {
  //   return null;
  // }

  if ((type === "channel" || type === "server") && !activeServer) {
    return activeConversation ? (
      <>
        <main className="h-screen flex w-screen">
          <div className="h-full w-[72px] bg-main10 flex-shrink-0">
            <NavigationSidebar
              servers={servers}
              activeConversation={activeConversation}
              activeServer={activeServer}
            />
          </div>
          <div className="w-[240px] bg-main08 flex-shrink-0 ">
            <ConversationSidebar />
          </div>
          <div className="w-full h-full">
            <MainWrapper type="conversation" />
          </div>
        </main>
      </>
    ) : conversations !== null && conversations !== "undefined" ? (
      <>
        <main className="h-screen flex w-screen">
          <div className="h-full w-[72px] bg-main10 flex-shrink-0">
            <NavigationSidebar
              servers={servers}
              activeConversation={activeConversation}
              activeServer={activeServer}
            />
          </div>
          <div className="w-[240px] bg-main08 flex-shrink-0 ">
            <ConversationSidebar />
          </div>
          <div className="w-full h-full">
            <MainWrapper type="messages" />
          </div>
        </main>
      </>
    ) : null;
  }

  return (
    <main className="h-screen flex w-screen">
      <div className="h-full w-[72px] bg-main10 flex-shrink-0">
        <NavigationSidebar
          servers={servers}
          activeConversation={activeConversation}
          activeServer={activeServer}
        />
      </div>
      <div className="w-[240px] bg-main08 flex-shrink-0 ">
        {type === "conversation" || type === "messages" ? (
          <ConversationSidebar />
        ) : (
          <ServerSidebar />
        )}
      </div>
      <div className="w-full h-full">
        <MainWrapper type={type} />
      </div>
    </main>
  );
};

export default MainPage;
