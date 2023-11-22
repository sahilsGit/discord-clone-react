// imports
import {
  Dialog,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import { useModal } from "@/hooks/useModals";
import { ScrollArea } from "@/components/ui/scroll-area";
import { handleError, handleResponse } from "@/services/responseHandler";
import useAuth from "@/hooks/useAuth";
import useServer from "@/hooks/useServer";
import { UserAvatar } from "../userAvatar";
import {
  Check,
  Gavel,
  MoreVertical,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
} from "lucide-react";
import { get, update } from "@/services/apiService";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSubContent,
  DropdownMenuTrigger,
  DropdownMenuSubTrigger,
  DropdownMenuSub,
} from "@/components/ui/dropdown-menu";

const roleIconMap = {
  GUEST: null,
  MODERATOR: <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />,
  ADMIN: <ShieldAlert className="h-4 w-4 text-rose-500" />,
};
// Main component for serving the server creation dialog box
const MembersModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const isModalOpen = isOpen && type === "members";
  const server = useServer("serverDetails");
  const authDispatch = useAuth("dispatch");
  const serverDispatch = useServer("dispatch");
  const access_token = useAuth("token");
  const activeServer = useServer("activeServer");
  const user = useAuth("user");

  const fetchMembers = async () => {
    try {
      const response = await get(
        `/servers/${user}/${activeServer}/members?skip=${server.members.length}`,
        access_token
      );

      const data = await handleResponse(response, authDispatch);

      console.log("dispatching with data", data);
      serverDispatch({ type: "ADD_MEMBERS", payload: data.members });
    } catch (err) {
      handleError(err);
    }
  };

  const clickRoleChange = async (memberId, role) => {
    await onRoleChange(memberId, role);
    // serverDispatch({ type: "TOGGLE_SWITCH" });
  };

  const onRoleChange = async (memberId, role) => {
    try {
      const response = await update(
        `/members/${activeServer}/${memberId}`,
        { role: role },
        access_token
      );
      const data = await handleResponse(response, authDispatch);
      serverDispatch({ type: "UPDATE_MEMBER", payload: data.member });
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="flex flex-col bg-white text-black w-[435px] max-w-[430px] gap-1 pt-6 pb-6 pl-4 pr-4">
        <div>
          <p className="text-md font-semibold">Manage Members</p>
          {server?.members.length == 1 ? (
            <DialogDescription className="text-xs text-zinc-500">
              {server?.members.length} Member
            </DialogDescription>
          ) : (
            <DialogDescription className="text-xs text-zinc-500">
              {server?.members.length} Members
            </DialogDescription>
          )}
        </div>
        <ScrollArea className="mt-8 max-h-[420px] pr-6">
          {server?.members.map((member) => (
            <div key={member.id} className="flex items-center gap-x-2 mb-6">
              <UserAvatar member={member} />
              <div className="flex flex-col gap-y-1">
                <div className="text-xs font-semibold flex items-center gap-x-1">
                  {member.name}
                  {roleIconMap[member.role]}
                </div>
                <p className="text-xxs text-zinc-500">{member.email}</p>
              </div>
              {server.profileId !== member.profileId && (
                <div className="ml-auto">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <MoreVertical className="h-4 w-4 text-zinc-500" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="left">
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="flex items-center">
                          <ShieldQuestion className="w-4 h-4 mr-2" />
                          <span className="text-xs">Role</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem
                              className="text-xs"
                              onClick={() => {
                                clickRoleChange(member.id, "GUEST");
                              }}
                            >
                              <Shield className="text-xxs h-4 w-4 mr-2" />
                              Guest
                              {member.role === "GUEST" && (
                                <Check className="h-4 w-4 ml-auto" />
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-xs"
                              onClick={() => {
                                clickRoleChange(member.id, "MODERATOR");
                              }}
                            >
                              <ShieldCheck className="h-4 w-4 mr-2" />
                              Moderator
                              {member.role === "MODERATOR" && (
                                <Check className="h-4 w-4 ml-4" />
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-xs">
                        <Gavel className="h-4 w-4 mr-2" />
                        Kick
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
              {}
            </div>
          ))}
          <Button
            className="p-2"
            size="custom"
            variant="primary"
            onClick={fetchMembers}
          >
            <p className="text-xs">Fetch More</p>
          </Button>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default MembersModal;
