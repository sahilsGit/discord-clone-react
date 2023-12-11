import React from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { useState } from "react";

const MessagesSearch = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="group px-2 py-2 w-full group"
        onClick={() => {
          setOpen(true);
        }}
      >
        <div className="flex py-1 px-1 h-full w-full bg-main10 rounded-sm flex items-center gap-x-2 w-full transition group-hover:cursor-text justify-between">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 transition">
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
    </>
  );
};

export default MessagesSearch;
