import { ActionTooltip } from "@/components/actionTooltip";
import { memo, useEffect, useState } from "react";
import { useTheme } from "../providers/theme-provider";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import useServer from "@/hooks/useServer";
import useAuth from "@/hooks/useAuth";

// const NavigationConversation = memo(({ activeConversation }) => {
const NavigationConversation = memo(({ activeConversation }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const activeServer = useServer("activeServer");
  // const activeConversation = useMisc("activeConversation");
  const profileId = useAuth("id");

  console.log("rendering nav conversation");

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
        <div
          className={cn(
            "absolute left-0 bg-primary rounded-r-full transition-all w-[4px]",
            activeServer && "group-hover:h-[20px]",
            !activeServer && "h-[36px]",
            activeServer && "h-[8px]"
          )}
        ></div>
        <ActionTooltip side="right" align="center" label="Direct Messages">
          <div
            className={cn(
              "relative h-[48px] w-[48px] rounded-[24px] overflow-hidden group-hover:rounded-[16px] transition-all bg-main07 group-hover:bg-indigo-500",
              !activeServer && "rounded-[16px] bg-indigo-500 translate-y-[1px]"
            )}
          >
            <img
              className={cn(
                theme === "light"
                  ? "absolute top-[4.5px] left-[5.5px] h-[37px] w-[37px] group-hover:invert-0 transition-all"
                  : "absolute top-[4.5px] left-[5.5px] h-[37px] w-[37px]"
              )}
              src="../../../../../assets/images/logos/discord_logo.png"
              alt=""
            />
          </div>
        </ActionTooltip>
      </button>
    </>
  );
});

export default NavigationConversation;
