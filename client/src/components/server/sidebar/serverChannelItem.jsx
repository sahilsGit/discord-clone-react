import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Edit, Hash, Lock, Mic, Trash, Video } from "lucide-react";
import { ActionTooltip } from "@/components/actionTooltip";
import useChannels from "@/hooks/useChannels";
import { getChannelOnly } from "@/lib/context-helper";
import useAuth from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const iconMap = {
  TEXT: Hash,
  AUDIO: Mic,
  VIDEO: Video,
};

const ServerChannelItem = ({ channel, role, type, activeServer }) => {
  const Icon = iconMap[type];
  const activeChannel = useChannels("activeChannel");
  const [clicked, setClicked] = useState(false);
  const serverId = activeServer.id;
  const authDispatch = useAuth("dispatch");
  const channelsDispatch = useChannels("dispatch");

  const onClick = () => {
    setClicked(true);
    getChannelOnly(serverId, channel.id, authDispatch, channelsDispatch);
  };

  const onAction = (e, action) => {
    e.stopPropagation();
    // onOpen(action, { channel, server });
  };

  useEffect(() => {
    if (!activeServer || !activeChannel || activeChannel._id !== channel.id) {
      setClicked(false);
    }
  }, [activeChannel, activeServer]);

  return (
    <button
      className={cn(
        "group px-2 py-1 rounded-sm h-[30px] flex items-center gap-x-2  w-full dark:hover:bg-zinc-700 hover:bg-zinc-700/20 transition mb-1",
        (activeChannel._id === channel.id || clicked) &&
          "bg-zinc-700/20 dark:bg-zinc-700"
      )}
      onClick={onClick}
    >
      <Icon className="flex-shrink-0 w-4 h-4 text-zinc-600 dark:text-zinc-400" />
      <div className="overflow-hidden truncate text-left w-[160px]">
        <p
          className={cn(
            "font-medium text-sm text-zinc-600 dark:text-zinc-400 w-full transition",
            activeChannel?._id !== channel.id &&
              "dark:group-hover:text-zinc-300",
            activeChannel?._id === channel.id && "text-primary dark:text-white"
          )}
        >
          {channel.name}
        </p>
      </div>
      {channel.name !== "general" && role !== "GUEST" && (
        <button disabled className="ml-auto  flex items-center gap-x-2">
          <ActionTooltip label="Coming Soon">
            <Edit
              onClick={(e) => onAction(e, "editChannel")}
              className="hidden  group-hover:block w-4 h-4 text-zinc-400 dark:text-zinc-400 transition"
            />
          </ActionTooltip>
        </button>
      )}
      {channel.name === "general" && (
        <Lock className="ml-auto w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
      )}
    </button>
  );
};

export default ServerChannelItem;

//
