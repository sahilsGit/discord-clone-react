import MainInput from "./mainInput";
import ServerHeader from "../server/header/serverHeader";
import useServer from "@/hooks/useServer";
import MessageServer from "../message/messageServer";
import useChannels from "@/hooks/useChannels";
import CallWrapper from "../voice-video/callWrapper";

const MainServer = ({ type }) => {
  /*
   *
   * Responsible for rendering the main area of the mainPage.
   * Renders whole mainPage minus all sidebars & corresponds to "channel" type.
   * This is where all the real stuff happens, chat messages across channels
   *
   * "MainConversation" is it's shadow component for when type is "conversation"
   *
   */
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
    <div className="bg-white dark:bg-[#313338] flex flex-col overflow-hidden justify-between h-full">
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
        <CallWrapper video={true} channelId={channelId} />
      )}
      {channelType === "AUDIO" && (
        <CallWrapper video={false} channelId={channelId} />
      )}
    </div>
  );
};

export default MainServer;
