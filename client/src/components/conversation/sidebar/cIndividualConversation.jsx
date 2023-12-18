import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import useAuth from "@/hooks/useAuth";
import useMisc from "@/hooks/useMisc";
import { UserAvatar } from "@/components/userAvatar";

const CIndividualConversation = ({ conversation, profile }) => {
  const params = useParams();
  const navigate = useNavigate();
  const [clicked, setClicked] = useState(null);
  const profileId = useAuth("id");
  const activeConversation = useMisc("activeConversation");

  const onClick = () => {
    setClicked(conversation._id);
    navigate(`/@me/conversations/${profile._id}/${profileId}`);
  };

  const onAction = (e, action) => {
    e.stopPropagation();
  };

  return (
    <button
      className={cn(
        "group px-2 py-1 rounded-sm flex items-center gap-x-2 w-full dark:hover:bg-zinc-700 hover:bg-zinc-700/20 transition mb-1",
        (activeConversation === conversation?._id ||
          params.memberProfileId === clicked) &&
          "bg-zinc-700/20 dark:bg-zinc-700"
      )}
      onClick={onClick}
    >
      <UserAvatar subject={profile} className="md:h-[30px] md:w-[30px]" />
      <p
        className={cn(
          "line-clamp-1 text-sm transition",
          activeConversation !== conversation?._id &&
            "text-primary dark:text-zinc-300 dark:text-zinc-300",
          activeConversation === conversation?._id &&
            "text-primary dark:text-white"
        )}
      >
        {profile.name}
      </p>
    </button>
  );
};

export default CIndividualConversation;

//
