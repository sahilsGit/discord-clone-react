import React from "react";
import ConversationHeader from "@/components/conversation/header/conversationHeader";
import ServerHeader from "../server/header/serverHeader";
import MainInput from "./mainInput";
import MessageDirect from "../message/messageDirect";
import useAuth from "@/hooks/useAuth";
import useConversations from "@/hooks/useConversations";

const MainConversation = ({ type, activeConversation }) => {
  /*
   *
   * Responsible for rendering the main area of the mainPage.
   * Renders whole mainPage minus all sidebars & corresponds to "conversation" type.
   * This is where all the real stuff happens, chat messages between users
   *
   * "MainServer" is it's shadow component for when type is "channel"
   *
   */

  const profileId = useAuth("id");
  const messages = useConversations("messages");
  const cursor = useConversations("cursor");
  const hasMore = useConversations("hasMore");

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col justify-between h-full">
      {/* Render the chat page if activeConversation is present */}
      {activeConversation ? (
        <>
          <ServerHeader type={type} activeConversation={activeConversation} />
          <MessageDirect
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
          {/* Else render the general conversation */}
          <ConversationHeader />
          <div className="flex items-center justify-center grow px-12">
            <div className="text-center text-lg max-w-[500px]">
              <p className="text-4xl dark:text-zinc-300 text-zinc-600 pb-5">
                Coming soon!
              </p>
              <p className="dark:text-zinc-400 text-zinc-600 ">
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
