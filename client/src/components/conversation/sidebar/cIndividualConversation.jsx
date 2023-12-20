import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import useAuth from "@/hooks/useAuth";
import useMisc from "@/hooks/useMisc";
import { UserAvatar } from "@/components/userAvatar";
import { get } from "@/services/api-service";
import { handleError, handleResponse } from "@/lib/response-handler";

const CIndividualConversation = ({ conversation, profile }) => {
  const params = useParams();
  const [clicked, setClicked] = useState(false);
  const activeConversation = useMisc("activeConversation");
  const access_token = useAuth("token");
  const authDispatch = useAuth("dispatch");
  const miscDispatch = useMisc("dispatch");
  const profileId = useAuth("id");

  const fetchConversation = async () => {
    try {
      const response = await get(
        `/conversations/${profile._id}/${profileId}`,
        access_token
      );

      const data = await handleResponse(response, authDispatch);

      miscDispatch({
        type: "SET_ACTIVE_CONVERSATION",
        payload: {
          id: data.conversation._id,
          profileId: data.memberProfile._id,
          name: data.memberProfile.name,
          image: data.memberProfile.image ? data.memberProfile.image : null,
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

export default CIndividualConversation;

//
