import useServer from "@/hooks/useServer";
import React from "react";
import { Scroll } from "lucide-react";
import { ScrollArea } from "@/components/ui/scrollArea";

const SidebarScrollArea = () => {
  const server = useServer("serverDetails");
  return (
    <>
      <ScrollArea className="px-2">
        <div className="h-full w-full py-1.5 px-1 flex gap-x-1 hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition rounded-sm items-center">
          <Scroll className="flex-shrink-0 w-4 h-4 text-zinc-500" />
          <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
            Server Guide
          </p>
        </div>
      </ScrollArea>
    </>
  );
};

export default SidebarScrollArea;
