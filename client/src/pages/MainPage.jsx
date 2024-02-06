import React, { useCallback, useEffect, useState } from "react";
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
import { Loader2 } from "lucide-react";
import MobileToggle from "@/components/mobileToggle";
import ErrorComponent from "@/lib/error-Component";
import { forApiErrorInitial } from "@/lib/misc";

/*
 * MainPage
 *
 *
 * This component represents the main page of the application.
 * Authenticated users lend here, receiving "conversation" 'type' by default.
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

  // Consume context using custom hook
  const profileId = useAuth("id");
  const authDispatch = useAuth("dispatch");
  const user = useAuth("user");
  const servers = useServer("servers");
  const activeServer = useServer("activeServer");
  const serverDispatch = useServer("dispatch");
  const conversations = useConversations("conversations");
  const activeConversation = useConversations("activeConversation");
  const conversationsDispatch = useConversations("dispatch");
  const activeChannel = useChannels("activeChannel");
  const channelsDispatch = useChannels("dispatch");
  const [forApiError, setForApiError] = useState(forApiErrorInitial);

  // Error re-setter for standard error component
  const resetError = useCallback(() => {
    setForApiError(forApiErrorInitial);
  }, []);

  // FetchMap for mapping utility functions to keywords so that queuing multiple fetches becomes easier and readable
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
    // To queue multiple fetches for batch processing
    const toFetchBatch = [];

    // Fetch basic server details and conversations irrespective of the type
    (servers === null || servers === "undefined") &&
      toFetchBatch.push("servers");

    (conversations === null || conversations === "undefined") &&
      toFetchBatch.push("conversations");

    /*
     *
     *
     *
     *
     */
    if (type === "conversation") {
      // Batch activeConversation if user is in the chat page and activeConversation doesn't exist
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

    // Batch processor function
    async function processBatch() {
      if (toFetchBatch.length === 0) return;

      try {
        // Map the keys stored in fetchBatch to fetchMap and fetch all simultaneously
        await Promise.all(toFetchBatch.map((key) => fetchMap[key]()));
      } catch (error) {
        const { message } = handleError(error, authDispatch); // Error handler
        setForApiError({
          ...forApiError,
          message: message,
        });
      }
    }

    (async () => {
      await processBatch();
    })(); // Call the batch processor as an immediately invoked function, calling processBatch wrapped inside an async function is so that I can await it, and can do other things afterwards, if required.

    /*
     *
     * Explanation of Dependencies:
     *
     * Empty Dependency: Since all the navigation is reactive in nature, this means data is fetched before user is navigated, so we won't need to re-fetch anything after initial render.
     *
     *
     */
  }, [type]);

  // Loading state, shown only once when the component mounts just like the real-discord application

  if (
    !servers ||
    !conversations ||
    (type === "channel" && !activeChannel) ||
    (params.myProfileId && !activeConversation && !conversations)
  ) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <Loader2
          strokeWidth={3}
          className="lg:w-6 lg:h-6 sm:w-4 sm:h-4 animate-spin"
        />
      </div>
    );
  }

  return (
    <main className="h-screen flex w-screen">
      <div className="top-1 left-1 absolute">
        {type === "conversation" ? (
          <MobileToggle type={type} data={<ConversationSidebar />} />
        ) : (
          <MobileToggle type={type} data={<ServerSidebar />} />
        )}
      </div>
      <div className="hidden lg:block h-full w-[72px] bg-main10 flex-shrink-0">
        <NavigationSidebar type={type} />
      </div>
      <div className="hidden lg:block w-[240px] bg-main08 flex-shrink-0 ">
        {type === "conversation" ? <ConversationSidebar /> : <ServerSidebar />}
      </div>
      <div className="w-full h-full">
        {type === "conversation" ? (
          <MainWrapper type={type} mainData={activeConversation} />
        ) : (
          <MainWrapper type={type} mainData={activeChannel} />
        )}
      </div>
      <ErrorComponent apiError={forApiError} resetError={resetError} />
    </main>
  );
};

export default MainPage;

// Approach: A "type" system has been used to differentiate between different aspects of the application like "Direct Messages" and "Servers". The "type" parameter decides that which components get rendered downs the hierarchy, providing a structured and modular approach. Everything from Sidebars to Main components change as the type changes, providing a single-page application like feel with highly dynamic experience.
