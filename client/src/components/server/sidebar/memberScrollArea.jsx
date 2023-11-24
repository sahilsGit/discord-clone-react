import { Button } from "@/components/ui/button";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserAvatar } from "@/components/userAvatar";
import useAuth from "@/hooks/useAuth";
import useServer from "@/hooks/useServer";
import { get, update } from "@/services/apiService";
import { handleError, handleResponse } from "@/services/responseHandler";
import {
  Check,
  Gavel,
  MoreVertical,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

const roleIconMap = {
  GUEST: null,
  MODERATOR: <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />,
  ADMIN: <ShieldAlert className="h-4 w-4 ml-2 text-rose-500" />,
};

const MemberScrollArea = ({ searchTerm, results, setResults }) => {
  const access_token = useAuth("token");
  const authDispatch = useAuth("dispatch");
  const server = useServer("serverDetails");
  const serverDispatch = useServer("dispatch");
  const user = useAuth("user");
  const activeServer = useServer("activeServer");
  const [alreadyFetched, setAlreadyFetched] = useState(0);
  //   const [results, setResults] = useState([]);
  const timeoutId = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchLog, setFetchLog] = useState("");

  const debouncedSearch = useCallback(
    (fetched) => {
      clearTimeout(timeoutId.current);

      timeoutId.current = setTimeout(async () => {
        if (searchTerm.length < 3) {
          setFetchLog("The search term must include at least 3 characters");
          setIsLoading(false);
          return;
        }
        try {
          const response = await get(
            `/members/${server.id}/search?term=${searchTerm}&skip=${fetched}`,
            access_token
          );
          const data = await handleResponse(response, authDispatch);

          setAlreadyFetched(alreadyFetched + data.members.length);

          if (data.members.length < 1) {
            setFetchLog("No results found");
            setIsLoading(false);
            return;
          }
          setResults([...results, ...data.members]);
          setIsLoading(false);
        } catch (err) {
          handleError(err);
        }
      }, 2000);
    },
    [searchTerm]
  );

  useEffect(() => {
    // setResults([]);
    setIsLoading(true);
    debouncedSearch(0);
  }, [searchTerm]);

  const fetchMembers = async () => {
    try {
      const response = await get(
        `/servers/${user}/${activeServer}/members?skip=${server.members.length}`,
        access_token
      );

      const data = await handleResponse(response, authDispatch);

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

      const memberIndex = results.findIndex(
        (member) => member.id === data.member.id
      );

      if (memberIndex !== -1) {
        setResults([
          ...results.slice(0, memberIndex),
          data.member,
          ...results.slice(memberIndex + 1),
        ]);
      }
    } catch (err) {
      handleError(err);
    }
  };
  return (
    <div className="flex flex-col gap-y-3">
      <ScrollArea className="h-[200px]">
        {!searchTerm ? (
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
          ))
        ) : isLoading ? (
          <p>Loading...</p>
        ) : results.length > 0 ? (
          <ScrollArea className="h-[200px]">
            {results?.map((member) => (
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
        ) : (
          <p>{fetchLog}</p>
        )}
      </ScrollArea>
      <Button size="custom" variant="primary" onClick={fetchMembers}>
        <p className="text-xs">Scroll / Click</p>
      </Button>
    </div>
  );
};

export default MemberScrollArea;
