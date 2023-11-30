// Imports
import { NavigationAction } from "@/components/navigation/navigationAction";
import { DirectMessages } from "@/components/navigation/navigationMessages";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scrollArea";
import { NavigationItem } from "@/components/navigation/navigationItem";
import { ModeToggle } from "@/components/modeToggle";
import useServer from "@/hooks/useServer";

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
      <div className="flex flex-col items-center h-full text-primary gap-1.5">
        {/* Display Direct Messages */}
        <DirectMessages />
        <Separator className="h-[2px] bg-zinc-300 dark:bg-zinc-700 rounded-md w-7" />

        {/* Display Servers if available */}
        {servers != null ? (
          <>
            <ScrollArea className="w-full flex pt-[2px]">
              <div className="flex flex-col items-center justify-center space-y-1.5">
                {/* Map through and display each server */}
                {Object.values(servers).map((server) => (
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
          </>
        ) : null}

        {/* Display NavigationAction component */}
        <NavigationAction />
      </div>

      {/* Display ModeToggle component */}
      <ModeToggle />
    </div>
  );
};

export default NavigationSidebar;
