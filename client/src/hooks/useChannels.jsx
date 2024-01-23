import { ChannelsContext } from "@/context/Channels-Context";
import { useContext } from "react";

const useChannels = (value) => {
  switch (value) {
    case "channels":
      return useContext(ChannelsContext).channels;
    case "activeChannel":
      return useContext(ChannelsContext).activeChannel;
    case "messages":
      return useContext(ChannelsContext).messages;
    case "hasMore":
      return useContext(ChannelsContext).hasMore;
    case "cursor":
      return useContext(ChannelsContext).cursor;
    case "cache":
      return useContext(ChannelsContext).cache;
    case "dispatch":
      return useContext(ChannelsContext).dispatch;
    default:
      return useContext(ChannelsContext).activeChannel;
  }
};

export default useChannels;
