import React, { useEffect, useState } from "react";
import { UserAvatar } from "./userAvatar";
import useAuth from "@/hooks/useAuth";
import {
  ChevronRight,
  Dot,
  LogOut,
  Pencil,
  Settings,
  Smile,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdownMenu";
import { Separator } from "./ui/separator";
import useServer from "@/hooks/useServer";
import useMisc from "@/hooks/useMisc";
import { useModal } from "@/hooks/useModals";
import { get } from "@/services/api-service";
import { handleError, handleResponse } from "@/lib/response-handler";

const ProfileControl = () => {
  const profileName = useAuth("name");
  const username = useAuth("user");
  const profileImage = useAuth("image");
  const authDispatch = useAuth("dispatch");
  const serverDispatch = useServer("dispatch");
  const miscDispatch = useMisc("dispatch");
  const { onOpen } = useModal();
  const [about, setAbout] = useState("");
  const [email, setEmail] = useState("");
  const access_token = useAuth("token");

  const handleLogout = () => {
    localStorage.clear();
    authDispatch({ type: "RESET_STATE" });
    serverDispatch({ type: "RESET_STATE" });
    miscDispatch({ type: "RESET_STATE" });
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await get(`/profiles/about`, access_token);
        const data = await handleResponse(response, authDispatch);

        setAbout(data.about);
        setEmail(data.email);
      } catch (err) {
        handleError(err, authDispatch);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="group flex justify-between h-[53px] bg-main09 py-1 px-2">
      <div className="flex items-center justify-start h-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 dark:hover:text-zinc-200 transition rounded-sm text-zinc-400 pl-[3px] pr-1 w-full overflow-hidden">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <button className="flex gap-x-[8px]">
              <UserAvatar
                subject={{ name: profileName, image: profileImage }}
                className="h-7 w-7 md:h-[30px] md:w-[30px]"
              />
              {/* <img src={profileImage} alt="" className="h-[30px] w-[30]"></img> */}
              <div className="flex flex-col justify-center items-start text-xxs">
                <p className="text-white truncate">{profileName}</p>
                <p>{username}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            sideOffset={4}
            alignOffset={-30}
            align="start"
            className="shadow-2xl w-[340px] p-0 text-xs bg-main09 font-medium text-black dark:text-neutral-400"
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
                className="flex items-center justify-center absolute top-3 right-4 rounded-full h-[28px] text-white bg-main10 opacity-50 hover:opacity-75 w-[28px] transition"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <UserAvatar
                subject={{ name: profileName, image: profileImage }}
                className="border-8 border-main09 h-[90px] w-[90px] md:h-[90px] md:w-[90px] absolute top-4 left-4"
              />
              {/* <div className="h-[30px] w-[30] overflow-hidden">
                <img src={profileImage.url} alt=""></img>
              </div> */}
            </div>
            <div className="pt-1 px-4 flex flex-col pb-7">
              <div className="px-3 pt-4 pb-3 flex flex-col gap-y-2 rounded-md bg-[#121212]">
                <div className="group rounded-sm flex flex-col gap-x-2 w-full">
                  <p className="px-1 text-md2 text-white">{profileName}</p>
                  <p className="pt-1 px-1 text-white text-xs">{username}</p>
                </div>
                {about.length ? (
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
                <Separator className="h-[1px]" />
                <div className="flex flex-col w-full">
                  <div className="group h-[25px] px-2 rounded-sm flex justify-between items-center gap-x-1 w-full dark:hover:bg-zinc-700 hover:bg-zinc-700/20 transition">
                    <div className="flex gap-x-3 items-center">
                      <div className="h-3 w-3 bg-indigo-500 rounded-full group-hover:bg-zinc-500 transition"></div>
                      <p className="">Online</p>
                    </div>

                    <ChevronRight className="h-4 w-4" />
                  </div>
                  <div className="h-[25px] px-[5px] rounded-sm flex justify-start items-center gap-x-[10px] w-full dark:hover:bg-zinc-700 hover:bg-zinc-700/20 transition">
                    <Smile className="h-[18px] w-[18px]" />
                    <p className="">Set custom status</p>
                  </div>
                </div>
                <Separator className="h-[1px]" />
                <div className="group px-2 rounded-sm flex items-center w-full dark:hover:bg-rose-700 hover:bg-rose-700/20 transition">
                  <button
                    className="flex items-center gap-x-[5px] text-rose-500 dark:hover:text-rose-200 h-[28px] text-left w-full transition"
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
      </div>
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
