import React from "react";
import ConversationHeader from "@/components/conversation/header/conversationHeader";
import ChannelHeader from "../channel/header/channelHeader";
import MnInput from "./mnInput";
import useMisc from "@/hooks/useMisc";

const ConversationMain = ({ data, type }) => {
  const activeConversation = useMisc("activeConversation");

  console.log(type);

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col justify-between h-full">
      {(type === "server" || type === "channel") && <ConversationHeader />}

      {type === "messages" && <ConversationHeader />}
      {type === "conversation" &&
        (data ? (
          <ChannelHeader type={type} data={data} />
        ) : (
          <ConversationHeader />
        ))}
      <div></div>
      <MnInput />
    </div>
  );
};

export default ConversationMain;
