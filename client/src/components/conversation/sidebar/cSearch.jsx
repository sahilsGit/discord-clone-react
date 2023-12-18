import React from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { useState } from "react";

const CSearch = () => {
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
            Find or start a conversation
          </p>
        </div>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search channels & members" />
        <CommandList>
          <CommandEmpty>No Results found</CommandEmpty>
        </CommandList>
      </CommandDialog>
    </div>
  );
};

export default CSearch;
