import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import useAuth from "@/hooks/useAuth";
import useMisc from "@/hooks/useMisc";
import { UserAvatar } from "@/components/userAvatar";
import { get } from "@/services/api-service";
import { handleError, handleResponse } from "@/lib/response-handler";

const ConversationItem = ({ conversation, profile }) => {
  const [clicked, setClicked] = useState(false);
  const activeConversation = useMisc("activeConversation");
  const access_token = useAuth("token");
  const authDispatch = useAuth("dispatch");
  const miscDispatch = useMisc("dispatch");
  const profileId = useAuth("id");

  const fetchConversation = async () => {
    console.log("....fetching from conv. Item");
    try {
      const [response, messages] = await Promise.all([
        get(`/conversations/${profile._id}/${profileId}`, access_token),
        get(
          `/messages/fetch?memberProfileId=${profile._id}&myProfileId=${profileId}`,
          access_token
        ),
      ]);

      const [conversationsData, messageData] = await Promise.all([
        handleResponse(response, authDispatch),
        handleResponse(messages, authDispatch),
      ]);

      // Populate / Re-populate the conversation's context
      miscDispatch({
        type: "SET_ACTIVE_CONVERSATION",
        payload: {
          id: conversationsData.conversation._id,
          profileId: conversationsData.memberProfile._id,
          name: conversationsData.memberProfile.name,
          image: conversationsData.memberProfile.image
            ? conversationsData.memberProfile.image
            : null, // For rendering fallback the image
          messages: {
            data: messageData.messages,
            cursor: messageData.newCursor,
            hasMoreMessages: messageData.hasMoreMessages,
          },
        },
      });
    } catch (err) {
      handleError(err, authDispatch);
    }
  };

  const onClick = () => {
    setClicked(true);
    fetchConversation();
  };

  useEffect(() => {
    if (!activeConversation || conversation._id !== activeConversation.id) {
      setClicked(false);
    }
  }, [activeConversation]);

  const onAction = (e, action) => {
    e.stopPropagation();
  };

  return (
    <button
      className={cn(
        "group px-2 py-1 rounded-sm flex items-center gap-x-2 w-full dark:hover:bg-zinc-700 hover:bg-zinc-700/20 transition mb-1",
        (activeConversation?.id === conversation?._id || clicked) &&
          "bg-zinc-700/20 dark:bg-zinc-700"
      )}
      onClick={onClick}
    >
      <UserAvatar subject={profile} className="md:h-[30px] md:w-[30px]" />
      <p
        className={cn(
          "line-clamp-1 text-sm transition",
          activeConversation?.id !== conversation?._id &&
            "text-primary dark:text-zinc-300 dark:text-zinc-300",
          activeConversation?.id === conversation?._id &&
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
