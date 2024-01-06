import { useContext } from "react";
import { ServerContext } from "@/context/Servers-Context";

const useServer = (value) => {
  switch (value) {
    case "servers":
      return useContext(ServerContext).servers;
    case "serverDetails":
      return useContext(ServerContext).serverDetails;
    case "channelDetails":
      return useContext(ServerContext).channelDetails;
    case "dispatch":
      return useContext(ServerContext).dispatch;
    default:
      return useContext(ServerContext).serverDetails;
  }
};

export default useServer;
