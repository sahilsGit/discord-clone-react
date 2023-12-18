import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scrollArea";
import { ModeToggle } from "@/components/modeToggle";
import useServer from "@/hooks/useServer";
import { NavItem } from "./navItem";
import { NavConversations } from "./navConversations";
import { NavAction } from "./navAction";

/*
 * NavigationSidebar
 *
 * This component represents the sidebar for navigation in the application.
 * It displays direct messages, a list of servers, and a mode toggle.
 * Utilizes the useServer hook to fetch server data.
 */

const NavigationSidebar = () => {
  // Consume the Servers context using custom hook
  const servers = useServer("servers");

  return (
    <div className="flex flex-col h-full justify-between pt-[14px] pb-[14px]">
      <div className="flex flex-col items-center h-full text-primary gap-[7px]">
        {/* Display Direct Messages */}
        <NavConversations />
        <Separator className="h-[2px] bg-zinc-300 dark:bg-zinc-700 rounded-md w-[32px]" />

        {/* Display Servers if available */}
        {servers != null ? (
          <>
            <ScrollArea className="w-full flex pt-[2px]">
              <div className="flex flex-col items-center justify-center space-y-[7px]">
                {/* Map through and display each server */}
                {Object.values(servers).map((server) => (
                  <NavItem
                    key={server.id}
                    id={server.id}
                    name={server.name}
                    image={server.image}
                  />
                ))}
              </div>
            </ScrollArea>
            <Separator className="mt-[1px] h-[1px] bg-zinc-300 dark:bg-zinc-700 rounded-md w-[32px]" />
          </>
        ) : null}

        {/* Display NavigationAction component */}
        <NavAction />
      </div>

      {/* Display ModeToggle component */}
      <ModeToggle />
    </div>
  );
};

export default NavigationSidebar;
