import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export const ActionTooltip = ({ label, children, side, align, className }) => {
  return (
    <TooltipProvider>
      <Tooltip
        delayDuration={0}
        skipDelayDuration={0}
        disableHoverableContent={true}
      >
        <TooltipTrigger>{children}</TooltipTrigger>
        <TooltipContent side={side} align={align}>
          <p
            className={cn(
              "font-semibold bg-white dark:bg-zinc-900 text-xs",
              className
            )}
          >
            {label}
          </p>
          {/* <TooltipArrow width={10} height={5} /> */}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
