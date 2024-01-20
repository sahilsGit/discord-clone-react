import React from "react";
import ProfileControl from "@/components/profileControl";
import ConversationScrollArea from "./conversationScrollArea";
import ConversationSearch from "./conversationSearch";
import ConversationFriends from "./conversationFriends";

/*
 * ConversationSidebar | Component type: Wrapper component
 *
 * This renders the navigation pane that's shown when the user is in DirectMessages tab.
 * Corresponds to "messages" and "conversation" 'type' and shows all conversations list.
 * Includes conversation actions, such as switching between conversations and
 * searching for other users.
 *
 */

const ConversationSidebar = () => {
  console.log("conversations Sidebar");

  return (
    <div className="flex h-full flex-col">
      <div className="h-[48px]">
        <ConversationSearch />
      </div>
      <ConversationFriends />
      <ConversationScrollArea />
      <div className="h-[53px]">
        <ProfileControl />
      </div>
    </div>
  );
};

export default ConversationSidebar;
