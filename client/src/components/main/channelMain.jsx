import MnInput from "./mnInput";
import ChannelHeader from "../channel/header/channelHeader";
import useServer from "@/hooks/useServer";
import ChannelMessages from "../messages/ChannelMessages";
import { useEffect, useState } from "react";

const ChannelMain = ({ type }) => {
  const memberId = useServer("serverDetails").myMembership._id;
  const channelId = useServer("channelDetails")._id;
  const [key, setKey] = useState(0);

  // To un-mount & re-mount component
  useEffect(() => {
    channelId && setKey(key + 1);
  }, [channelId]);

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col justify-between h-full">
      <ChannelHeader type={type} />
      <ChannelMessages key={key} />
      <MnInput
        type="channel"
        apiUrl="/messages/server"
        query={{
          memberId: memberId,
          channelId: channelId,
        }}
      />
    </div>
  );
};

export default ChannelMain;
