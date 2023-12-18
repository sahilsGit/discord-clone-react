import { useContext } from "react";
import { ServerContext } from "@/context/Servers-Context";

const useServer = (value) => {
  switch (value) {
    case "servers":
      return useContext(ServerContext).servers;
    case "activeServer":
      return useContext(ServerContext).activeServer;
    case "serverCandidate":
      return useContext(ServerContext).serverCandidate;
    case "channelCandidate":
      return useContext(ServerContext).channelCandidate;
    case "serverDetails":
      return useContext(ServerContext).serverDetails;
    case "channelDetails":
      return useContext(ServerContext).channelDetails;
    case "activeChannel":
      return useContext(ServerContext).activeChannel;
    case "dispatch":
      return useContext(ServerContext).dispatch;
    default:
      return useContext(ServerContext).activeServer;
  }
};

export default useServer;
