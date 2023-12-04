// import { Button } from "@/components/ui/button";
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
} from "@/components/ui/dropdownMenu";
import { ScrollArea } from "@/components/ui/scrollArea";
import { UserAvatar } from "@/components/userAvatar";
import useAuth from "@/hooks/useAuth";
import useServer from "@/hooks/useServer";
import { get, remove, update } from "@/services/api-service";
import { handleError, handleResponse } from "@/lib/response-handler";
import {
  Check,
  Gavel,
  MoreVertical,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

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
  const [isLoading, setIsLoading] = useState(false);
  const [fetchLog, setFetchLog] = useState("");
  const lastItemRef = useRef();
  const observer = useRef();
  const timeoutId = useRef(null);

  useEffect(() => {
    observer.current = new IntersectionObserver(
      async (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !isLoading) {
          if (searchTerm) {
            try {
              // console.log("infinite search scroll working");
              const response = await get(
                `/members/${server.id}/search?term=${searchTerm}&skip=${results.length}`,
                access_token
              );
              const data = await handleResponse(
                response,
                authDispatch,
                serverDispatch
              );

              if (data.members.length < 1) {
                setFetchLog("No results found");
                setIsLoading(false);
                return;
              }
              setResults([...results, ...data.members]);
              setIsLoading(false);
            } catch (err) {
              handleError(err, serverDispatch);
            }
          } else {
            // console.log("inside to skip", server.members.length);
            // console.log("infinite member scroll working");
            try {
              const response = await get(
                `/servers/${user}/${activeServer}/members?skip=${server.members.length}`,
                access_token
              );

              const data = await handleResponse(
                response,
                authDispatch,
                serverDispatch
              );
              serverDispatch({ type: "ADD_MEMBERS", payload: data.members });
            } catch (err) {
              handleError(err, serverDispatch);
            }
          }
        }
      },
      { threshold: 1 }
    );

    if (lastItemRef.current) {
      observer.current.observe(lastItemRef.current);
    }

    return () => observer.current.disconnect();
  }, [server.members.length, results.length]);

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
          // console.log("FETCHING MEMBERS FROM THE SEARCH");
          const response = await get(
            `/members/${server.id}/search?term=${searchTerm}&skip=${fetched}`,
            access_token
          );
          const data = await handleResponse(
            response,
            authDispatch,
            serverDispatch
          );

          if (data.members.length < 1) {
            setFetchLog("No results found");
            setIsLoading(false);
            return;
          }
          setResults([...results, ...data.members]);
          setIsLoading(false);
        } catch (err) {
          handleError(err, serverDispatch);
        }
      }, 2000);
    },
    [searchTerm]
  );

  useEffect(() => {
    setIsLoading(true);

    if (searchTerm) {
      debouncedSearch(0);
    }
  }, [searchTerm]);

  const clickRoleChange = (memberId, role) => {
    onRoleChange(memberId, role);
  };

  const onRoleChange = async (memberId, role) => {
    try {
      const response = await update(
        `/members/${activeServer}/${memberId}`,
        { role: role },
        access_token
      );
      const data = await handleResponse(response, authDispatch, serverDispatch);
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
      handleError(err, serverDispatch);
    }
  };

  const onKick = async (memberId) => {
    try {
      const response = await remove(
        `/members/${activeServer}/${memberId}/remove`,
        access_token
      );
      await handleResponse(response, authDispatch, serverDispatch);
      serverDispatch({ type: "REMOVE_MEMBER", payload: memberId });
    } catch (err) {
      handleError(err, serverDispatch);
    }
  };

  const clickKick = (memberId) => {
    onKick(memberId);
  };

  const renderMemberItem = (member, index) => (
    <div
      className="group"
      key={member.id}
      ref={(element) => {
        if (searchTerm && index === results.length - 1) {
          lastItemRef.current = element;
          // console.log("last ref changed", lastItemRef.current);
        } else if (!searchTerm && index === server.members.length - 1) {
          lastItemRef.current = element;
          // console.log("last ref changed", lastItemRef.current);
        }
      }}
    >
      <div className="transition-all pl-3 rounded-sm group-hover:bg-zinc-300/50 flex items-center gap-x-3 pt-2 pb-2">
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
                <DropdownMenuItem
                  className="text-xs"
                  onClick={() => {
                    clickKick(member.id);
                  }}
                >
                  <Gavel className="h-4 w-4 mr-2" />
                  Kick
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-y-3">
      <ScrollArea className="h-[200px]">
        {!searchTerm ? (
          server?.members.map((member, index) =>
            renderMemberItem(member, index)
          )
        ) : isLoading ? (
          <p>Loading...</p>
        ) : results.length > 0 ? (
          <ScrollArea className="h-[200px]">
            {results?.map((member, index) => renderMemberItem(member, index))}
          </ScrollArea>
        ) : (
          <p>{fetchLog}</p>
        )}
      </ScrollArea>
    </div>
  );
};

export default MemberScrollArea;
