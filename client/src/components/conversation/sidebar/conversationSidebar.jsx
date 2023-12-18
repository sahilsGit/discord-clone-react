import React from "react";
import ProfileControl from "@/components/profileControl";
import CSearch from "./cSearch";
import CFriends from "./cFriends";
import CScrollArea from "./cScrollArea";

const ConversationSidebar = () => {
  return (
    <div className="flex h-full flex-col">
      <div className="h-[48px]">
        <CSearch />
      </div>
      <CFriends />
      <CScrollArea />
      <div className="h-[53px]">
        <ProfileControl />
      </div>
    </div>
  );
};

export default ConversationSidebar;
