import { ActionTooltip } from "@/components/actionTooltip";
import { useModal } from "@/hooks/useModals";
import useServer from "@/hooks/useServer";
import { Plus, Settings } from "lucide-react";
import React from "react";

const ChSection = ({ sectionType, channelType, role, label }) => {
  const { onOpen } = useModal();
  const server = useServer("serverDetails");
  return (
    <div className="flex items-center justify-between pt-3 py-1.5 pr-1">
      <p className="text-xs uppercase font-semibold text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      {role !== "GUEST" && sectionType === "channels" && (
        <ActionTooltip label="Create Channel" side="top">
          <button
            className="text-zinc-500 flex hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
            onClick={() =>
              onOpen("createChannel", {
                server: server,
                channelType: channelType,
              })
            }
          >
            <Plus className="h-4 w-4 mr-0.5" />
          </button>
        </ActionTooltip>
      )}
      {role === "ADMIN" && sectionType === "members" && (
        <ActionTooltip label="Manage members" side="top">
          <button
            className="text-zinc-500 flex hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
            onClick={() => onOpen("members", { server: server })}
          >
            <Settings className="h-4 w-4" />
          </button>
        </ActionTooltip>
      )}
    </div>
  );
};

export default ChSection;
