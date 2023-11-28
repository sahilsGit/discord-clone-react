import { useContext } from "react";
import { ServerContext } from "@/context/Servers-Context";

const useServer = (value) => {
  switch (value) {
    case "servers":
      return useContext(ServerContext).servers;
    case "activeServer":
      return useContext(ServerContext).activeServer;
    case "serverDetails":
      return useContext(ServerContext).serverDetails;
    case "members":
      return useContext(ServerContext).members;
    case "channels":
      return useContext(ServerContext).channels;
    case "dispatch":
      return useContext(ServerContext).dispatch;
    default:
      return useContext(ServerContext).activeServer;
  }
};

export default useServer;
