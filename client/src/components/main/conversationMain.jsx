import React from "react";
import ConversationHeader from "@/components/conversation/header/conversationHeader";
import ChannelHeader from "../channel/header/channelHeader";
import MnInput from "./mnInput";
import useMisc from "@/hooks/useMisc";

const ConversationMain = () => {
  const activeConversation = useMisc("activeConversation");

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col justify-between h-full">
      {activeConversation ? (
        <ChannelHeader type="messages" />
      ) : (
        <ConversationHeader />
      )}

      <div></div>
      <MnInput />
    </div>
  );
};

export default ConversationMain;
