import { ActionTooltip } from "@/components/action-tooltip";
import { useEffect, useState } from "react";
import { useTheme } from "../providers/theme-provider";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
export const DirectMessages = () => {
  const { theme } = useTheme();
  const [style, setStyle] = useState("");
  const navigate = useNavigate();
  const isMe = window.location.pathname.includes("/@me");

  useEffect(() => {
    if (theme === "light") {
      setStyle(
        "absolute top-[4.5px] invert left-[5.5px] h-[37px] w-[37px] group-hover:invert-0 transition-all"
      );
    } else {
      setStyle("absolute top-[4.5px] left-[5.5px] h-[37px] w-[37px]");
    }
  }, [theme]);

  return (
    <>
      <button
        onClick={() => {
          navigate("/@me");
        }}
        className="group w-full relative flex justify-center items-center"
      >
        {/* <div className="absolute h-[8px] w-[4px] opacity-0 left-0 bg-primary rounded-r-full transition-all group-hover:opacity-100 group-hover:h-[20px]"></div> */}
        <div
          className={cn(
            "absolute left-0 bg-primary rounded-r-full transition-all w-[4px]",
            !isMe && "group-hover:h-[20px]",
            isMe && "h-[36px]",
            !isMe && "h-[8px]"
          )}
        ></div>
        <ActionTooltip side="right" align="center" label="Direct Messages">
          <div
            className={cn(
              "relative h-[48px] w-[48px] rounded-[24px] overflow-hidden group-hover:rounded-[16px] transition-all bg-main07 group-hover:bg-indigo-500",
              isMe && "rounded-[16px] bg-indigo-500"
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
