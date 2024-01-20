import { MessagesContext } from "@/context/Messages-Context";
import { useContext } from "react";

const useMessages = (value) => {
  switch (value) {
    case "messages":
      return useContext(MessagesContext).messages;
    case "hasMore":
      return useContext(MessagesContext).hasMore;
    case "cursor":
      return useContext(MessagesContext).cursor;
    case "dispatch":
      return useContext(MessagesContext).dispatch;
    default:
      return useContext(MessagesContext).messages;
  }
};

export default useMessages;
