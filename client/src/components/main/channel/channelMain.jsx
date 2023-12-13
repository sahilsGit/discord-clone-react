import React from "react";
import ChatHeader from "../chat/chatHeader";
import ChatInput from "../chat/chatInput";
import useServer from "@/hooks/useServer";

const ChannelMain = () => {
  const serverDetails = useServer("serverDetails");
  if (!serverDetails) {
    return <p>loading.....</p>;
  }
  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <ChatHeader type="channel" data={null} />
      <div className="flex-1">Future Messages</div>
      <ChatInput />
    </div>
  );
};

export default ChannelMain;
