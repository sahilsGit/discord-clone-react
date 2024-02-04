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
  Loader2,
  MoreVertical,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
// import useDebounce from "@/hooks/useDebounce";

const roleIconMap = {
  GUEST: null,
  MODERATOR: <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />,
  ADMIN: <ShieldAlert className="h-4 w-4 ml-2 text-rose-500" />,
};

const MemberScrollArea = ({ searchTerm, results, setResults }) => {
  const access_token = useAuth("token");
  const authDispatch = useAuth("dispatch");
  const serverDispatch = useServer("dispatch");
  const user = useAuth("user");
  const [isLoading, setIsLoading] = useState(false);
  const [fetchLog, setFetchLog] = useState("");
  const lastItemRef = useRef();
  const observerRef = useRef();
  const timeoutId = useRef(null);
  const activeServer = useServer("activeServer");
  const myRole = activeServer.myMembership.role;
  // const debouncedSearch = useDebounce(searchTerm);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      async (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !isLoading) {
          if (searchTerm) {
            try {
              const response = await get(
                `/members/${activeServer.id}/search?term=${searchTerm}&skip=${results.length}`,
                access_token
              );
              const data = await handleResponse(
                response,
                authDispatch,
                serverDispatch
              );

              if (data.members.length < 1) {
                setFetchLog("No results found.");
                setIsLoading(false);
                return;
              }
              setResults([...results, ...data.members]);
              setIsLoading(false);
            } catch (error) {
              handleError(error, authDispatch);
            }
          } else {
            try {
              const response = await get(
                `/servers/${user}/${activeServer.id}/members?skip=${activeServer.members.length}`,
                access_token
              );

              const data = await handleResponse(response, authDispatch);

              serverDispatch({ type: "ADD_MEMBERS", payload: data.members });
            } catch (error) {
              handleError(error, authDispatch);
            }
          }
        }
      },
      { threshold: 0.5 }
    );

    if (lastItemRef?.current) {
      observerRef?.current?.observe(lastItemRef.current);
    }

    return () => observerRef.current.disconnect();
  }, [activeServer?.members?.length, results?.length]);

  const debouncedSearch = useCallback(
    (fetched) => {
      clearTimeout(timeoutId.current);

      timeoutId.current = setTimeout(async () => {
        if (searchTerm.length < 3) {
          setFetchLog("The search term must include at least 3 characters.");
          setIsLoading(false);
          return;
        }
        try {
          const response = await get(
            `/members/${activeServer.id}/search?term=${searchTerm}&skip=${fetched}`,
            access_token
          );
          const data = await handleResponse(
            response,
            authDispatch,
            serverDispatch
          );

          if (data.members.length < 1) {
            setFetchLog("No results found.");
            setIsLoading(false);
            return;
          }

          setResults([...results, ...data.members]);
          setIsLoading(false);
        } catch (error) {
          handleError(error, authDispatch);
        }
      }, 2000);
    },
    [searchTerm]
  );

  useEffect(() => {
    searchTerm && setIsLoading(true);

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
        `/members/${activeServer.id}/${memberId}?myRole=${myRole}`,
        { role: role },
        access_token
      );
      const data = await handleResponse(response, authDispatch);
      serverDispatch({ type: "UPDATE_MEMBER", payload: data.member });

      // If the member whose role is being changed was search instead of fetched
      const memberIndex = results.findIndex(
        (member) => member._id === data.member._id
      );

      if (memberIndex !== -1) {
        setResults([
          ...results.slice(0, memberIndex),
          data.member,
          ...results.slice(memberIndex + 1),
        ]);
      }
    } catch (error) {
      handleError(error, authDispatch);
    }
  };

  const kickMember = async (memberId) => {
    try {
      const response = await remove(
        `/members/${activeServer.id}/${memberId}/remove?myRole=${myRole}`,
        access_token
      );
      await handleResponse(response, authDispatch);
      serverDispatch({ type: "REMOVE_MEMBER", payload: memberId });
    } catch (error) {
      handleError(error, authDispatch);
    }
  };

  const clickKick = (memberId) => {
    kickMember(memberId);
  };

  const renderMemberItem = (member, index) => (
    <div
      className="group"
      key={member._id}
      ref={(element) => {
        if (searchTerm && index === results.length - 1) {
          lastItemRef.current = element;
        } else if (!searchTerm && index === activeServer.members.length - 1) {
          lastItemRef.current = element;
        }
      }}
    >
      <div className="transition-all pl-3 rounded-sm group-hover:bg-zinc-300/50 flex items-center gap-x-3 pt-2 pb-2">
        <UserAvatar subject={member} />
        <div className="flex flex-col gap-y-0.5">
          <div className="text-xs font-semibold flex">
            {member.profile.name}
            {roleIconMap[member.role]}
          </div>
          <p className="text-xxs text-zinc-500">{member.profile.email}</p>
        </div>
        {activeServer.profileId !== member.profile._id && (
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
                          clickRoleChange(member._id, "GUEST");
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
                          clickRoleChange(member._id, "MODERATOR");
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
                    clickKick(member._id);
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
      <ScrollArea className="flex items-center justify-center h-[120px]">
        {!searchTerm ? (
          activeServer?.members.map((member, index) =>
            renderMemberItem(member, index)
          )
        ) : isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : results.length > 0 ? (
          <ScrollArea className="h-[120px]">
            {results?.map((member, index) => renderMemberItem(member, index))}
          </ScrollArea>
        ) : (
          <p className="text-center text-zinc-700 text-sm">{fetchLog}</p>
        )}
      </ScrollArea>
    </div>
  );
};

export default MemberScrollArea;
