import { Plus } from "lucide-react";
import { ActionTooltip } from "../action-tooltip";
import ServerCreationDialog from "../models/serverCreation";

export const NavigationAction = () => {
  return (
    <div>
      <button className="group">
        <ActionTooltip side="right" align="center" label="Add a server">
          <div className="flex items-center justify-center h-[48px] w-[48px] rounded-[24px] overflow-hidden group-hover:rounded-[16px] transition-all bg-background dark:bg-neutral-700 group-hover:bg-emerald-500">
            <Plus
              className="group-hover:text-white transition text-emerald-500"
              size={25}
              strokeWidth={1.5}
            />
          </div>
        </ActionTooltip>
      </button>
    </div>
  );
};
