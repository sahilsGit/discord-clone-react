import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scrollArea";
import { ModeToggle } from "@/components/modeToggle";
import useServer from "@/hooks/useServer";
import NavigationItem from "./navigationItem";
import NavigationConversation from "./navigationConversation";
import NavigationAction from "./navigationAction";
import { memo, useCallback } from "react";

/*
 * NavigationSidebar
 *
 * This component represents the leftmost nav sidebar  in the application.
 * It displays direct messages, a list of servers, and a mode toggle.
 * Utilizes the useServer hook to fetch server data.
 *
 */

const NavigationSidebar = memo(
  ({ servers, activeConversation, activeServer }) => {
    console.log("rendering nav sidebar");

    const mapServers = useCallback(() => {
      return Object.values(servers).map((server) => (
        <NavigationItem
          activeServer={activeServer}
          key={server.id}
          id={server.id}
          firstChannel={server.channels[0]}
          name={server.name}
          image={server.image}
        />
      ));
    }, [servers, activeServer]);

    return (
      <div className="flex flex-col h-full justify-between pt-[14px] pb-[14px]">
        <div className="flex flex-col items-center h-full text-primary gap-[7px]">
          {/* Display Direct Messages */}
          <NavigationConversation activeConversation={activeConversation} />
          <Separator className="h-[2px] bg-zinc-300 dark:bg-zinc-700 rounded-md w-[32px]" />

          {/* Display Servers if available */}
          {servers != null ? (
            <>
              <ScrollArea className="w-full flex pt-[2px]">
                <div className="flex flex-col items-center justify-center space-y-[7px]">
                  {/* Map through and display each server */}
                  {mapServers()}
                </div>
              </ScrollArea>
              <Separator className="mt-[1px] h-[1px] bg-zinc-300 dark:bg-zinc-700 rounded-md w-[32px]" />
            </>
          ) : null}

          {/* Display NavigationAction component */}
          <NavigationAction />
        </div>

        {/* Display ModeToggle component */}
        <ModeToggle />
      </div>
    );
  }
);
export default NavigationSidebar;
