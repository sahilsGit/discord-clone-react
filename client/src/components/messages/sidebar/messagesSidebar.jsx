import React from "react";
import MessagesSearch from "./messagesSearch";
import MessagesScrollArea from "./messagesScrollArea";
import MessagesFriends from "./messagesFriends";
import ServerProfileControl from "@/components/server/sidebar/serverProfileControl";

const MessagesSidebar = () => {
  return (
    <div className="flex h-full flex-col">
      <MessagesSearch />
      <MessagesFriends />
      <MessagesScrollArea />
      <ServerProfileControl />
    </div>
  );
};

export default MessagesSidebar;
