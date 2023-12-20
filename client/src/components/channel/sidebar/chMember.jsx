import { UserAvatar } from "@/components/userAvatar";
import useAuth from "@/hooks/useAuth";
import useMisc from "@/hooks/useMisc";
import { handleError, handleResponse } from "@/lib/response-handler";
import { cn } from "@/lib/utils";
import { get } from "@/services/api-service";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const ChMember = ({ member, server }) => {
  console.log("chMember");
  const authDispatch = useAuth("dispatch");
  const access_token = useAuth("token");

  const params = useParams();
  const profileId = useAuth("id");
  const miscDispatch = useMisc("dispatch");
  const [data, setData] = useState();

  const fetchConversation = async () => {
    console.log("fetdcing");
    if (member.profileId === profileId) {
      return;
    }
    try {
      const response = await get(
        `/conversations/${member.profileId}/${profileId}`,
        access_token
      );

      const data = await handleResponse(response, authDispatch);

      console.log("gdd");
      miscDispatch({
        type: "SET_ACTIVE_CONVERSATION",
        payload: {
          id: data.conversation._id,
          profileId: data.memberProfile._id,
          name: data.memberProfile.name,
          image: data.memberProfile.image ? data.memberProfile.image : null,
        },
      });

      setData(data);
    } catch (err) {
      handleError(err, authDispatch);
    }
  };

  const onClick = () => {
    console.log("inside onclick");
    if (member.profileId === profileId) {
      return;
    }
    console.log("low");

    fetchConversation();
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "group px-2 py-1 rounded-sm flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-1",
        params?.memberProfileId === member.profileId &&
          "bg-zinc-700/20 dark:bg-zinc-700"
      )}
    >
      <div className="flex gap-x-2">
        <UserAvatar subject={member} className="h-5 w-5 md:h-5 md:w-5" />
        <p
          className={cn(
            "font-semibold text-xs text-zinc-500 group-hover:text-zinc-600 text-start dark:text-zinc-400 dark:group-hover:text-zinc-300 transition w-[100px] h-4 truncate",
            params?.memberProfileId === member.profileId &&
              "text-primary dark:text-zinc-200 dark:group-hover:text-white"
          )}
        >
          {member.name}
        </p>
      </div>

      {member.icon}
    </button>
  );
};

export default ChMember;
