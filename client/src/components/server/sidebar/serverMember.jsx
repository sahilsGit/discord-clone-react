import { UserAvatar } from "@/components/userAvatar";
import useAuth from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";

const ServerMember = ({ member, server }) => {
  const params = useParams();
  const navigate = useNavigate();
  const profileId = useAuth("id");

  const onClick = () => {
    if (member.profileId === profileId) {
      return;
    }
    navigate(`/@me/conversations/${member.profileId}/${profileId}`);
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
        <UserAvatar member={member} className="h-5 w-5 md:h-5 md:w-5" />
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

export default ServerMember;
