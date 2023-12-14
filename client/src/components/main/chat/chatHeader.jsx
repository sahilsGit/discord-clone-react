import MobileToggle from "@/components/mobileToggle";
import { Separator } from "@/components/ui/separator";
import { UserAvatar } from "@/components/userAvatar";
import useServer from "@/hooks/useServer";
import { Hash, Users } from "lucide-react";
import React from "react";

const ChatHeader = ({ type, data }) => {
  let name;

  if (type !== "messages" && type !== "conversation")
    name = useServer("channelDetails").name;
  // else Get the name from data

  return (
    <div className="pl-4 text-md px-3 flex items-center h-10 border-neutral-200 dark:border-neutral-800 border-b-2">
      <MobileToggle />
      {type === "channel" && (
        <Hash className="w-5 h-5 text-zinc-500 dark:text-zinc-400 mr-2" />
      )}
      {(type === "messages" || type === "conversation") && (
        <div className="group flex justify-between gap-x-2 w-full">
          <div className="flex items-center gap-x-2">
            <div className="flex items-center gap-x-2">
              <Users className="h-5 w-5 text-zinc-400" />
              <p>Friends</p>
            </div>
            <Separator className="mt-[1px] h-5 w-[1px] bg-zinc-300 dark:bg-zinc-700 rounded-md m-1" />
            <p className="hover:bg-zinc-700/10 dark:hover:bg-zinc-600/50 dark:hover:text-zinc-200 transition px-2 rounded-sm text-zinc-400">
              Online
            </p>
            <p className="hover:bg-zinc-700/10 dark:hover:bg-zinc-600/50 dark:hover:text-zinc-200 transition px-2 rounded-sm text-zinc-400">
              All
            </p>
            <p className="hover:bg-zinc-700/10 dark:hover:bg-zinc-600/50 dark:hover:text-zinc-200 transition px-2 rounded-sm text-zinc-400">
              Pending
            </p>
          </div>
          <div className="flex gap-x-2 items-center justify-center">
            <p className="hover:bg-zinc-700/10 dark:hover:bg-zinc-600/50 dark:hover:text-zinc-200 transition px-2 rounded-sm text-zinc-400">
              Blocked
            </p>
            <div className="bg-emerald-600 rounded-sm px-2">
              <p>Add Friend</p>
            </div>
          </div>
        </div>
      )}
      <p className="font-semibold text-md text-black dark:text-white">{name}</p>
    </div>
  );
};

export default ChatHeader;
