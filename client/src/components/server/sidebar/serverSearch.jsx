import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import React, { useState } from "react";

const ServerSearch = ({ data }) => {
  const [open, setOpen] = useState(false);

  console.log("dddd", data);
  return (
    <>
      <button
        className="group px-2 py-2 w-full group"
        onClick={() => {
          setOpen(true);
        }}
      >
        <div className="flex py-1.5 px-2 h-full w-full bg-main10 rounded-sm flex items-center gap-x-2 w-full transition group-hover:cursor-text justify-between">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 transition">
            Search
          </p>

          <p className="text-xxxs text-zinc-500 dark:text-zinc-400">ctrl + k</p>
        </div>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search channels & members" />
        <CommandList>
          <CommandEmpty>No Results found</CommandEmpty>
          {data.map(({ label, contentArray }) => {
            if (!contentArray?.length) return null;

            return (
              <CommandGroup key={label} heading={label}>
                {contentArray?.map(({ id, icon, name }) => {
                  return (
                    <CommandItem className="flex space-x-3" key={id}>
                      <span>{name}</span>
                      <div>{icon}</div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            );
          })}
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default ServerSearch;
