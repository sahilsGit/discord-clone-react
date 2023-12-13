import useServer from "@/hooks/useServer";
import React from "react";
import { Scroll } from "lucide-react";
import { ScrollArea } from "@/components/ui/scrollArea";
import { Separator } from "@/components/ui/separator";
import ServerSection from "@/components/server/sidebar/serverSection";
import ServerChannel from "@/components/server/sidebar/serverChannel";
import ServerMember from "@/components/server/sidebar/serverMember";

const SidebarScrollArea = ({ data, role }) => {
  // console.log("content", data);
  const server = useServer("serverDetails");
  return (
    <>
      <ScrollArea className="px-2 grow">
        <div className="h-full w-full py-1.5 px-1 flex gap-x-1 hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition rounded-sm items-center">
          <Scroll className="flex-shrink-0 w-4 h-4 text-zinc-500" />
          <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
            Server Guide
          </p>
        </div>
        <Separator className="bg-zinc-200 dark:bg-zinc-700 round-md mt-2 mb-0.5" />
        {!!data[0].contentArray?.length && (
          <div className="mb-1">
            <ServerSection
              sectionType="channels"
              channelType="TEXT"
              role={role}
              label="Text Channels"
            />
            {data[0].contentArray.map((channel) => (
              <ServerChannel
                key={channel.id}
                channel={channel}
                role={role}
                type="TEXT"
                server={server}
              />
            ))}
          </div>
        )}
        {!!data[1].contentArray?.length && (
          <div className="mb-1">
            <ServerSection
              sectionType="channels"
              channelType="AUDIO"
              role={role}
              label="Voice Channels"
            />
            {data[1].contentArray.map((channel) => (
              <ServerChannel
                key={channel.id}
                channel={channel}
                role={role}
                type="AUDIO"
                server={server}
              />
            ))}
          </div>
        )}
        {!!data[2].contentArray?.length && (
          <div className="mb-1">
            <ServerSection
              sectionType="channels"
              channelType="VIDEO"
              role={role}
              label="Video Channels"
            />
            {data[2].contentArray.map((channel) => (
              <ServerChannel
                key={channel.id}
                channel={channel}
                role={role}
                type="VIDEO"
                server={server}
              />
            ))}
          </div>
        )}
        {!!data[3].contentArray?.length && (
          <div className="mb-2">
            <ServerSection
              sectionType="members"
              role={role}
              label="Members"
              server={server}
            />
            {data[3].contentArray.map((member) => (
              <ServerMember key={member.id} member={member} server={server} />
            ))}
          </div>
        )}
      </ScrollArea>
    </>
  );
};

export default SidebarScrollArea;
