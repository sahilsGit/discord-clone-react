import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import useAuth from "@/hooks/useAuth";
import { UserAvatar } from "@/components/userAvatar";
import useConversations from "@/hooks/useConversations";
import { getConversationDetails } from "@/lib/context-helper";

const ConversationItem = ({ conversation, profile }) => {
  /*
   *
   * Renders a specific conversation item to be shown in conversations sidebar
   * Triggers a new conversation fetch thereby updating "activeConversation"
   *
   *
   */

  const activeConversation = useConversations("activeConversation");
  const profileId = useAuth("id");
  const authDispatch = useAuth("dispatch");
  const conversationsDispatch = useConversations("dispatch");
  const [clicked, setClicked] = useState(false); // For conditional styling needs

  const onClick = () => {
    setClicked(true);

    // Fetch the conversation and dispatch
    getConversationDetails(
      profile._id,
      profileId,
      authDispatch,
      conversationsDispatch
    );
  };

  useEffect(() => {
    if (!activeConversation || conversation._id !== activeConversation.id) {
      setClicked(false);
    }
  }, [activeConversation]);

  return (
    <button
      className={cn(
        "group px-2 py-1 rounded-sm flex items-center gap-x-2 w-full dark:hover:bg-zinc-700 hover:bg-zinc-700/20 transition mb-1",
        (activeConversation?._id === conversation?._id || clicked) &&
          "bg-zinc-700/20 dark:bg-zinc-700"
      )}
      onClick={onClick}
    >
      <UserAvatar subject={profile} className="md:h-[30px] md:w-[30px]" />
      <p
        className={cn(
          "line-clamp-1 text-sm transition",
          activeConversation?._id !== conversation?._id &&
            "text-primary dark:text-zinc-300 dark:text-zinc-300",
          activeConversation?._id === conversation?._id &&
            "text-primary dark:text-white"
        )}
      >
        {profile.name}
      </p>
    </button>
  );
};

export default ConversationItem;

//
