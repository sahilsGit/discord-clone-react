import { NavigationAction } from "@/components/navigation/navigation-action";
import { DirectMessages } from "@/components/navigation/navigation-messages";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NavigationItem } from "./navigation-item";
import { ModeToggle } from "../mode-toggle";

const NavigationSidebar = ({ servers }) => {
  return (
    <div className="flex flex-col h-full justify-between pt-[14px] pb-[14px]">
      <div className="flex flex-col items-center h-full text-primary gap-1.5">
        <DirectMessages />
        <Separator className="h-[2px] bg-zinc-300 dark:bg-zinc-700 rounded-md w-7" />
        <ScrollArea className="w-full flex pt-[2px]">
          <div className="flex flex-col items-center justify-center space-y-1.5">
            {servers.map((server) => (
              <NavigationItem
                key={server.id}
                id={server.id}
                name={server.name}
                image={server.image}
              />
            ))}
          </div>
        </ScrollArea>
        <Separator className="mt-[1px] h-[1px] bg-zinc-300 dark:bg-zinc-700 rounded-md w-7" />
        <NavigationAction />
      </div>
      <ModeToggle />
    </div>
  );
};

export default NavigationSidebar;
