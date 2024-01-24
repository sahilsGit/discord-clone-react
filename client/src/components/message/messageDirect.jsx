import React, { useEffect, useRef, useState } from "react";
import MessageWelcome from "./messageWelcome";
import useAuth from "@/hooks/useAuth";
import useSocket from "@/hooks/useSocket";
import MessageItem from "./messageItem";
import useConversations from "@/hooks/useConversations";
import {
  getMoreDirectMessages,
  processEditedDirectMessage,
  processReceivedDirectMessage,
} from "@/lib/context-helper";

const MessageDirect = ({ activeConversation, messages, cursor, hasMore }) => {
  console.log(messages.length);
  const authDispatch = useAuth("dispatch");
  const [error, setError] = useState(false);
  const observerRef = useRef();
  const lastItemRef = useRef();
  const { socket } = useSocket();
  const [isConnected, setIsConnected] = useState(false);
  const profileId = useAuth("id");

  const CONNECTED_EVENT = "connected";
  const DISCONNECT_EVENT = "disconnect";
  const TYPING_EVENT = "typing";
  const STOP_TYPING_EVENT = "stopTyping";
  const MESSAGE_RECEIVED_EVENT = "messageReceived";
  const MESSAGE_EDITED_EVENT = "messageEdited";
  const conversationsDispatch = useConversations("dispatch");
  const name = activeConversation?.theirName;

  /**
   * Handles the event when a new message is received.
   */
  const onMessageReceived = (message) => {
    processReceivedDirectMessage(
      message,
      messages,
      profileId,
      cursor,
      hasMore,
      conversationsDispatch
    );
  };

  const onMessageEdited = (message) => {
    processEditedDirectMessage(
      message,
      messages,
      activeConversation._id,
      cursor,
      hasMore,
      conversationsDispatch
    );
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
          const errorStatusAfterFetch = await getMoreDirectMessages(
            activeConversation._id,
            cursor,
            conversationsDispatch,
            authDispatch,
            messages
          );

          if (errorStatusAfterFetch) {
            setError(errorStatusAfterFetch);
          }
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
  }, [socket, messages]);

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
      <MessageItem
        message={message}
        myDetails={{ _id: profileId }}
        sender={{
          _id: message.senderId,
          profile: message.sender,
        }}
        apiRoute="/messages/update/direct"
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
          <MessageWelcome type="conversation" name={name} />
        </div>
      )}
    </div>
  );
};

export default MessageDirect;
