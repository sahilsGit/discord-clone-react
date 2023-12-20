import React from "react";
import ChannelMain from "./channelMain";
import ConversationMain from "./conversationMain";
import useServer from "@/hooks/useServer";
import useMisc from "@/hooks/useMisc";

const MainWrapper = ({ type, data }) => {
  const channelDetails = useServer("channelDetails");
  const activeConversation = useMisc("activeConversation");

  return (
    <div className="h-full">
      {(type === "channel" || type === "server") && channelDetails ? (
        <ChannelMain data={data} type={type} />
      ) : !activeConversation ? (
        <ConversationMain data={data} type={type} />
      ) : (
        <ConversationMain
          data={{ memberProfile: { name: activeConversation.name } }}
          type="conversation"
        />
      )}
    </div>
  );
};

export default MainWrapper;
