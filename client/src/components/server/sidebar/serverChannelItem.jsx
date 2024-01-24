import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Edit, Hash, Lock, Mic, Trash, Video } from "lucide-react";
import { ActionTooltip } from "@/components/actionTooltip";
import { useNavigate } from "react-router-dom";
import useChannels from "@/hooks/useChannels";
import { getChannelOnly } from "@/lib/context-helper";
import useAuth from "@/hooks/useAuth";

const iconMap = {
  TEXT: Hash,
  AUDIO: Mic,
  VIDEO: Video,
};

const ServerChannelItem = ({ channel, role, type, activeServer }) => {
  const Icon = iconMap[type];
  const activeChannel = useChannels("activeChannel");
  const [clicked, setClicked] = useState(false);
  const navigate = useNavigate();
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
        "group px-2 py-1 rounded-sm flex items-center gap-x-2 w-full dark:hover:bg-zinc-700 hover:bg-zinc-700/20 transition mb-1",
        (activeChannel._id === channel.id || clicked) &&
          "bg-zinc-700/20 dark:bg-zinc-700"
      )}
      onClick={onClick}
    >
      <Icon className="flex-shrink-0 w-4 h-4 text-zinc-500 dark:text-zinc-400" />
      <p
        className={cn(
          "line-clamp-1 font-semibold text-sm transition",
          activeChannel?._id !== channel.id &&
            "text-primary dark:text-zinc-300 dark:text-zinc-300",
          activeChannel?._id === channel.id && "text-primary dark:text-white"
        )}
      >
        {channel.name}
      </p>
      {channel.name !== "general" && role !== "GUEST" && (
        <div className="ml-auto flex items-center gap-x-2">
          <ActionTooltip label="Edit">
            <Edit
              onClick={(e) => onAction(e, "editChannel")}
              className="hidden group-hover:block w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
            />
          </ActionTooltip>
          {/* <ActionTooltip label="Delete">
            <Trash className="hidden group-hover:block w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition" />
          </ActionTooltip> */}
        </div>
      )}
      {channel.name === "general" && (
        <Lock className="ml-auto w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
      )}
    </button>
  );
};

export default ServerChannelItem;

//
