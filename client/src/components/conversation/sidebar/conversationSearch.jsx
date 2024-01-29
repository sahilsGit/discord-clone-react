import React from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { useState } from "react";

const ConversationSearch = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center justify-center h-[48px] border-neutral-200 dark:border-neutral-800 border-b-2 overflow-hidden">
      <button
        className="group h-[30px] w-[220px]"
        onClick={() => {
          setOpen(true);
        }}
      >
        <div className="flex p-2 h-[30px] w-[220px] bg-main10 rounded-sm flex items-center gap-x-2 w-full transition group-hover:cursor-text justify-between overflow-hidden">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 transition truncate">
            Find Friends
          </p>
        </div>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput disabled="true" placeholder="Search Friends" />
        <div className="py-6 text-center text-sm">Coming Soon!</div>
        {/* <CommandList>
          <CommandEmpty>No results found!</CommandEmpty>
        </CommandList> */}
      </CommandDialog>
    </div>
  );
};

export default ConversationSearch;
