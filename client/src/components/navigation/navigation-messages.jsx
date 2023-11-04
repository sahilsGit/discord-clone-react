import { ActionTooltip } from "@/components/action-tooltip";
export const DirectMessages = () => {
  return (
    <>
      <button className="group flex">
        <ActionTooltip side="right" align="center" label="Direct Messages">
          <div className="relative h-[48px] w-[48px] rounded-[24px] overflow-hidden group-hover:rounded-[16px] transition-all bg-background dark:bg-neutral-700 group-hover:bg-indigo-500">
            <img
              className="absolute top-[4.5px] left-[5.5px] h-[37px] w-[37px]"
              src="../../../../../assets/images/logos/discord_logo.png"
              alt=""
            />
          </div>
        </ActionTooltip>
      </button>
    </>
  );
};
