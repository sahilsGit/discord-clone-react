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
import ServerSidebar from "@/components/server/sidebar/serverSidebar";

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

  console.log("MAINPAGE");

  // Consume the Servers context using custom hook
  const serverDetails = useServer("serverDetails");
  const serverDispatch = useServer("dispatch");
  const servers = useServer("servers");
  const allConversations = useMisc("allConversations");
  const miscDispatch = useMisc("dispatch");
  const profileId = useAuth("id");
  const channelDetails = useServer("channelDetails");
  const activeConversation = useMisc("activeConversation");

  // Consume the Auth context using custom hook
  const access_token = useAuth("token");
  const authDispatch = useAuth("dispatch");

  // Fetches a specific direct conversation details and populates the conversation's context
  const fetchConversation = async () => {
    if (params.memberProfileId === params.myProfileId) {
      return;
    } // No conversation with your own self

    console.log("fetching from mainPage....");
    try {
      const [response, messages] = await Promise.all([
        get(
          `/conversations/${params.memberProfileId}/${params.myProfileId}`,
          access_token
        ),
        get(
          `/messages/fetch?memberProfileId=${params.memberProfileId}&myProfileId=${params.myProfileId}`,
          access_token
        ),
      ]);

      const [conversationsData, messageData] = await Promise.all([
        handleResponse(response, authDispatch),
        handleResponse(messages, authDispatch),
      ]);

      console.log(messageData);

      console.log("mssd", messageData);

      // Populate / Re-populate the conversation's context
      miscDispatch({
        type: "SET_ACTIVE_CONVERSATION",
        payload: {
          id: conversationsData.conversation._id,
          profileId: conversationsData.memberProfile._id,
          name: conversationsData.memberProfile.name,
          image: conversationsData.memberProfile.image
            ? conversationsData.memberProfile.image
            : null, // For rendering fallback the image
          messages: {
            data: messageData.messages,
            cursor: messageData.newCursor,
            hasMoreMessages: messageData.hasMoreMessages,
          },
        },
      });
    } catch (err) {
      handleError(err, authDispatch);
    }
  };

  const fetchChannelData = async () => {
    /*
     *
     Fetches channel data and 10 recent messages for loading the server-channel page
     *
     */
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
        messages: {
          data: messageData.messages,
          cursor: messageData.newCursor,
          hasMoreMessages: messageData.hasMoreMessages,
        },
      }; // Set cursor and hasMoreMessages props for pagination

      serverDispatch({
        type: "SET_CUSTOM",
        payload: {
          serverDetails: channelData.server,
          channelDetails: channelDetails,
        },
      }); // Re-populate the newly fetched data
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
      miscDispatch({
        type: "SET_CONVERSATIONS",
        payload: data.convProfile,
      });
    } catch (err) {
      handleError(err, authDispatch);
    }
  };

  useEffect(() => {
    /*
     *
     This component expects the context to be already populated with all of the required 
     data beforehand. When any of the dependencies change, the context does the fetching, re-populates the context and re-renders this page with fresh data. This is done to 
     eliminate the need for having a loading state in between fetches. This makes the UI 
     feel more responsive. 

     So, all the fetching here in this component is reactive in nature, if anything's missing 
     then it's fetched.  
     * 
     */

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
      /*
       *
       Fetch the channelData if it doesn't exist
       *
       */
      params.channelId && !channelDetails && fetchChannelData();
    } else {
      /* 
       *
       This means the type is either "conversation" or "messages", 
       anyway, flush the serverDetails and channelDetails to avoid stale data
       *
       */
      serverDispatch({
        type: "SET_CUSTOM",
        payload: {
          serverDetails: null,
          channelDetails: null,
        },
      });

      // We do require allConversations in either of the cases
      if (!allConversations || !allConversations?.length)
        fetchAllConversations();

      // Finally fetch the specific conversation if the type is "conversation"
      type === "conversation" && !activeConversation && fetchConversation();
    }

    /*
     *
     Explanation of Dependencies:

     type: Need to render different stuff for different "type"s
     params.serverId: User has switched the server, need to fetch everything again
     params.channelId: User has switched the channel, need to fetch new channelDetails
     params.memberProfileId: User has switched the conversation, need new conversation's details
     *
     */
  }, [type, params.serverId, params.channelId, params.memberProfileId]);

  // TODO loading state when the context is empty, so there's nothing to show
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
