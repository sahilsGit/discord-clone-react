import React from "react";
import ConversationHeader from "@/components/conversation/header/conversationHeader";
import ServerHeader from "../server/header/serverHeader";
import MainInput from "./mainInput";
import useMisc from "@/hooks/useMisc";

const MainConversation = () => {
  const activeConversation = useMisc("activeConversation");

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col justify-between h-full">
      {activeConversation ? (
        <ServerHeader type="messages" />
      ) : (
        <ConversationHeader />
      )}
      <div></div>
      <MainInput />
    </div>
  );
};

export default MainConversation;
