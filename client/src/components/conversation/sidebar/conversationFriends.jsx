import useConversations from "@/hooks/useConversations";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const ConversationFriends = () => {
  const [clicked, setClicked] = useState(false);
  const activeConversation = useConversations("activeConversation");
  const navigate = useNavigate();
  const conversationsDispatch = useConversations("dispatch");
  const params = useParams();

  const onClick = () => {
    setClicked(true);

    conversationsDispatch({ type: "SET_ACTIVE_CONVERSATION", payload: null });
    navigate("/@me/conversations");
  };

  useEffect(() => {
    activeConversation ? setClicked(false) : setClicked(true);
  }, [activeConversation]);

  return (
    <div className="py-2 px-1.5">
      <button
        onClick={onClick}
        className={cn(
          "group px-2 py-1 rounded-sm flex items-center gap-x-2 w-full dark:hover:bg-zinc-700 hover:bg-zinc-700/20 transition mb-1",
          clicked && "bg-zinc-700/20 dark:bg-zinc-700"
        )}
      >
        <Users
          className={cn(
            "line-clamp-1 font-semibold text-sm text-zinc-500 dark:text-zinc-400 transition",
            params.memberProfileId
              ? "group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
              : "text-zinc-600 dark:text-zinc-300"
          )}
        />
        <p
          className={cn(
            "line-clamp-1 font-semibold text-sm text-zinc-500 dark:text-zinc-400 transition",
            params.memberProfileId
              ? "group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
              : "text-zinc-600 dark:text-zinc-300"
          )}
        >
          Friends
        </p>
      </button>
    </div>
  );
};

export default ConversationFriends;
