import { Hash } from "lucide-react";
import React, { memo } from "react";

const ServerHeader = memo(({ type, activeChannel, activeConversation }) => {
  let name;

  if (type === "channel") {
    name = activeChannel.name;
  } else {
    name = activeConversation.theirName;
  }

  return (
    <div className="pl-14 lg:pl-1 text-md px-3 flex items-center h-[48px] border-neutral-200 dark:border-neutral-800 border-b-2">
      {(type === "channel" || type === "server") && (
        <Hash className="w-5 h-5 text-zinc-500 dark:text-zinc-400 mr-1" />
      )}
      <div className="flex justify-between w-full">
        <p className="font-semibold text-md text-black dark:text-white">
          {name}
        </p>
      </div>
    </div>
  );
});

export default ServerHeader;
