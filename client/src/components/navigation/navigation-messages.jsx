import { ActionTooltip } from "@/components/action-tooltip";
export const DirectMessages = () => {
  return (
    <>
      <ActionTooltip side="right" align="center" label="Direct Messages">
        {/* <button> */}
        <div className="h-[48px] w-[48px] rounded-[16px] bg-background dark:bg-nutral-700 overflow-hidden">
          <img
            className="h-[48px] w-[48px]"
            src="../../../../../assets/images/logos/discord_white_on_blue.png"
            alt=""
          />
        </div>
        {/* </button> */}
      </ActionTooltip>
    </>
  );
};
