import React from "react";
import { UserAvatar } from "./userAvatar";
import useAuth from "@/hooks/useAuth";
import { ChevronRight, LogOut, Pencil, Settings, Smile } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdownMenu";
import { Separator } from "./ui/separator";
import useServer from "@/hooks/useServer";
import { useModal } from "@/hooks/useModals";
import useChannels from "@/hooks/useChannels";
import { Button } from "./ui/button";
import { ActionTooltip } from "./actionTooltip";
import { useNavigate } from "react-router-dom";

/*
 * ProfileControl
 *
 * Control Panel for profile-related actions - changing username, profile picture, etc
 *
 *
 */

const ProfileControl = () => {
  const profileName = useAuth("name");
  const username = useAuth("user");
  const profileImage = useAuth("image");
  const authDispatch = useAuth("dispatch");
  const serverDispatch = useServer("dispatch");
  const { onOpen } = useModal();
  const email = useAuth("email");
  const about = useAuth("about");
  const channelsDispatch = useChannels("dispatch");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    authDispatch({ type: "RESET_STATE" });
    serverDispatch({ type: "RESET_STATE" });
    channelsDispatch({ type: "RESET_STATE" });
  };

  return (
    <div className="group flex justify-between h-[53px] bg-main09 py-1 px-2">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <div className="flex items-center justify-start h-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition rounded-sm pl-[3px] pr-1 max-w-[190px] overflow-hidden">
            <button className="flex gap-x-[8px]">
              <UserAvatar
                subject={{ name: profileName, image: profileImage }}
                className="h-7 w-7 md:h-[30px] md:w-[30px]"
              />
              <div className="flex flex-col w-[200px] truncate overflow-hidden justify-center items-start text-xxs">
                <p className="text-primary text-left ">{profileName}</p>
                <p className="text-zinc-600 dark:text-zinc-400">{username}</p>
              </div>
            </button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          sideOffset={4}
          alignOffset={-30}
          align="start"
          className="shadow-2xl w-[340px] p-0 text-xs bg-zinc-200 dark:bg-main09 font-medium"
        >
          <div className="h-[105px] group">
            <div className="bg-indigo-500 h-[60px] relative"></div>
            <button
              type="button"
              onClick={() => {
                onOpen("settings", {
                  name: profileName,
                  image: profileImage,
                  username: username,
                  email: email,
                  about: about,
                });
              }}
              className="flex items-center justify-center absolute top-3 right-4 rounded-full h-[28px] text-primary bg-main10 opacity-50 hover:opacity-75 w-[28px] transition"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <UserAvatar
              subject={{ name: profileName, image: profileImage }}
              className="border-8 border-main09 h-[90px] w-[90px] md:h-[90px] md:w-[90px] absolute top-4 left-4"
            />
          </div>
          <div className="pt-1 px-4 flex flex-col pb-7">
            <div className="px-3 pt-4 pb-3 flex flex-col gap-y-2 rounded-md bg-white dark:bg-[#121212] ">
              <div className="group rounded-sm truncate flex flex-col gap-x-2 w-full">
                <p className="px-1 text-md text-primary">{profileName}</p>
                <p className="pt-1 px-1 text-zinc-700 dark:text-zinc-400 text-white text-xs">
                  {username}
                </p>
              </div>
              {about?.length ? (
                <>
                  <Separator className="h-[1px]" />
                  <div className="flex flex-col gap-y-1 w-full word-break">
                    <p className="px-1 text-xs uppercase font-semibold text-white">
                      About me
                    </p>
                    <div className="break-words">
                      <p className="px-1 leading-5 text-white">{about}</p>
                    </div>
                  </div>
                </>
              ) : null}
              <Separator className="h-[1px] bg-zinc-400/70" />

              <ActionTooltip label="Coming soon!" side="right" align="center">
                <div className="flex flex-col w-full gap-y-0.5">
                  <Button
                    disabled={true}
                    className="bg-zinc-200 dark:bg-zinc-800 group h-[25px] px-2 rounded-sm flex justify-between items-center gap-x-1 w-full dark:hover:bg-zinc-700 hover:bg-zinc-700/20 transition"
                  >
                    <div className="flex text-xs gap-x-3 items-center">
                      <div className="h-3 w-3 bg-indigo-500 rounded-full group-hover:bg-zinc-500 transition"></div>
                      <p className="text-zinc-500">Online</p>
                    </div>

                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    disabled={true}
                    className="bg-zinc-200 dark:bg-zinc-800 h-[25px] px-[5px] rounded-sm flex justify-start items-center gap-x-[10px] w-full dark:hover:bg-zinc-700 hover:bg-zinc-700/20 transition"
                  >
                    <Smile className="text-zinc-500 h-[18px] w-[18px]" />
                    <p className="text-zinc-500 text-xs">Set custom status</p>
                  </Button>
                </div>
              </ActionTooltip>

              <Separator className="h-[1px] bg-zinc-400/70" />
              <div className="group px-2 rounded-sm flex items-center w-full dark:hover:bg-rose-700 hover:bg-rose-700/20 transition">
                <button
                  className="flex items-center gap-x-[5px] text-rose-600 dark:hover:text-rose-100 hover:text-rose-800/90 h-[28px] text-left w-full transition"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <p>Logout</p>
                </button>
              </div>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <button
        className="flex items-center justify-end gap-x-[4px]"
        onClick={() => {
          onOpen("settings", {
            name: profileName,
            image: profileImage,
            username: username,
            email: email,
            about: about,
          });
        }}
      >
        <div className="flex items-center justify-center w-[28px] h-[28px] hover:bg-zinc-700/10 dark:hover:bg-zinc-600/50 dark:hover:text-zinc-200 transition rounded-sm text-zinc-400">
          <Settings className="h-[18px] w-[18px]" />
        </div>
      </button>
    </div>
  );
};

export default ProfileControl;
