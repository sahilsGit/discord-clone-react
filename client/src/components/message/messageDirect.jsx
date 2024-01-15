import React, { useEffect, useRef, useState } from "react";
import MessageWelcome from "./messageWelcome";
import { get } from "@/services/api-service";
import useAuth from "@/hooks/useAuth";
import { handleError, handleResponse } from "@/lib/response-handler";
import useServer from "@/hooks/useServer";
import useSocket from "@/hooks/useSocket";
import MessageItem from "./messageItem";
import useMisc from "@/hooks/useMisc";

const MessageDirect = () => {
  const authDispatch = useAuth("dispatch");
  const access_token = useAuth("token");
  const [error, setError] = useState(false);
  const observerRef = useRef();
  const lastItemRef = useRef();
  const serverDispatch = useServer("dispatch");
  const { socket } = useSocket();
  const [isConnected, setIsConnected] = useState(false);
  const profileId = useAuth("id");
  const miscDispatch = useMisc("dispatch");

  const CONNECTED_EVENT = "connected";
  const DISCONNECT_EVENT = "disconnect";
  const TYPING_EVENT = "typing";
  const STOP_TYPING_EVENT = "stopTyping";
  const MESSAGE_RECEIVED_EVENT = "messageReceived";
  const MESSAGE_EDITED_EVENT = "messageEdited";
  const activeConversation = useMisc("activeConversation");
  const messages = activeConversation.messages;

  const name = activeConversation?.name;

  const fetchMessages = async () => {
    console.log("...fetching from messageDirect");
    try {
      const response = await get(
        `/messages/fetch?conversationId=${activeConversation.id}&cursor=${messages.cursor}`,
        access_token
      );

      const messageData = await handleResponse(response, authDispatch);

      console.log("mmssdata", messageData);

      miscDispatch({
        type: "SET_CUSTOM",
        payload: {
          activeConversation: {
            ...activeConversation,
            messages: {
              data: [
                ...activeConversation.messages.data,
                ...messageData.messages,
              ],
              cursor:
                messageData.newCursor || activeConversation.messages.cursor,
              hasMoreMessages: messageData.hasMoreMessages,
            },
          },
        },
      });
    } catch (error) {
      handleError(error, authDispatch);
      setError(true);
    }
  };

  /**
   * Handles the event when a new message is received.
   */
  const onMessageReceived = (message) => {
    console.log("hiiiiiitttt");
    if (message.senderId === profileId || message.receiverId === profileId) {
      messages.data.length
        ? miscDispatch({
            type: "SET_CUSTOM",
            payload: {
              activeConversation: {
                ...activeConversation,
                messages: {
                  data: [message, ...activeConversation.messages.data],
                  cursor: activeConversation.messages.cursor,
                  hasMoreMessages: activeConversation.messages.hasMoreMessages,
                },
              },
            },
          })
        : miscDispatch({
            type: "SET_CUSTOM",
            payload: {
              activeConversation: {
                ...activeConversation,
                messages: {
                  data: [message, ...activeConversation.messages.data],
                  cursor: message.createdAt,
                  hasMoreMessages: false,
                },
              },
            },
          });
    }
  };

  const onMessageEdited = (message) => {
    if (message.conversationId === activeConversation.id) {
      const messageIndex = activeConversation.messages.data.findIndex((msg) => {
        return msg._id === message._id;
      });

      // If the message is found in the array, update it
      if (messageIndex !== -1) {
        const updatedMessages = [...activeConversation.messages.data];
        updatedMessages[messageIndex] = message;

        // Update the state with the updated message
        miscDispatch({
          type: "SET_CUSTOM",
          payload: {
            activeConversation: {
              ...activeConversation,
              messages: {
                data: updatedMessages,
                cursor: activeConversation.messages.cursor,
                hasMoreMessages: activeConversation.messages.hasMoreMessages,
              },
            },
          },
        });
      } else {
        // Handle the case where the message to update is not found
        console.error("Message not found for update:");
      }
    }
  };

  /**
   * Handles the "typing" event on the socket.
   */
  const handleOnSocketTyping = () => {
    setIsTyping(true);
  };

  const handleOnSocketStopTyping = () => {
    setIsTyping(false);
  };

  const onConnect = () => {
    setIsConnected(true);
  };

  const onDisconnect = () => {
    setIsConnected(false);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting) {
          fetchMessages();
        }
      },
      { threshold: 1 }
    );

    observerRef.current = observer;

    if (lastItemRef.current) {
      observerRef?.current?.observe(lastItemRef.current);
    }

    return () => {
      observerRef?.current?.disconnect();
    };
  }, [messages?.data?.length]);

  useEffect(() => {
    if (!socket) return;
    // Set up event listeners for various socket events:

    // Listener for when the socket connects.
    socket.on(CONNECTED_EVENT, onConnect);
    // Listener for when the socket disconnects.
    socket.on(DISCONNECT_EVENT, onDisconnect);
    // Listener for when a user is typing.
    socket.on(TYPING_EVENT, handleOnSocketTyping);
    // Listener for when a user stops typing.
    socket.on(STOP_TYPING_EVENT, handleOnSocketStopTyping);
    // Listener for when a new message is received.
    socket.on(MESSAGE_RECEIVED_EVENT, onMessageReceived);
    // Listener for when a message is edited.
    socket.on(MESSAGE_EDITED_EVENT, onMessageEdited);

    return () => {
      // Remove all the event listeners to avoid memory leaks.
      socket.off(CONNECTED_EVENT, onConnect);
      socket.off(DISCONNECT_EVENT, onDisconnect);
      socket.off(TYPING_EVENT, handleOnSocketTyping);
      socket.off(STOP_TYPING_EVENT, handleOnSocketStopTyping);
      socket.off(MESSAGE_RECEIVED_EVENT, onMessageReceived);
      socket.off(MESSAGE_EDITED_EVENT, onMessageEdited);
    };
  }, [socket]);

  const renderMessageItem = (message, index) => (
    <div
      className="group"
      key={message._id}
      ref={(element) => {
        if (index === messages.data.length - 1) {
          lastItemRef.current = element;
        }
      }}
    >
      <MessageItem
        message={message}
        myDetails={{ _id: profileId }}
        sender={{
          _id: message.senderId,
          profile: message.sender,
        }}
      />
    </div>
  );

  if (error) {
    return <p>Something went wrong!</p>;
  }

  return (
    <div className="flex-1 flex flex-col-reverse overflow-y-auto">
      {messages?.data?.length && (
        <div className="flex flex-col-reverse">
          {messages.data.map((message, index) =>
            renderMessageItem(message, index)
          )}
        </div>
      )}
      {(!messages?.data?.length || !messages.hasMoreMessages) && (
        <div className="flex flex-col pt-3">
          <div className="flex-1" />
          <MessageWelcome type="conversation" name={name} />
        </div>
      )}
    </div>
  );
};

export default MessageDirect;
