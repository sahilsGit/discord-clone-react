import React, { useEffect, useState } from "react";
import ConversationHeader from "@/components/conversation/header/conversationHeader";
import ServerHeader from "../server/header/serverHeader";
import MainInput from "./mainInput";
import MessageDirect from "../message/messageDirect";
import useAuth from "@/hooks/useAuth";
import useDirectMessages from "@/hooks/useDirectMessages";
import useConversations from "@/hooks/useConversations";
import { useLocation, useParams } from "react-router-dom";
import { handleError, handleResponse } from "@/lib/response-handler";
import { get } from "@/services/api-service";

const MainConversation = ({ type }) => {
  const activeConversation = useConversations("activeConversation");
  const conversationsDispatch = useConversations("dispatch");
  const directMessagesDispatch = useDirectMessages("dispatch");
  const profileId = useAuth("id");
  const params = useParams();
  const authDispatch = useAuth("dispatch");
  const access_token = useAuth("token");
  const location = useLocation();
  const { activeConversationCache } = location.state || {};
  const [key, setKey] = useState(0);
  const cursor = useDirectMessages("cursor");
  const messages = useDirectMessages("messages");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    activeConversation && setKey(key + 1);
  }, [activeConversation?.id]);

  useEffect(() => {
    const fetchConversation = async () => {
      if (params.memberProfileId === params.myProfileId) {
        return;
      }

      try {
        const response = await get(
          `/conversations/${params.memberProfileId}/${params.myProfileId}`,
          access_token
        );

        const conversationsData = await handleResponse(response, authDispatch);

        conversationsDispatch({
          type: "SET_ACTIVE_CONVERSATION",
          payload: {
            _id: conversationsData.conversation._id,
            theirProfileId: conversationsData.memberProfile._id,
            theirName: conversationsData.memberProfile.name,
            theirImage: conversationsData.memberProfile.image
              ? conversationsData.memberProfile.image
              : null, // For rendering fallback the image
          },
        });
        // setLoading(false);
      } catch (err) {
        handleError(err, authDispatch);
      }
    };

    const fetchMessages = async () => {
      try {
        const response = await get(
          `/messages/fetch?memberProfileId=${params.memberProfileId}&myProfileId=${params.myProfileId}`,
          access_token
        );

        const messageData = await handleResponse(response, authDispatch);

        console.log("got messages");

        directMessagesDispatch({
          type: "SET_MESSAGES",
          payload: {
            messages: messageData.messages,
            cursor: messageData.newCursor,
            hasMoreMessages: messageData.hasMoreMessages,
          },
        });
      } catch (err) {
        await handleError(err, authDispatch);
      }
    };

    // if (
    //   (!activeConversation ||
    //     activeConversation.theirProfileId !== params.memberProfileId) &&
    //   type === "conversation"
    // ) {
    //   if (activeConversationCache) {
    //     conversationsDispatch({
    //       type: "SET_ACTIVE_CONVERSATION",
    //       payload: activeConversationCache,
    //     });
    //     fetchMessages();
    //   } else {
    //     fetchConversation();
    //   }
    // }

    if (type === "conversation") {
      if (
        !activeConversation ||
        activeConversation.theirProfileId !== params.memberProfileId ||
        !activeConversationCache
      ) {
        fetchConversation();
        fetchMessages();
      } else {
        activeConversationCache &&
          conversationsDispatch({
            type: "SET_ACTIVE_CONVERSATION",
            payload: activeConversationCache,
          });
        fetchMessages();
      }
    }
  }, [params.memberProfileId]);

  if (!activeConversation) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col justify-between h-full">
      {activeConversation ? (
        <ServerHeader type="conversation" />
      ) : (
        <ConversationHeader />
      )}
      {type === "conversation" && (
        <>
          {messages !== null && <MessageDirect key={key} />}
          <MainInput
            type="conversation"
            apiUrl="/messages/direct"
            query={{
              myProfileId: profileId,
              memberProfileId: activeConversation.profileId,
            }}
          />
        </>
      )}
    </div>
  );
};

export default MainConversation;
