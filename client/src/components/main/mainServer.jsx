import MainInput from "./mainInput";
import ServerHeader from "../server/header/serverHeader";
import useServer from "@/hooks/useServer";
import MessageServer from "../message/messageServer";
import { useEffect, useState } from "react";
import VideoCallWrapper from "../videoCall/videoCallWrapper";

const MainServer = ({ type, channelType }) => {
  const memberId = useServer("serverDetails").myMembership._id;
  const channelId = useServer("channelDetails")._id;
  const [key, setKey] = useState(0);

  // To un-mount & re-mount component
  useEffect(() => {
    channelId && setKey(key + 1);
  }, [channelId]);

  console.log("MAIN_SERVER");

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col justify-between h-full">
      <ServerHeader type={type} />
      {channelType === "TEXT" && (
        <>
          <MessageServer key={key} />
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
      {channelType === "VIDEO" && <VideoCallWrapper key={key} />}
      {channelType === "VOICE" && <VideoCallWrapper key={key} />}
    </div>
  );
};

export default MainServer;
