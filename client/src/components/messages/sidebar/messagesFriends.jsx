import { cn } from "@/lib/utils";
import { Users } from "lucide-react";
import React from "react";
import { useParams } from "react-router-dom";

const MessagesFriends = () => {
  const params = useParams();
  return (
    <div className="py-2 px-1.5">
      <button className="group px-2 py-2 rounded-sm flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-1">
        <Users />
        <p className="line-clamp-1 font-semibold text-sm text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition">
          Friends
        </p>
      </button>
    </div>
  );
};

export default MessagesFriends;
