import { ConversationsContext } from "@/context/Conversations-Context";
import { useContext } from "react";

const useConversations = (value) => {
  switch (value) {
    case "conversations":
      return useContext(ConversationsContext).conversations;
    case "activeConversation":
      return useContext(ConversationsContext).activeConversation;
    case "messages":
      return useContext(ConversationsContext).messages;
    case "hasMore":
      return useContext(ConversationsContext).hasMore;
    case "cursor":
      return useContext(ConversationsContext).cursor;
    case "cache":
      return useContext(ConversationsContext).cache;
    case "dispatch":
      return useContext(ConversationsContext).dispatch;
    default:
      return useContext(ConversationsContext).conversations;
  }
};

export default useConversations;
