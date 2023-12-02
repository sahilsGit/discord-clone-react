import { UserAvatar } from "@/components/userAvatar";
import { cn } from "@/lib/utils";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";

const ServerMember = ({ member, server }) => {
  const params = useParams();
  const navigate = useNavigate();

  const onClick = () => {
    navigate(`/conversations/${member.id}`);
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "group px-2 py-1 rounded-sm flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-1",
        params?.memberId === member.id && "bg-zinc-700/20 dark:bg-zinc-700"
      )}
    >
      <UserAvatar member={member} className="h-5 w-5 md:h-5 md:w-5" />
      <p
        className={cn(
          "font-semibold text-xs text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition",
          params?.memberId === member.id &&
            "text-primary dark:text-zinc-200 dark:group-hover:text-white"
        )}
      >
        {member.name}
      </p>
      {member.icon}
    </button>
  );
};

export default ServerMember;
