import React, { useEffect, useState } from "react";
import ConversationHeader from "@/components/conversation/header/conversationHeader";
import ServerHeader from "../server/header/serverHeader";
import MainInput from "./mainInput";
import useMisc from "@/hooks/useMisc";
import MessageDirect from "../message/messageDirect";
import useAuth from "@/hooks/useAuth";

const MainConversation = ({ type }) => {
  const activeConversation = useMisc("activeConversation");
  const profileId = useAuth("id");
  const [key, setKey] = useState(0);

  useEffect(() => {
    activeConversation && setKey(key + 1);
  }, [activeConversation?.id]);

  console.log(type);

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col justify-between h-full">
      {activeConversation ? (
        <ServerHeader type="messages" />
      ) : (
        <ConversationHeader />
      )}

      {type === "conversation" &&
        (!activeConversation ? null : (
          <>
            <MessageDirect key={key} />
            <MainInput
              type="conversation"
              apiUrl="/messages/direct"
              query={{
                myProfileId: profileId,
                memberProfileId: activeConversation.profileId,
              }}
            />
          </>
        ))}
    </div>
  );
};

export default MainConversation;
