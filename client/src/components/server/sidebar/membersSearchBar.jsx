import React, { useState, useEffect, useCallback, useRef } from "react";
import { handleResponse, handleError } from "@/services/responseHandler";
import useAuth from "@/hooks/useAuth";
import useServer from "@/hooks/useServer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserAvatar } from "@/components/userAvatar";
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
import { Input } from "@/components/ui/input";

const roleIconMap = {
  GUEST: null,
  MODERATOR: <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />,
  ADMIN: <ShieldAlert className="h-4 w-4 ml-2 text-rose-500" />,
};

const SearchBar = ({ updateResults, startSearch }) => {
  const authDispatch = useAuth("dispatch");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  const timeoutId = useRef(null);
  const server = useServer("serverDetails");
  const access_token = useAuth("token");
  const [alreadyFetched, setAlreadyFetched] = useState(0);
  const activeServer = useServer("activeServer");
  const serverDispatch = useServer("dispatch");
  // const [dispatchResult, setDispatchResults] = useState(false);

  const debouncedSearch = useCallback(() => {
    setIsLoading(true);
    clearTimeout(timeoutId.current);

    timeoutId.current = setTimeout(async () => {
      try {
        console.log("trying with", searchTerm);
        const response = await get(
          `/members/${server.id}/search?term=${searchTerm}&skip=${alreadyFetched}`,
          access_token
        );
        const data = await handleResponse(response, authDispatch);
        console.log("got dataaaa", data);

        setIsLoading(false);
        setAlreadyFetched(data.members.length);
        setResults([...results, ...data.members]);

        // Update the results in the parent component
        updateResults([...results, ...data.members]);
      } catch (err) {
        handleError(err);
      }
    }, 2000);
  }, [searchTerm]);

  useEffect(() => {
    if (!searchTerm) {
      startSearch(false);
    } else {
      startSearch(true);
    }

    if (searchTerm.length > 2) {
      debouncedSearch();
    }
  }, [searchTerm]);

  const handleInputChange = (e) => {
    updateResults([]);
    setAlreadyFetched(0);
    setResults([]);
    setSearchTerm(e.target.value);
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

      setResults([
        ...results.slice(0, memberIndex),
        data.member,
        ...results.slice(memberIndex + 1),
      ]);
      // setDispatchResults(true);
    } catch (err) {
      handleError(err);
    }
  };

  console.log(typeof results);

  // if (dispatchResult) {
  //   setDispatchResults(false);
  //   return <p>Loading......</p>;
  // }

  return (
    <div className="flex flex-col gap-y-3">
      <Input
        className="rounded-sm h-8 bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
        placeholder="Search member"
        onChange={handleInputChange}
        value={searchTerm}
      ></Input>
      {!isLoading && searchTerm && !results && <p>No results found</p>}
      {results.length > 0 && (
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
      )}
    </div>
  );
};

export default SearchBar;
