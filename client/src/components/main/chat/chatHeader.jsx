import MobileToggle from "@/components/mobileToggle";
import { UserAvatar } from "@/components/userAvatar";
import useServer from "@/hooks/useServer";
import { Hash } from "lucide-react";
import React from "react";

const ChatHeader = ({ type, data }) => {
  let name;

  if (type !== "messages" && type !== "conversation")
    name = useServer("channelDetails").name;
  // else Get the name from data

  return (
    <div className="text-md font-semibold px-3 flex items-center h-10 border-neutral-200 dark:border-neutral-800 border-b-2">
      <MobileToggle />
      {type === "channel" && (
        <Hash className="w-5 h-5 text-zinc-500 dark:text-zinc-400 mr-2" />
      )}
      <p className="font-semibold text-md text-black dark:text-white">{name}</p>
    </div>
  );
};

export default ChatHeader;
