import React from "react";
import ChannelMain from "./channelMain";
import ConversationMain from "./conversationMain";

const MainWrapper = ({ type, data }) => {
  return (
    <div className="h-full">
      {type === "channel" || type === "server" ? (
        <ChannelMain data={data} type={type} />
      ) : (
        <ConversationMain data={data} type={type} />
      )}
    </div>
  );
};

export default MainWrapper;
