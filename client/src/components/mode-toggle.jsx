import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";
import { ActionTooltip } from "./action-tooltip";

export function ModeToggle() {
  const { theme, setTheme } = useTheme("system");

  const toggleTheme = () => {
    if (theme === "light" || theme === "system") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("system");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="w-full flex items-center justify-center group relative"
    >
      <div className="absolute h-[8px] w-[4px] opacity-0 left-0 bg-primary rounded-r-full transition-all group-hover:opacity-100 group-hover:h-[20px]"></div>
      <ActionTooltip side="right" align="center" label="Switch Mode">
        <div className="flex items-center justify-center h-[48px] w-[48px] rounded-[24px] overflow-hidden group-hover:rounded-[16px] transition-all ">
          {theme === "dark" ? (
            <Sun
              size={22}
              strokeWidth={1.5}
              className="transition-all group-hover:text-white text-emerald-500"
            />
          ) : (
            <Moon
              size={22}
              strokeWidth={1.5}
              className="transition-all group-hover:text-black text-emerald-600"
            />
          )}
        </div>
      </ActionTooltip>
    </button>
  );
}
