import React from "react";
import MainServer from "./mainServer";
import MainConversation from "./mainConversation";
import { MessagesContextProvider } from "@/context/Messages-Context";
import { DirectMessagesContextProvider } from "@/context/DirectMessages-Context";

const MainWrapper = ({ type }) => {
  console.log("main Wrapper");

  return (
    <div className="h-full">
      {type === "channel" || type === "server" ? (
        <MessagesContextProvider>
          <MainServer type={type} />
        </MessagesContextProvider>
      ) : (
        <DirectMessagesContextProvider>
          <MainConversation type={type} />
        </DirectMessagesContextProvider>
      )}
    </div>
  );
};

export default MainWrapper;
