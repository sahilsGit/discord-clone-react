import useServer from "@/hooks/useServer";
import React from "react";
import { ScrollArea } from "@/components/ui/scrollArea";
import { Separator } from "@/components/ui/separator";
import ChSection from "./chSection";
import ChIndividualChannel from "./chIndividualChannel";
import ChMember from "./chMember";

const ChScrollArea = ({ data, role }) => {
  // console.log("content", data);
  const server = useServer("serverDetails");
  return (
    <ScrollArea className="px-2 grow">
      <Separator className="bg-zinc-200 dark:bg-zinc-700 round-md mt-2 mb-0.5" />
      {!!data[0].contentArray?.length && (
        <div className="mb-1">
          <ChSection
            sectionType="channels"
            channelType="TEXT"
            role={role}
            label="Text Channels"
          />
          {data[0].contentArray.map((channel) => (
            <ChIndividualChannel
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
          <ChSection
            sectionType="channels"
            channelType="AUDIO"
            role={role}
            label="Voice Channels"
          />
          {data[1].contentArray.map((channel) => (
            <ChIndividualChannel
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
          <ChSection
            sectionType="channels"
            channelType="VIDEO"
            role={role}
            label="Video Channels"
          />
          {data[2].contentArray.map((channel) => (
            <ChIndividualChannel
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
          <ChSection
            sectionType="members"
            role={role}
            label="Members"
            server={server}
          />
          {data[3].contentArray.map((member) => (
            <ChMember key={member.id} member={member} server={server} />
          ))}
        </div>
      )}
    </ScrollArea>
  );
};

export default ChScrollArea;
