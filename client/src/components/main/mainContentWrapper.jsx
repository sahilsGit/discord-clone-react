import React from "react";
import ChannelMain from "./channel/channelMain";
import MessagesMain from "./messages/messagesMain";

const MainContentWrapper = ({ type, data }) => {
  return (
    <div className="h-full">
      {type === "messages" ? <MessagesMain data={data} /> : <ChannelMain />}
    </div>
  );
};

export default MainContentWrapper;
