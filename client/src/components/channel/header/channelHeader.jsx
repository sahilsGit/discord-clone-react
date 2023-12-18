import MobileToggle from "@/components/mobileToggle";
import useServer from "@/hooks/useServer";
import { Hash } from "lucide-react";
import React from "react";

const ChannelHeader = ({ type, data }) => {
  const channelDetails = useServer("channelDetails");
  let name;

  console.log(data);

  if (type === "channel" || (type === "server" && channelDetails)) {
    name = channelDetails.name;
  }

  return (
    <div className="pl-4 text-md px-3 flex items-center h-[48px] border-neutral-200 dark:border-neutral-800 border-b-2">
      <MobileToggle />
      {(type === "channel" || type === "server") && (
        <Hash className="w-5 h-5 text-zinc-500 dark:text-zinc-400 mr-2" />
      )}
      <p className="font-semibold text-md text-black dark:text-white">{name}</p>
    </div>
  );
};

export default ChannelHeader;
