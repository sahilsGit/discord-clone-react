export const ConversationEventEnum = Object.freeze({
  CONNECTED: "connected",
  DISCONNECT: "disconnect",
  JOIN_CONVERSATION: "joinConversation",
  MESSAGE_RECEIVED: "messageReceived",
  MESSAGE_EDITED: "messageEdited",
  MESSAGE_DELETED: "messageDeleted",
  NEW_CONVERSATION: "newConversation",
  SOCKET_ERROR: "socketError",
  STOP_TYPING: "stopTyping",
  TYPING: "typing",
});

export const USER_TEMPORARY_TOKEN_EXPIRY = 20 * 60 * 1000; // 20 minutes
