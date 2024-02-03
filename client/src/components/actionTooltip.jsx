import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const ActionTooltip = ({ label, children, side, align }) => {
  return (
    <TooltipProvider>
      <Tooltip
        delayDuration={0}
        skipDelayDuration={0}
        disableHoverableContent={true}
      >
        <TooltipTrigger>{children}</TooltipTrigger>
        <TooltipContent side={side} align={align}>
          <p className="font-semibold bg-white dark:bg-zinc-900 text-xs capitalize">
            {label.toLowerCase()}
          </p>
          {/* <TooltipArrow width={10} height={5} /> */}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
