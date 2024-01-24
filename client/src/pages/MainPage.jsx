import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavigationSidebar from "@/components/navigation/navigationSidebar";
import useServer from "@/hooks/useServer";
import useAuth from "@/hooks/useAuth";
import ConversationSidebar from "@/components/conversation/sidebar/conversationSidebar";
import MainWrapper from "@/components/main/mainWrapper";
import ServerSidebar from "@/components/server/sidebar/serverSidebar";
import useConversations from "@/hooks/useConversations";
import useChannels from "@/hooks/useChannels";
import {
  getAllConversations,
  getAllServers,
  getChannelAndServer,
  getChannelOnly,
  getConversationDetails,
} from "@/lib/context-helper";
import { handleError } from "@/lib/response-handler";

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

  const fetchMap = {
    servers: () => {
      getAllServers(user, authDispatch, serverDispatch);
    },
    channelAndServer: () => {
      getChannelAndServer(
        user,
        params.serverId,
        params.channelId,
        authDispatch,
        serverDispatch,
        channelsDispatch
      );
    },
    channelOnly: () => {
      getChannelOnly(
        params.serverId,
        params.channelId,
        authDispatch,
        channelsDispatch
      );
    },
    conversations: () => {
      getAllConversations(profileId, authDispatch, conversationsDispatch);
    },
    conversationDetails: () => {
      getConversationDetails(
        params.memberProfileId,
        params.myProfileId,
        authDispatch,
        conversationsDispatch
      );
    },
  };

  useEffect(() => {
    const toFetchBatch = [];

    // One Must fetch basic server details irrespective of the type
    (servers === null || servers === "undefined") &&
      toFetchBatch.push("servers");

    /*
     *
     *
     *
     *
     */
    if (type === "conversation") {
      // Batch conversations if they don't exist
      (conversations === null || conversations === "undefined") &&
        toFetchBatch.push("conversations");

      // Fetch activeConversation if user is in the chat page and activeConversation doesn't exist
      if (params.memberProfileId && params.myProfileId) {
        !activeConversation && toFetchBatch.push("conversationDetails");
      }
    }

    /*
     *
     *
     *
     *
     */
    if (type === "channel") {
      // If servers basic details are present
      if (servers)
        if (!params.channelId) {
          // If there's no channelId in params then navigate the user to the first channel
          return navigate(
            `/servers/${params.serverId}/${
              servers[params.serverId].channels[0]
            }`
          );
        }

      // If there's no activeChannel
      !activeChannel &&
        // And not an activeServer as well
        (!activeServer
          ? //then batch both at once
            toFetchBatch.push("channelAndServer")
          : // else batch channel only
            toFetchBatch.push("channelOnly"));
    }

    async function processBatch() {
      if (toFetchBatch.length === 0) return;

      try {
        await Promise.all(toFetchBatch.map((key) => fetchMap[key]()));
      } catch (error) {
        await handleError(error, authDispatch);
      }
    }

    processBatch();

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
          <MainWrapper type={type} mainData={activeConversation} />
        ) : (
          <MainWrapper type={type} mainData={activeChannel} />
        )}
      </div>
    </main>
  );
};

export default MainPage;
