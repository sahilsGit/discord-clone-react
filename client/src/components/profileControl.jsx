import { MicOff, Settings, Volume2 } from "lucide-react";
import React from "react";
import { UserAvatar } from "./userAvatar";
import useAuth from "@/hooks/useAuth";

const ProfileControl = () => {
  const profileName = useAuth("name");
  const profileImage = useAuth("image");
  const username = useAuth("user");
  return (
    <div className="group flex justify-between h-[53px] bg-main09 pt-[2px] pb-[2px] pl-[4px] overflow-hidden">
      <div className="flex items-center justify-start h-full hover:bg-zinc-700/10 dark:hover:bg-zinc-600/50 dark:hover:text-zinc-200 transition rounded-sm text-zinc-400 pl-[3px] pr-1 max-w-[120px] overflow-hidden">
        <div className="flex items-center justify-center gap-x-[8px]">
          <UserAvatar
            subject={{ name: profileName, image: profileImage }}
            className="h-7 w-7 md:h-[30px] md:w-[30px]"
          />
          <div className="flex flex-col text-xxs">
            <p className="w-[70px] text-white truncate">{profileName}</p>
            <p className="w-[70px] truncate">{username}</p>
          </div>
        </div>
      </div>
      <div className="w-[110px] flex items-center justify-center gap-x-[4px]">
        <div className="flex items-center justify-center w-[28px] h-[28px] hover:bg-zinc-700/10 dark:hover:bg-zinc-600/50 dark:hover:text-zinc-200 transition rounded-sm text-zinc-400">
          <MicOff className="h-[18px] w-[18px]" />
        </div>
        <div className="flex items-center justify-center w-[28px] h-[28px] hover:bg-zinc-700/10 dark:hover:bg-zinc-600/50 dark:hover:text-zinc-200 transition rounded-sm text-zinc-400">
          <Volume2 className="h-[18px] w-[18px]" />
        </div>
        <div className="flex items-center justify-center w-[28px] h-[28px] hover:bg-zinc-700/10 dark:hover:bg-zinc-600/50 dark:hover:text-zinc-200 transition rounded-sm text-zinc-400">
          <Settings className="h-[18px] w-[18px]" />
        </div>
      </div>
    </div>
  );
};

export default ProfileControl;
