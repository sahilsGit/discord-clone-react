import { ActionTooltip } from "@/components/action-tooltip";
import { useEffect, useState } from "react";
import { useTheme } from "../providers/theme-provider";
export const DirectMessages = () => {
  const { theme } = useTheme();

  const [imageSrc, setImageSrc] = useState("");
  const [style, setStyle] = useState("");

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
      <button className="group w-full relative flex justify-center items-center">
        <div className="absolute h-[8px] w-[4px] opacity-0 left-0 bg-primary rounded-r-full transition-all group-hover:opacity-100 group-hover:h-[20px]"></div>
        <ActionTooltip side="right" align="center" label="Direct Messages">
          <div className="relative h-[48px] w-[48px] rounded-[24px] overflow-hidden group-hover:rounded-[16px] transition-all bg-main07 group-hover:bg-indigo-500">
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
