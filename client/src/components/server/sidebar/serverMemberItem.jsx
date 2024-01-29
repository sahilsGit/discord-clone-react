import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdownMenu";
import { UserAvatar } from "@/components/userAvatar";
import useAuth from "@/hooks/useAuth";
import useConversations from "@/hooks/useConversations";
import { getConversationDetails } from "@/lib/context-helper";
import { handleError } from "@/lib/response-handler";
import { cn } from "@/lib/utils";
import React from "react";
import { useParams } from "react-router-dom";

const ServerMemberItem = ({ member, server }) => {
  const authDispatch = useAuth("dispatch");
  const conversationsDispatch = useConversations("dispatch");

  const params = useParams();
  const profileId = useAuth("id");

  const handleStartConversation = async () => {
    try {
      await getConversationDetails(
        member?.profileId,
        profileId,
        authDispatch,
        conversationsDispatch
      );
    } catch (error) {
      await handleError(error, authDispatch);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="w-full">
        <button className="w-full group px-2 py-1 justify-between pr-[5px] rounded-sm h-[30px] flex items-center gap-x-2 w-full dark:hover:bg-zinc-700 hover:bg-zinc-700/20 transition transition mb-1">
          <div className="flex items-center gap-x-2">
            <UserAvatar subject={member} className="h-5 w-5 md:h-5 md:w-5" />
            <p
              className={cn(
                "font-medium text-sm text-zinc-500 group-hover:text-zinc-600 text-start dark:text-zinc-400 dark:group-hover:text-zinc-300 transition w-[100px] h-4 truncate",
                params?.memberProfileId === member.profileId &&
                  "text-primary dark:text-zinc-200 dark:group-hover:text-white"
              )}
            >
              {member.name}
            </p>
          </div>
          {member.icon}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" className="bg-main09 w-56 pb-1">
        <DropdownMenuLabel className="text-xs">
          Member Options
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-zinc-700" />
        <DropdownMenuItem
          className="text-xs focus:bg-main07"
          onClick={handleStartConversation}
        >
          Start Conversation
        </DropdownMenuItem>

        <DropdownMenuItem
          className="text-xs focus:bg-main07 w-full"
          disabled="true"
          onClick={() => {}}
        >
          Avoid user
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ServerMemberItem;
