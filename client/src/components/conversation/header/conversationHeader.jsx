import { ActionTooltip } from "@/components/actionTooltip";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Users } from "lucide-react";
import React from "react";

const ConversationHeader = () => {
  /*
   *
   *
   * Renders Header that's shown on main pane
   * Corresponds to "conversation" type
   * Shows us only when activeConversation is null
   *
   *
   */

  return (
    <div className="text-md lg:px-3 flex items-center h-[48px] border-neutral-200 dark:border-neutral-800 border-b-2 pl-1 pr-3">
      <div className="flex group justify-between gap-x-2 w-full">
        <div className="flex items-center gap-x-2">
          <div className="pl-14 lg:pl-1 flex items-center gap-x-2">
            <Users className="h-5 w-5 text-zinc-400" />
            <p>Friends</p>
          </div>
          <Separator className="hidden lg:block mt-[1px] h-5 w-[1px] bg-zinc-300 dark:bg-zinc-700 rounded-md m-1" />
          <ActionTooltip label="coming soon!">
            <div>
              <Button
                variant="custom"
                disabled={true}
                className="hidden lg:block hover:bg-zinc-700/10 dark:hover:bg-zinc-600/50 dark:hover:text-zinc-200 transition px-2 rounded-sm text-zinc-400"
              >
                Online
              </Button>
            </div>
          </ActionTooltip>
        </div>
        <ActionTooltip label="coming soon!">
          <div className="flex gap-x-2 items-center justify-center">
            <Button
              variant="custom"
              disabled={true}
              className="hidden lg:block hover:bg-zinc-700/10 dark:hover:bg-zinc-600/50 dark:hover:text-zinc-200 transition px-2 rounded-sm text-zinc-400"
            >
              Blocked
            </Button>
            <Button
              disabled={true}
              className="h-[30px] bg-emerald-600 text-sm font-medium rounded-sm px-3"
            >
              Add Friend
            </Button>
          </div>
        </ActionTooltip>
      </div>
    </div>
  );
};

export default ConversationHeader;
