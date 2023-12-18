import { useContext } from "react";
import { MiscContext } from "@/context/Misc-Context";

const useMisc = (value) => {
  switch (value) {
    case "allconversations":
      return useContext(MiscContext).allConversations;
    case "activeConversation":
      return useContext(MiscContext).activeConversation;
    case "dispatch":
      return useContext(MiscContext).dispatch;
    default:
      return useContext(MiscContext).allConversations;
  }
};

export default useMisc;
