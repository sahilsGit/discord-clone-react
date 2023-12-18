import { Menu } from "lucide-react";
import React from "react";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import NavigationSidebar from "@/components/navigation/navigationSidebar";
import ChannelSidebar from "./channel/sidebar/channelSidebar";

const MobileToggle = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 flex gap-0">
        <div className="w-[72px]">
          <NavigationSidebar />
        </div>
        <ChannelSidebar />
      </SheetContent>
    </Sheet>
  );
};

export default MobileToggle;
