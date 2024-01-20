import { ChannelsContext } from "@/context/Channels-Context";
import { useContext } from "react";

const useChannels = (value) => {
  switch (value) {
    case "channels":
      return useContext(ChannelsContext).channels;
    case "activeChannel":
      return useContext(ChannelsContext).activeChannel;
    case "dispatch":
      return useContext(ChannelsContext).dispatch;
    default:
      return useContext(ChannelsContext).activeChannel;
  }
};

export default useChannels;
