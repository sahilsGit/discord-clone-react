import { ActionTooltip } from "@/components/actionTooltip";
import { ScrollArea } from "@/components/ui/scrollArea";
import { Plus } from "lucide-react";
import React from "react";
import ConversationItem from "./conversationItem";
import useConversations from "@/hooks/useConversations";

const ConversationScrollArea = () => {
  const conversations = useConversations("conversations");

  return (
    <>
      <div className="px-2">
        <div className="flex items-center justify-between pt-2 py-1.5 pr-1">
          <p className="text-xs uppercase font-semibold text-zinc-500 dark:text-zinc-400">
            Direct Messages
          </p>

          <ActionTooltip label="Create DM" side="top">
            <button
              className="text-zinc-500 flex hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
              onClick={() => {}}
            >
              <Plus className="h-4 w-4 mr-0.5" />
            </button>
          </ActionTooltip>
        </div>
      </div>
      <ScrollArea className="px-2 grow">
        {conversations?.length && (
          <div className="mb-1">
            {conversations
              .filter(
                (conversation) =>
                  conversation.initiatedBy || conversation.initiatedFor
              ) // This expects a non-null value, but a null was being returned sometimes strangly
              .map((conversation) => (
                <ConversationItem
                  key={conversation._id}
                  profile={
                    conversation.initiatedBy
                      ? conversation.initiatedBy
                      : conversation.initiatedFor
                  }
                  conversation={conversation}
                />
              ))}
          </div>
        )}
      </ScrollArea>
    </>
  );
};

export default ConversationScrollArea;
