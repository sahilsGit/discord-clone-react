import { MicOff, Settings, Volume2 } from "lucide-react";
import React from "react";

const ServerProfileControl = () => {
  return (
    <div className="group flex h-12 bg-main09 pt-[2px] pb-[2px] pl-2">
      <div className="w-[195px] h-full hover:bg-zinc-700/10 dark:hover:bg-zinc-600/50 dark:hover:text-zinc-200 transition px-2 rounded-sm text-zinc-400"></div>
      <div className="flex w-full gap-x-[1px] items-center justify-end pr-2">
        <div className="flex items-center justify-center w-7 h-7 hover:bg-zinc-700/10 dark:hover:bg-zinc-600/50 dark:hover:text-zinc-200 transition rounded-sm text-zinc-400">
          <MicOff className="h-4 w-4" />
        </div>
        <div className="flex items-center justify-center w-7 h-7 hover:bg-zinc-700/10 dark:hover:bg-zinc-600/50 dark:hover:text-zinc-200 transition rounded-sm text-zinc-400">
          <Volume2 className="h-4 w-4" />
        </div>
        <div className="flex items-center justify-center w-7 h-7 hover:bg-zinc-700/10 dark:hover:bg-zinc-600/50 dark:hover:text-zinc-200 transition rounded-sm text-zinc-400">
          <Settings className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};

export default ServerProfileControl;
