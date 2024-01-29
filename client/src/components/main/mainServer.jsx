import MainInput from "./mainInput";
import ServerHeader from "../server/header/serverHeader";
import useServer from "@/hooks/useServer";
import MessageServer from "../message/messageServer";
import { useState } from "react";
import VideoCallWrapper from "../videoCall/videoCallWrapper";
import useChannels from "@/hooks/useChannels";

const MainServer = ({ type }) => {
  const [key, setKey] = useState(0);
  const messages = useChannels("messages");
  const activeChannel = useChannels("activeChannel");
  const cursor = useChannels("cursor");
  const hasMore = useChannels("hasMore");
  const memberId = useServer("activeServer").myMembership._id;

  const channelId = activeChannel?._id;
  const channelType = activeChannel?.type;

  if (messages === "null" || !activeChannel) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col justify-between h-full">
      <ServerHeader type={type} activeChannel={activeChannel} />
      {channelType === "TEXT" && (
        <>
          <MessageServer
            activeChannel={activeChannel}
            messages={messages}
            cursor={cursor}
            hasMore={hasMore}
          />
          <MainInput
            type="channel"
            apiUrl="/messages/server"
            query={{
              memberId: memberId,
              channelId: channelId,
            }}
          />
        </>
      )}
      {channelType === "VIDEO" && (
        <VideoCallWrapper key={key} channelId={channelId} />
      )}
      {channelType === "VOICE" && (
        <VideoCallWrapper key={key} channelId={channelId} />
      )}
    </div>
  );
};

export default MainServer;
