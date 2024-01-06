import React from "react";
import MnInput from "./mnInput";
import ChannelHeader from "../channel/header/channelHeader";
import useServer from "@/hooks/useServer";

const ChannelMain = ({ type }) => {
  const memberId = useServer("serverDetails").myMembership._id;
  const channelId = useServer("channelDetails")._id;

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col justify-between h-full">
      <ChannelHeader type={type} />
      <div></div>
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
