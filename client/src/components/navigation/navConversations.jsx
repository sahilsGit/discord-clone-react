import { ActionTooltip } from "@/components/actionTooltip";
import { useEffect, useState } from "react";
import { useTheme } from "../providers/theme-provider";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import useServer from "@/hooks/useServer";
import useMisc from "@/hooks/useMisc";
import useAuth from "@/hooks/useAuth";
export const NavConversations = () => {
  const { theme } = useTheme();
  const [style, setStyle] = useState("");
  const navigate = useNavigate();
  const isMe = window.location.pathname.includes("/@me");
  const serverDetails = useServer("serverDetails");
  const activeConversation = useMisc("activeConversation");
  const profileId = useAuth("id");

  useEffect(() => {
    if (theme === "light") {
      setStyle(
        "absolute top-[4.5px] left-[5.5px] h-[37px] w-[37px] group-hover:invert-0 transition-all"
      );
    } else {
      setStyle("absolute top-[4.5px] left-[5.5px] h-[37px] w-[37px]");
    }
  }, [theme]);

  return (
    <>
      <button
        onClick={() => {
          if (activeConversation?.id) {
            navigate(
              `/@me/conversations/${activeConversation.profileId}/${profileId}`
            );
          } else {
            navigate("/@me/conversations");
          }
        }}
        className="group w-full relative flex justify-center items-center"
      >
        {/* <div className="absolute h-[8px] w-[4px] opacity-0 left-0 bg-primary rounded-r-full transition-all group-hover:opacity-100 group-hover:h-[20px]"></div> */}
        <div
          className={cn(
            "absolute left-0 bg-primary rounded-r-full transition-all w-[4px]",
            serverDetails && "group-hover:h-[20px]",
            !serverDetails && "h-[36px]",
            serverDetails && "h-[8px]"
          )}
        ></div>
        <ActionTooltip side="right" align="center" label="Direct Messages">
          <div
            className={cn(
              "relative h-[48px] w-[48px] rounded-[24px] overflow-hidden group-hover:rounded-[16px] transition-all bg-main07 group-hover:bg-indigo-500",
              !serverDetails && "rounded-[16px] bg-indigo-500 translate-y-[1px]"
            )}
          >
            <img
              className={style}
              src="../../../../../assets/images/logos/discord_logo.png"
              alt=""
            />
          </div>
        </ActionTooltip>
      </button>
    </>
  );
};
