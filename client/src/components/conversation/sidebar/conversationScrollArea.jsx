import { ActionTooltip } from "@/components/actionTooltip";
import { ScrollArea } from "@/components/ui/scrollArea";
import { Plus } from "lucide-react";
import React, { memo, useState } from "react";
import ConversationItem from "./conversationItem";
import useConversations from "@/hooks/useConversations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdownMenu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { handleError, handleResponse } from "@/lib/response-handler";
import useAuth from "@/hooks/useAuth";
import { get } from "@/services/api-service";
import { UserAvatar } from "@/components/userAvatar";
import { getConversationDetails } from "@/lib/context-helper";

/*
 * ConversationScrollArea
 *
 * Renders a list of conversations the current user is part of
 * Individual conversation can be clicked on, changing the activeConversation
 * Also lets you search users and create new direct conversations
 *
 */

// TODO: Modularize, move Search-user logic into its own component

const ConversationScrollArea = memo(
  ({ conversations, activeConversation, profileId }) => {
    // state hooks
    const authDispatch = useAuth("dispatch");
    const conversationsDispatch = useConversations("dispatch");
    const access_token = useAuth("token");

    // For search user dialog
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState({ status: false, message: "" });
    const [userData, setUserData] = useState({
      name: "",
      username: "",
      image: "",
      id: "",
    });

    // For form like behavior
    const onKeyDown = (e) => {
      if (searchQuery && e.key === "Enter") {
        onSearch();
      }
    };

    // For searching user to create DM
    const onSearch = async () => {
      if (searchQuery?.length < 3) {
        setError({
          status: true,
          message: "Usernames are at least 3 characters long.",
        });
        return;
      }

      try {
        const response = await get(
          `/profiles/find?searchQuery=${searchQuery}`,
          access_token
        );
        const data = await handleResponse(response, authDispatch);

        if (data?.message) {
          setError({
            status: true,
            message: "User not found!",
          });
        } else {
          setUserData({
            name: data.userData.name,
            username: data.userData.username,
            image: data.userData.image,
            id: data.userData.id,
          });
        }
      } catch (error) {
        handleError(error, authDispatch);
      }
    };

    // Reset the dropDown state onClose
    const handleDropdownClose = () => {
      setUserData({
        name: "",
        username: "",
        image: "",
        id: "",
      });

      setError({
        status: false,
        message: "",
      });

      setSearchQuery("");
    };

    // Creates a conversation and sets the same as activeConversation
    const handleCreateDM = async () => {
      try {
        await getConversationDetails(
          userData.id,
          profileId,
          authDispatch,
          conversationsDispatch
        );

        const event = new KeyboardEvent("keydown", { key: "Escape" });
        document.dispatchEvent(event);
      } catch (error) {
        handleError(error, authDispatch);
      }
    };

    return (
      <>
        <div className="px-2">
          <div className="flex items-center justify-between pt-2 py-1.5 pr-1">
            <p className="text-xs uppercase font-semibold text-zinc-500 dark:text-zinc-400">
              Direct Messages
            </p>
            <DropdownMenu onOpenChange={handleDropdownClose}>
              <DropdownMenuTrigger>
                <button className="text-zinc-500 flex hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition">
                  <ActionTooltip label="Create DM" side="top">
                    {!activeConversation && !conversations.length ? (
                      <>
                        <div className="absolute h-4 w-4 bg-emerald-500 rounded-full animate-ping"></div>
                        <Plus className="h-4 w-4 mr-0.5" />
                      </>
                    ) : (
                      <Plus className="h-4 w-4 mr-0.5" />
                    )}
                  </ActionTooltip>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                sideOffset={8}
                alignOffset={-30}
                align="start"
                className="rounded-md drop-shadow-xl w-[350px] sm:w-[440px] py-5 px-4 text-xs bg-main07 font-medium text-black dark:text-neutral-400"
              >
                <div className="text-xl font-medium text-white">
                  Search User
                </div>
                <p className="font-normal mt-[4px]">
                  Tip: Usernames are case sensitive.
                </p>
                <Input
                  className="text-sm font-normal h-[40px] text-zinc-500 dark:text-zinc-400 mt-4 bg-main10 transition truncate"
                  placeholder="Enter a username..."
                  onChange={(e) => {
                    // Set search query and reset the error state onChange
                    setSearchQuery(e.target.value);
                    error.status && setError({ status: false, message: "" });
                    userData?.name && handleDropdownClose();
                  }}
                  onKeyDown={onKeyDown}
                />
                {error?.status && (
                  <p className="text-rose-600 text-sm font-normal mt-2">
                    {error?.message}
                  </p>
                )}
                <div className="mt-3 min-h-[65px]">
                  {userData?.name && (
                    <div className="mt-2 flex items-center rounded-md ">
                      <div className="relative group flex items-center p-3 w-full">
                        <div className="group flex gap-x-2 items-start w-full">
                          <div className="cursor-pointer transition">
                            <UserAvatar subject={userData} />
                          </div>
                          <div className="flex flex-col w-full">
                            <div className="flex items-center gap-x-2">
                              <div className="ml-1 flex flex-col ">
                                <p className="text-white font-semibold text-sm">
                                  {userData.name}
                                </p>
                                <p>{userData.username}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="pr-3">
                        <ActionTooltip label="Coming soon!">
                          <Button
                            variant="primary"
                            disabled="true"
                            className="px-4"
                          >
                            Add
                          </Button>
                        </ActionTooltip>
                      </div>
                    </div>
                  )}
                </div>

                <DropdownMenuSeparator className="h-[1px] mt-4 bg-zinc-700" />
                {userData?.name ? (
                  <Button
                    variant="primary"
                    className="animate-pulse mt-2 w-full mb-1"
                    onClick={handleCreateDM}
                  >
                    Create DM
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={onSearch}
                    className="mt-2 w-full"
                  >
                    Search
                  </Button>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <ScrollArea className="px-2 grow">
          {conversations?.length ? (
            <div className="mb-1">
              {conversations
                .filter(
                  (conversation) =>
                    conversation.initiatedBy || conversation.initiatedFor
                )
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
          ) : null}
        </ScrollArea>
      </>
    );
  }
);

export default ConversationScrollArea;
