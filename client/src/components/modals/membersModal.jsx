import React, { useEffect, useState } from "react";
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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SearchBar from "@/components/server/sidebar/membersSearchBar";

const roleIconMap = {
  GUEST: null,
  MODERATOR: <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />,
  ADMIN: <ShieldAlert className="h-4 w-4 ml-2 text-rose-500" />,
};

const MembersModal = () => {
  const { isOpen, onClose, type } = useModal();
  const isModalOpen = isOpen && type === "members";
  const server = useServer("serverDetails");
  const authDispatch = useAuth("dispatch");
  const serverDispatch = useServer("dispatch");
  const access_token = useAuth("token");
  const activeServer = useServer("activeServer");
  const user = useAuth("user");
  const [results, setResults] = useState([]);
  const [search, setSearch] = useState(false);

  const startSearch = (bool) => {
    setSearch(bool);
  };
  const updateResults = (newResults) => {
    setResults(newResults);
  };

  useEffect(() => {
    if (isModalOpen) {
      setResults([]);
    }
  }, [isModalOpen]);

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

  console.log("results inside members modal", results.length);

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="flex flex-col bg-white text-black w-[435px] max-w-[430px] gap-y-3 pt-7 pb-7 pl-4 pr-4">
        <div className="flex flex-col">
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
        <SearchBar updateResults={updateResults} startSearch={startSearch} />
        {results.length === 0 && (
          <ScrollArea className="h-[200px]">
            {!search &&
              server?.members.map((member) => (
                <div className="group">
                  <div
                    key={member.id}
                    className="transition-all pl-3 rounded-sm group-hover:bg-zinc-300/50 flex items-center gap-x-3 pt-2 pb-2"
                  >
                    <UserAvatar member={member} />
                    <div className="flex flex-col gap-y-0.5">
                      <div className="text-xs font-semibold flex">
                        {member.name}
                        {roleIconMap[member.role]}
                      </div>
                      <p className="text-xxs text-zinc-500">{member.email}</p>
                    </div>
                    {server.profileId !== member.profileId && (
                      <div className="ml-auto mr-2">
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
                  </div>
                </div>
              ))}
          </ScrollArea>
        )}
        {/* <Button size="custom" variant="primary" onClick={fetchMembers}>
          <p className="text-xs">Scroll / Click</p>
        </Button> */}
        <div>
          <DropdownMenuSeparator className="bg-zinc-300/50 m-0 mb-[2px]" />
          <p className="text-xxxs text-zinc-500">
            Tip: Scroll down to load more..
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MembersModal;
