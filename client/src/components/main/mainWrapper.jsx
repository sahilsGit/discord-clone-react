import React from "react";
import ChannelMain from "./channelMain";
import ConversationMain from "./conversationMain";

const MainWrapper = ({ type }) => {
  return (
    <div className="h-full">
      {type === "channel" || type === "server" ? (
        <ChannelMain type={type} />
      ) : (
        <ConversationMain />
      )}
    </div>
  );
};

export default MainWrapper;
