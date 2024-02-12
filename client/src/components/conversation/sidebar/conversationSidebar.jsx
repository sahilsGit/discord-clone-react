import React from "react";
import ProfileControl from "@/components/profileControl";
import ConversationScrollArea from "./conversationScrollArea";
import ConversationSearch from "./conversationSearch";
import ConversationFriends from "./conversationFriends";
import useConversations from "@/hooks/useConversations";
import useAuth from "@/hooks/useAuth";

/*
 * ConversationSidebar
 *
 * Renders the navigation pane that's shown when the user is in conversation tab.
 * Corresponds to "conversation" 'type' and shows all conversations list.
 * Includes conversation actions, such as switching between conversations and
 * searching for other users.
 *
 */

const ConversationSidebar = () => {
  const conversations = useConversations("conversations");
  const profileId = useAuth("id");
  const activeConversation = useConversations("activeConversation");
  const profileName = useAuth("name");
  const username = useAuth("user");
  const profileImage = useAuth("image");
  const email = useAuth("email");
  const about = useAuth("about");

  return (
    <div className="flex h-full flex-col">
      <div className="h-[48px]">
        {/* SearchBar to let users search friends | coming soon! */}
        <ConversationSearch />
      </div>
      {/* Button to show the friends list | coming soon!  */}
      <ConversationFriends />
      {/* List of conversations the user is part of */}
      <ConversationScrollArea
        conversations={conversations}
        activeConversation={activeConversation}
        profileId={profileId}
      />

      {/* Ever present profile control */}
      <div className="h-[53px]">
        <ProfileControl
          profileName={profileName}
          username={username}
          profileImage={profileImage}
          email={email}
          about={about}
        />
      </div>
    </div>
  );
};

export default ConversationSidebar;
