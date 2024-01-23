import useServer from "@/hooks/useServer";
import React, { memo } from "react";
import { ScrollArea } from "@/components/ui/scrollArea";
import { Separator } from "@/components/ui/separator";
import ServerSection from "./serverSection";
import ServerMemberItem from "./serverMemberItem";
import ServerChannelItem from "./serverChannelItem";

const ServerScrollArea = memo(({ data, role, activeServer }) => {
  return (
    <ScrollArea className="px-2 grow">
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
            <ServerChannelItem
              key={channel.id}
              channel={channel}
              role={role}
              type="TEXT"
              activeServer={activeServer}
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
            <ServerChannelItem
              key={channel.id}
              channel={channel}
              role={role}
              type="AUDIO"
              activeServer={activeServer}
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
            <ServerChannelItem
              key={channel.id}
              channel={channel}
              role={role}
              type="VIDEO"
              activeServer={activeServer}
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
            activeServer={activeServer}
          />
          {data[3].contentArray.map((member) => (
            <ServerMemberItem
              key={member.id}
              member={member}
              activeServer={activeServer}
            />
          ))}
        </div>
      )}
    </ScrollArea>
  );
});

export default ServerScrollArea;
