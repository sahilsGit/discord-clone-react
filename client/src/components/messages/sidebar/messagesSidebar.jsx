import React from "react";
import MessagesSearch from "./messagesSearch";
import MessagesScrollArea from "./messagesScrollArea";
import MessagesFriends from "./messagesFriends";

const MessagesSidebar = () => {
  return (
    <>
      <div className="flex h-10 border-neutral-200 dark:border-neutral-800 border-b-2">
        <MessagesSearch />
      </div>
      <MessagesFriends />
      <MessagesScrollArea />
    </>
  );
};

export default MessagesSidebar;
