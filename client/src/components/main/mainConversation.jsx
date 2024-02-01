import React from "react";
import ConversationHeader from "@/components/conversation/header/conversationHeader";
import ServerHeader from "../server/header/serverHeader";
import MainInput from "./mainInput";
import MessageDirect from "../message/messageDirect";
import useAuth from "@/hooks/useAuth";
import useConversations from "@/hooks/useConversations";

const MainConversation = ({ type, activeConversation }) => {
  const profileId = useAuth("id");
  // const [key, setKey] = useState(0);
  const messages = useConversations("messages");
  const cursor = useConversations("cursor");
  const hasMore = useConversations("hasMore");

  console.log(messages?.length);

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col justify-between h-full">
      {activeConversation ? (
        <>
          <ServerHeader type={type} activeConversation={activeConversation} />
          <MessageDirect
            // key={key}
            activeConversation={activeConversation}
            messages={messages}
            cursor={cursor}
            hasMore={hasMore}
          />
          <MainInput
            type="conversation"
            apiUrl="/messages/direct"
            query={{
              myProfileId: profileId,
              memberProfileId: activeConversation.theirProfileId,
            }}
          />
        </>
      ) : (
        <>
          <ConversationHeader />
          <div className="flex items-center justify-center px-12 h-full">
            <div className="text-center text-lg max-w-[500px]">
              <p className="text-4xl pb-5">Coming soon!</p>
              <p>
                Your friends would appear here, for now you can chat directly by
                creating a DM.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MainConversation;
