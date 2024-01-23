import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavigationSidebar from "@/components/navigation/navigationSidebar";
import useServer from "@/hooks/useServer";
import useAuth from "@/hooks/useAuth";
import { handleError } from "@/lib/response-handler";
import ConversationSidebar from "@/components/conversation/sidebar/conversationSidebar";
import MainWrapper from "@/components/main/mainWrapper";
import ServerSidebar from "@/components/server/sidebar/serverSidebar";
import useConversations from "@/hooks/useConversations";
import useChannels from "@/hooks/useChannels";
import {
  fetchAllConversations,
  fetchAllServers,
  fetchChannel,
  fetchChannelMessages,
  fetchConversation,
  fetchConversationMessages,
  fetchServer,
} from "@/api";

/*
 * MainPage
 *
 *
 * This component represents the main page of the application.
 * Authenticated users lend here, receiving a "profile" 'type' by default.
 * Includes sidebars, and main-content-pane based on the page 'type'.
 * User can either stay or visit one of the servers, obtaining a "server" 'type'.
 * Expects authentication details; if missing, it navigates to the homepage.
 *
 *
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
  const channels = useChannels("channels");
  const activeChannel = useChannels("activeChannel");
  const channelsDispatch = useChannels("dispatch");
  const authDispatch = useAuth("dispatch");
  const user = useAuth("user");
  const serverCache = useServer("cache");
  const channelCache = useChannels("cache");

  useEffect(() => {
    /*
     *
     *
     */
    const getAllConversations = async () => {
      try {
        const data = await fetchAllConversations({
          profileId: profileId,
          authDispatch: authDispatch,
        });

        // Populate / Re-populate the conversations context
        conversationsDispatch({
          type: "SET_CONVERSATIONS",
          payload: data.conversations,
        });
      } catch (err) {
        handleError(err, authDispatch);
      }
    };

    const getAllServers = async () => {
      try {
        const data = await fetchAllServers({
          user: user,
          authDispatch: authDispatch,
        });
        const serverIds = Object.keys(data.servers);

        serverIds.length > 0
          ? serverDispatch({ type: "SET_SERVERS", payload: data.servers })
          : serverDispatch({ type: "SET_SERVERS", payload: [] });
      } catch (err) {
        handleError(err, authDispatch);
      }
    };

    const getConversationDetails = async () => {
      try {
        const [conversationData, conversationMessagesData] = await Promise.all([
          fetchConversation({
            memberProfileId: params.memberProfileId,
            myProfileId: params.myProfileId,
            authDispatch: authDispatch,
          }),
          fetchConversationMessages({
            memberProfileId: params.memberProfileId,
            myProfileId: params.myProfileId,
            authDispatch,
          }),
        ]);

        conversationsDispatch({
          type: "SET_CUSTOM",
          payload: {
            activeConversation: {
              _id: conversationData.conversation._id,
              theirProfileId: conversationData.memberProfile._id,
              theirName: conversationData.memberProfile.name,
              theirImage: conversationData.memberProfile.image
                ? conversationData.memberProfile.image
                : null,
            },
            messages: conversationMessagesData.messages,
            cursor: conversationMessagesData.newCursor,
            hasMore: conversationMessagesData.hasMoreMessages,
          },
        });
      } catch (error) {
        await handleError(error, authDispatch);
      }
    };

    const getChannelAndServer = async () => {
      console.log("getting both channels and server");
      try {
        const [serverData, channelData, messagesData] = await Promise.all([
          fetchServer({
            user: user,
            serverId: params.serverId,
            authDispatch: authDispatch,
          }),
          fetchChannel({
            serverId: params.serverId,
            channelId: params.channelId,
            authDispatch: authDispatch,
          }),
          fetchChannelMessages({
            channelId: params.channelId,
            authDispatch: authDispatch,
          }),
        ]);

        serverDispatch({
          type: "SET_ACTIVE_SERVER",
          payload: serverData.server,
        });

        channelsDispatch({
          type: "SET_CUSTOM",
          payload: {
            channels: serverData.server.channels,
            activeChannel: channelData.channel,
            messages: messagesData.messages,
            cursor: messagesData.newCursor,
            hasMore: messagesData.hasMoreMessages,
          },
        });
      } catch (error) {
        await handleError(error, authDispatch);
      }
    };

    const getChannelOnly = async () => {
      try {
        const [channelData, messagesData] = await Promise.all([
          fetchChannel({
            serverId: params.serverId,
            channelId: params.channelId,
            authDispatch: authDispatch,
          }),
          fetchChannelMessages({
            channelId: params.channelId,
            authDispatch: authDispatch,
          }),
        ]);

        channelsDispatch({
          type: "SET_CUSTOM",
          payload: {
            activeChannel: channelData.channel,
            messages: messagesData.messages,
            cursor: messagesData.newCursor,
            hasMore: messagesData.hasMoreMessages,
          },
        });
      } catch (error) {
        await handleError(error, authDispatch);
      }
    };

    /*
     *
     *
     */

    servers === null && getAllServers(); // Basic server details is a must in any case

    /*
     *
     *
     */

    if (type === "conversation") {
      conversations === null && getAllConversations();

      if (params.memberProfileId && params.myProfileId) {
        (!activeConversation ||
          params.memberProfileId !== activeConversation?.theirProfileId) &&
          getConversationDetails();
      }
    }

    /*
     *
     *
     */

    if (type === "channel") {
      if (!params.channelId) {
        return navigate(
          `/servers/${params.serverId}/${servers[params.serverId].channels[0]}`
        );
      }

      if (
        serverCache &&
        channelCache &&
        params.serverId === serverCache.activeServer.id &&
        params.channelId === channelCache.activeChannel._id
      ) {
        console.log("using cache");
        channelsDispatch({ type: "USE_CACHE" });
        serverDispatch({ type: "USE_CACHE" });
        return;
      }

      (!activeServer || activeServer?.id !== params.serverId) &&
        getChannelAndServer();

      activeServer &&
        activeChannel?.id !== params.channelId &&
        getChannelOnly();
    }

    /*
     *
     * Explanation of Dependencies:
     *
     * type: Need to render different stuff for different "type"s
     * params.serverId: User has switched the server, need to fetch everything again
     * params.channelId: User has switched the channel, need to fetch new activeChannel
     *
     *
     */
  }, [type, params.serverId, params.channelId, params.memberProfileId]);

  // TODO loading state when the context is empty, so there's nothing to show
  if (!activeChannel && !activeConversation && conversations === null) {
    return null;
  }

  if (type === "channel" && !activeChannel) {
    return (
      <main className="h-screen flex w-screen">
        <div className="h-full w-[72px] bg-main10 flex-shrink-0">
          <NavigationSidebar type="conversation" />
        </div>
        <div className="w-[240px] bg-main08 flex-shrink-0 ">
          <ConversationSidebar conversations={conversations} />
        </div>
        <div className="w-full h-full">
          <MainWrapper
            type="conversation"
            activeConversation={activeConversation}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen flex w-screen">
      <div className="h-full w-[72px] bg-main10 flex-shrink-0">
        <NavigationSidebar type={type} />
      </div>
      <div className="w-[240px] bg-main08 flex-shrink-0 ">
        {type === "conversation" ? (
          <ConversationSidebar conversations={conversations} />
        ) : (
          <ServerSidebar activeServer={activeServer} channels={channels} />
        )}
      </div>
      <div className="w-full h-full">
        {type === "conversation" ? (
          <MainWrapper type={type} activeConversation={activeConversation} />
        ) : (
          <MainWrapper type={type} activeChannel={activeChannel} />
        )}
      </div>
    </main>
  );
};

export default MainPage;
