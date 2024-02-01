import { Menu } from "lucide-react";
import React from "react";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import NavigationSidebar from "@/components/navigation/navigationSidebar";
import ChannelSidebar from "./server/sidebar/serverSidebar";
import ConversationSidebar from "./conversation/sidebar/conversationSidebar";
import { Separator } from "./ui/separator";

const MobileToggle = ({ type }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="flex items-center justify-center lg:hidden">
          <Button variant="ghost" size="icon">
            <Menu />
          </Button>
          <Separator className="mt-[1px] h-5 w-[1px] bg-zinc-300 dark:bg-zinc-700 rounded-md m-1 mr-3" />
        </div>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 flex gap-0">
        <div className="w-[72px]">
          <NavigationSidebar />
        </div>
        {type === "conversation" ? <ConversationSidebar /> : <ChannelSidebar />}
      </SheetContent>
    </Sheet>
  );
};

export default MobileToggle;
