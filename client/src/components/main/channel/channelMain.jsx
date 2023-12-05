import React from "react";
import ChatHeader from "./chatHeader";

const ChannelMain = () => {
  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <ChatHeader type="channel" />
    </div>
  );
};

export default ChannelMain;
