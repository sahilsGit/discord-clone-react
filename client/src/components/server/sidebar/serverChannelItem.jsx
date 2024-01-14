import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Edit, Hash, Lock, Mic, Trash, Video } from "lucide-react";
import { ActionTooltip } from "@/components/actionTooltip";
import useServer from "@/hooks/useServer";
import { get } from "@/services/api-service";
import { handleError, handleResponse } from "@/lib/response-handler";
import useAuth from "@/hooks/useAuth";

const iconMap = {
  TEXT: Hash,
  AUDIO: Mic,
  VIDEO: Video,
};

const ServerChannelItem = ({ channel, role, server, type }) => {
  const Icon = iconMap[type];
  const channelDetails = useServer("channelDetails");
  const [clicked, setClicked] = useState(false);
  const access_token = useAuth("token");
  const serverDispatch = useServer("dispatch");
  const serverDetails = useServer("serverDetails");
  const authDispatch = useAuth("dispatch");

  const fetchChannelData = async () => {
    try {
      const [response, messages] = await Promise.all([
        get(`/channels/${serverDetails.id}/${channel.id}`, access_token),
        get(`/messages/fetch?channelId=${channel.id}`, access_token),
      ]);

      const [channelData, messageData] = await Promise.all([
        handleResponse(response, authDispatch),
        handleResponse(messages, authDispatch),
      ]);

      const channelDetails = {
        ...channelData.channel[1],
        messages: {
          data: messageData.messages,
          cursor: messageData.newCursor,
          hasMoreMessages: messageData.hasMoreMessages,
        },
      };

      serverDispatch({
        type: "SET_CUSTOM",
        payload: {
          serverDetails: channelData.server,
          channelDetails: channelDetails,
        },
      });
    } catch (err) {
      const errCode = handleError(err, authDispatch);

      if (errCode === 404) {
        navigate("/@me/conversations");
      }
    }
  };

  const onClick = () => {
    setClicked(true);
    fetchChannelData();
  };

  const onAction = (e, action) => {
    e.stopPropagation();
    // onOpen(action, { channel, server });
  };

  useEffect(() => {
    if (
      !serverDetails ||
      !channelDetails ||
      channelDetails._id !== channel.id
    ) {
      setClicked(false);
    }
  }, [channelDetails, serverDetails]);

  return (
    <button
      className={cn(
        "group px-2 py-1 rounded-sm flex items-center gap-x-2 w-full dark:hover:bg-zinc-700 hover:bg-zinc-700/20 transition mb-1",
        (channelDetails._id === channel.id || clicked) &&
          "bg-zinc-700/20 dark:bg-zinc-700"
      )}
      onClick={onClick}
    >
      <Icon className="flex-shrink-0 w-4 h-4 text-zinc-500 dark:text-zinc-400" />
      <p
        className={cn(
          "line-clamp-1 font-semibold text-sm transition",
          channelDetails?._id !== channel.id &&
            "text-primary dark:text-zinc-300 dark:text-zinc-300",
          channelDetails?._id === channel.id && "text-primary dark:text-white"
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
