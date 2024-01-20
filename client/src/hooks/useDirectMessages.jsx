import { DirectMessagesContext } from "@/context/DirectMessages-Context";
import { useContext } from "react";

const useDirectMessages = (value) => {
  switch (value) {
    case "messages":
      return useContext(DirectMessagesContext).messages;
    case "hasMore":
      return useContext(DirectMessagesContext).hasMore;
    case "cursor":
      return useContext(DirectMessagesContext).cursor;
    case "dispatch":
      return useContext(DirectMessagesContext).dispatch;
    default:
      return useContext(DirectMessagesContext).messages;
  }
};

export default useDirectMessages;
