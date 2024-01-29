import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import useAuth from "@/hooks/useAuth";
import useChannels from "@/hooks/useChannels";
import useConversations from "@/hooks/useConversations";
import { getChannelOnly, getConversationDetails } from "@/lib/context-helper";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ServerSearch = ({ data }) => {
  const [open, setOpen] = useState(false);
  const params = useParams();
  const authDispatch = useAuth("dispatch");
  const channelsDispatch = useChannels("dispatch");
  const conversationsDispatch = useConversations("dispatch");
  const myProfileId = useAuth("id");

  console.log("logging dd", data);
  useEffect(() => {
    const press = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", press);

    return () => document.removeEventListener("keydown", press);
  }, []);

  const onClick = async ({ id, itemType, profileId }) => {
    if (itemType === "channel") {
      await getChannelOnly(
        params?.serverId,
        id,
        authDispatch,
        channelsDispatch
      );
    }

    if (itemType === "member") {
      await getConversationDetails(
        profileId,
        myProfileId,
        authDispatch,
        conversationsDispatch
      );
    }

    setOpen(false);
    return;
  };

  return (
    <>
      <button
        className="group px-2 py-[10px] w-full group"
        onClick={() => {
          setOpen(true);
        }}
      >
        <div className="flex py-1.5 px-2 h-[32px] w-full bg-main10 rounded-sm flex items-center transition group-hover:cursor-text justify-between overflow-hidden">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 transition">
            Search
          </p>
          <kbd className="text-xxxs tracking-tighter text-zinc-500 dark:text-zinc-400">
            ctrl + k
          </kbd>
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
                {contentArray?.map(
                  ({ id, icon, name, profileId, itemType }) => {
                    return (
                      <CommandItem
                        className="flex space-x-3"
                        key={id}
                        onSelect={() => onClick({ id, profileId, itemType })}
                      >
                        <span>{name}</span>
                        <div>{icon}</div>
                      </CommandItem>
                    );
                  }
                )}
              </CommandGroup>
            );
          })}
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default ServerSearch;
