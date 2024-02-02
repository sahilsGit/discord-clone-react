import { Menu } from "lucide-react";
import React from "react";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import NavigationSidebar from "@/components/navigation/navigationSidebar";
import { Separator } from "./ui/separator";

const MobileToggle = ({ type, data }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="flex items-center justify-center lg:hidden">
          <Button variant="ghost" className="px-0" size="icon">
            <Menu />
          </Button>
          <Separator className="mt-[1px] h-5 w-[1px] bg-zinc-300 dark:bg-zinc-700 rounded-md m-1 mr-3" />
        </div>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 flex gap-0 w-[312px]">
        <div className="bg-main10 w-[72px] flex-shrink-0">
          <NavigationSidebar type={type} />
        </div>
        <div className="w-[240px] bg-main08 ">{data}</div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileToggle;
