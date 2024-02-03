import {
  fetchAllConversations,
  fetchAllServers,
  fetchChannel,
  fetchChannelMessages,
  fetchConversation,
  fetchConversationMessages,
  fetchMoreDirectMessages,
  fetchMoreServerMessages,
  fetchServer,
} from "./api";
import { handleError } from "./response-handler";

const getAllServers = async (user, authDispatch, serverDispatch) => {
  try {
    const data = await fetchAllServers({
      user: user,
      authDispatch: authDispatch,
    });
    const serverIds = Object.keys(data.servers);

    serverIds.length > 0
      ? serverDispatch({ type: "SET_SERVERS", payload: data.servers })
      : serverDispatch({ type: "SET_SERVERS", payload: [] });
  } catch (error) {
    handleError(error, authDispatch);
  }
};

const getConversationDetails = async (
  memberProfileId,
  myProfileId,
  authDispatch,
  conversationsDispatch
) => {
  try {
    const [conversationData, conversationMessagesData] = await Promise.all([
      fetchConversation({
        memberProfileId: memberProfileId,
        myProfileId: myProfileId,
        authDispatch: authDispatch,
      }),
      fetchConversationMessages({
        memberProfileId: memberProfileId,
        myProfileId: myProfileId,
        authDispatch: authDispatch,
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
    handleError(error, authDispatch);
  }
};

const getAllConversations = async (
  profileId,
  authDispatch,
  conversationsDispatch
) => {
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
  } catch (error) {
    handleError(error, authDispatch);
  }
};

const getChannelOnly = async (
  serverId,
  channelId,
  authDispatch,
  channelsDispatch
) => {
  try {
    const [channelData, messagesData] = await Promise.all([
      fetchChannel({
        serverId: serverId,
        channelId: channelId,
        authDispatch: authDispatch,
      }),
      fetchChannelMessages({
        channelId: channelId,
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
    handleError(error, authDispatch);
  }
};

const getChannelAndServer = async (
  user,
  serverId,
  channelId,
  authDispatch,
  serverDispatch,
  channelsDispatch
) => {
  try {
    const [serverData, channelData, messagesData] = await Promise.all([
      fetchServer({
        user: user,
        serverId: serverId,
        authDispatch: authDispatch,
      }),
      fetchChannel({
        serverId: serverId,
        channelId: channelId,
        authDispatch: authDispatch,
      }),
      fetchChannelMessages({
        channelId: channelId,
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
    handleError(error, authDispatch);
  }
};

const getMoreServerMessages = async (
  myMembershipId,
  channelId,
  cursor,
  channelsDispatch,
  authDispatch,
  messages
) => {
  try {
    const messageData = await fetchMoreServerMessages({
      myMembershipId: myMembershipId,
      channelId: channelId,
      cursor: cursor,
      authDispatch: authDispatch,
    });

    channelsDispatch({
      type: "SET_MESSAGES",
      payload: {
        messages: [...messages, ...messageData.messages],
        cursor: messageData.newCursor || cursor,
        hasMore: messageData.hasMoreMessages,
      },
    });
    return false; // returning error
  } catch (error) {
    await handleError(error, authDispatch);
    return true; // returning error
  }
};

const processReceivedServerMessage = (
  message,
  messages,
  channelId,
  cursor,
  hasMore,
  channelsDispatch
) => {
  if (message.channelId === channelId) {
    messages?.length
      ? channelsDispatch({
          type: "SET_MESSAGES",
          payload: {
            messages: [message, ...messages],
            cursor: cursor,
            hasMore: hasMore,
          },
        })
      : channelsDispatch({
          type: "SET_MESSAGES",
          payload: {
            messages: [message, ...messages],
            cursor: message.createdAt,
            hasMore: false,
          },
        });
  }
};

const processEditedServerMessage = (
  message,
  messages,
  channelId,
  cursor,
  hasMore,
  channelsDispatch
) => {
  if (message.channelId === channelId) {
    const messageIndex = messages.findIndex((msg) => {
      return msg._id === message._id;
    });

    // If the message is found in the array, update it
    if (messageIndex !== -1) {
      const updatedMessages = [...messages];
      updatedMessages[messageIndex] = message;

      // Update the state with the updated message
      channelsDispatch({
        type: "SET_MESSAGES",
        payload: {
          messages: updatedMessages,
          cursor: cursor,
          hasMore: hasMore,
        },
      });
    } else {
      // Handle the case where the message to update is not found
      console.error("Message not found for update:");
    }
  }
};

const getMoreDirectMessages = async (
  conversationId,
  cursor,
  conversationsDispatch,
  authDispatch,
  messages
) => {
  try {
    const messageData = await fetchMoreDirectMessages({
      conversationId: conversationId,
      cursor: cursor,
      authDispatch: authDispatch,
    });

    conversationsDispatch({
      type: "SET_MESSAGES",
      payload: {
        messages: [...messages, ...messageData.messages],
        cursor: messageData.newCursor || cursor,
        hasMore: messageData.hasMoreMessages,
      },
    });
    return false; // returning error
  } catch (error) {
    handleError(error, authDispatch);
    return true; // returning error
  }
};

const processReceivedDirectMessage = (
  message,
  messages,
  profileId,
  cursor,
  hasMore,
  conversationsDispatch
) => {
  const newMessageArray = [message, ...messages];

  if (message.senderId === profileId || message.receiverId === profileId) {
    messages.length
      ? conversationsDispatch({
          type: "SET_MESSAGES",
          payload: {
            messages: [message, ...messages],
            cursor: cursor,
            hasMore: hasMore,
          },
        })
      : conversationsDispatch({
          type: "SET_MESSAGES",
          payload: {
            messages: [message, ...messages],
            cursor: message.createdAt,
            hasMore: false,
          },
        });
  }
};

const processEditedDirectMessage = (
  message,
  messages,
  conversationId,
  cursor,
  hasMore,
  conversationsDispatch
) => {
  if (message.conversationId === conversationId) {
    const messageIndex = messages.findIndex((msg) => {
      return msg._id === message._id;
    });

    // If the message is found in the array, update it
    if (messageIndex !== -1) {
      const updatedMessages = [...messages];
      updatedMessages[messageIndex] = message;

      // Update the state with the updated message
      conversationsDispatch({
        type: "SET_MESSAGES",
        payload: {
          messages: updatedMessages,
          cursor: cursor,
          hasMore: hasMore,
        },
      });
    } else {
      // Handle the case where the message to update is not found
      console.error("Message not found for update:");
    }
  }
};

export {
  getAllServers,
  getAllConversations,
  getChannelAndServer,
  getChannelOnly,
  getConversationDetails,
  getMoreServerMessages,
  processReceivedServerMessage,
  processEditedServerMessage,
  getMoreDirectMessages,
  processReceivedDirectMessage,
  processEditedDirectMessage,
};
