import React from "react";
import ChatHeader from "../chat/chatHeader";

const MessagesMain = ({ data }) => {
  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <ChatHeader type="messages" data={data} />
    </div>
  );
};

export default MessagesMain;
