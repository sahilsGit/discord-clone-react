import React from "react";
import ConversationHeader from "@/components/conversation/header/conversationHeader";
import ChannelHeader from "../channel/header/channelHeader";

const ConversationMain = ({ data, type }) => {
  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      {type === "messages" ? (
        <ConversationHeader />
      ) : (
        <ChannelHeader type={type} data={data} />
      )}
    </div>
  );
};

export default ConversationMain;
