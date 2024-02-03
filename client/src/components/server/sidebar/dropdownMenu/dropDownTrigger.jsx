import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdownMenu";
import { useModal } from "@/hooks/useModals";
import useServer from "@/hooks/useServer";
import {
  ChevronDown,
  LogOut,
  PlusCircle,
  Settings,
  Trash,
  UserPlus,
  Users,
} from "lucide-react";

const DropdownTrigger = ({ role }) => {
  const activeServer = useServer("activeServer");

  const { onOpen } = useModal();
  const isAdmin = role === "ADMIN";
  const isModerator = isAdmin || role === "MODERATOR";

  return (
    <div className="flex items-center h-[48px] border-neutral-200 dark:border-neutral-800 border-b-2 overflow-hidden">
      <DropdownMenu>
        <DropdownMenuTrigger className="focus:outline-none" asChild>
          <button className="w-full text-sm font-semibold flex items-center px-3 h-full border-neutral-200 hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition">
            <p className="text-left truncate w-[170px]">{activeServer.name}</p>
            <ChevronDown className="h-4 w-4 ml-auto" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48 text-xs font-medium text-black dark:text-neutral-400 space-y-[2px]">
          {isModerator && (
            <DropdownMenuItem
              onClick={() => {
                onOpen("invite", { inviteCode: activeServer.inviteCode });
              }}
              className="text-indigo-600 dark:text-indigo-400 px-3 py-2 text-xs cursor-pointer"
            >
              Invite People
              <UserPlus className="h-4 w-4 ml-auto" />
            </DropdownMenuItem>
          )}
          {isAdmin && (
            <DropdownMenuItem
              onClick={() => {
                onOpen("editServer", { activeServer: activeServer });
              }}
              className="px-3 py-2 text-xs cursor-pointer"
            >
              Server Settings
              <Settings className="h-4 w-4 ml-auto" />
            </DropdownMenuItem>
          )}
          {isAdmin && (
            <DropdownMenuItem
              onClick={() => {
                onOpen("members", { activeServer: activeServer });
              }}
              className="px-3 py-2 text-xs cursor-pointer"
            >
              Manage Members
              <Users className="h-4 w-4 ml-auto" />
            </DropdownMenuItem>
          )}
          {isModerator && (
            <DropdownMenuItem
              className="px-3 py-2 text-xs cursor-pointer"
              onClick={() => {
                onOpen("createChannel", { activeServer: activeServer });
              }}
            >
              Create Channel
              <PlusCircle className="h-4 w-4 ml-auto" />
            </DropdownMenuItem>
          )}
          {isModerator && <DropdownMenuSeparator />}
          {isAdmin && (
            <DropdownMenuItem className="text-rose-500 px-3 py-2 text-xs cursor-pointer">
              Delete Server
              <Trash className="h-4 w-4 ml-auto" />
            </DropdownMenuItem>
          )}
          {!isAdmin && (
            <DropdownMenuItem
              onClick={() => {
                onOpen("leaveServer", { activeServer: activeServer });
              }}
              className="px-3 py-2 text-xs cursor-pointer"
            >
              Leave Server
              <LogOut className="h-4 w-4 ml-auto" />
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default DropdownTrigger;
