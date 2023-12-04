import React from "react";
import ChannelMain from "./channel/channelMain";
import MessagesMain from "./messages/messagesMain";

const MainContentWrapper = ({ type }) => {
  return <div>{type === "messages" ? <MessagesMain /> : <ChannelMain />}</div>;
};

export default MainContentWrapper;
