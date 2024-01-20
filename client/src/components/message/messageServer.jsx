import React, { useEffect, useRef, useState } from "react";
import MessageWelcome from "./messageWelcome";
import { get } from "@/services/api-service";
import useAuth from "@/hooks/useAuth";
import { handleError, handleResponse } from "@/lib/response-handler";
import useServer from "@/hooks/useServer";
import useSocket from "@/hooks/useSocket";
import MessageItem from "./messageItem";
import useMessages from "@/hooks/useMessages";

const MessageServer = memo(() => {
  const activeChannel = useServer("activeChannel");
  const name = activeChannel?.name;
  const authDispatch = useAuth("dispatch");
  const access_token = useAuth("token");
  const myMembership = useServer("activeServer").myMembership;
  const channelId = useServer("activeChannel")._id;
  const [error, setError] = useState(false);
  const observerRef = useRef();
  const lastItemRef = useRef();
  const { socket } = useSocket();
  const [isConnected, setIsConnected] = useState(false);
  const cursor = useMessages("cursor");
  const messages = useMessages("messages");
  const hasMore = useMessages("hasMore");
  const messagesDispatch = useMessages("dispatch");

  const CONNECTED_EVENT = "connected";
  const DISCONNECT_EVENT = "disconnect";
  const TYPING_EVENT = "typing";
  const STOP_TYPING_EVENT = "stopTyping";
  const MESSAGE_RECEIVED_EVENT = "messageReceived";
  const MESSAGE_EDITED_EVENT = "messageEdited";

  const fetchMessages = async () => {
    try {
      console.log("yes for sure");
      const response = await get(
        `/messages/fetch?memberId=${myMembership._id}&channelId=${channelId}&cursor=${cursor}`,
        access_token
      );

      const messageData = await handleResponse(response, authDispatch);

      console.log("got data", messageData);

      messagesDispatch({
        type: "SET_MESSAGES",
        payload: {
          messages: [...messages, ...messageData.messages],
          cursor: messageData.newCursor || cursor,
          hasMore: messageData.hasMoreMessages,
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
    if (message.channelId === channelId) {
      messages?.length
        ? messagesDispatch({
            type: "SET_MESSAGES",
            payload: {
              messages: [message, ...messages],
              cursor: cursor,
              hasMore: hasMore,
            },
          })
        : messagesDispatch({
            type: "SET_MESSAGES",
            payload: {
              messages: [message, ...messages],
              cursor: message.createdAt,
              hasMore: false,
            },
          });
    }
  };

  const onMessageEdited = (message) => {
    if (message.channelId === channelId) {
      const messageIndex = messages.findIndex((msg) => {
        return msg._id === message._id;
      });

      // If the message is found in the array, update it
      if (messageIndex !== -1) {
        const updatedMessages = [...messages];
        updatedMessages[messageIndex] = message;

        // Update the state with the updated message
        messagesDispatch({
          type: "SET_MESSAGES",
          payload: {
            messages: updatedMessages,
            cursor: cursor,
            hasMore: hasMore,
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
        console.log(entries[0]);
        if (entries[0].isIntersecting) {
          console.log("fetching");
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
  }, [messages?.length]);

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
        if (index === messages.length - 1) {
          lastItemRef.current = element;
        }
      }}
    >
      {/* <div className="h-[100px]">{message.content}</div> */}
      <MessageItem
        message={message}
        myDetails={myMembership}
        sender={message.member}
      />
    </div>
  );

  if (error) {
    return <p>Something went wrong!</p>;
  }

  return (
    <div className="flex-1 flex flex-col-reverse overflow-y-auto">
      {messages?.length && (
        <div className="flex flex-col-reverse">
          {messages?.map((message, index) => renderMessageItem(message, index))}
        </div>
      )}
      {(!messages?.length || !hasMore) && (
        <div className="flex flex-col pt-3">
          <div className="flex-1" />
          <MessageWelcome type="channel" name={name} />
        </div>
      )}
    </div>
  );
});

export default MessageServer;
