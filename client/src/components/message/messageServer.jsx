import React, { memo, useEffect, useRef, useState } from "react";
import MessageWelcome from "./messageWelcome";
import useAuth from "@/hooks/useAuth";
import useServer from "@/hooks/useServer";
import useSocket from "@/hooks/useSocket";
import MessageItem from "./messageItem";
import useChannels from "@/hooks/useChannels";
import {
  getMoreServerMessages,
  processEditedServerMessage,
  processReceivedServerMessage,
} from "@/lib/context-helper";

const MessageServer = memo(({ activeChannel, messages, cursor, hasMore }) => {
  console.log(messages);
  const name = activeChannel?.name;
  const authDispatch = useAuth("dispatch");
  const myMembership = useServer("activeServer").myMembership;
  const channelId = activeChannel._id;
  const [error, setError] = useState(false);
  const observerRef = useRef();
  const lastItemRef = useRef();
  const { socket } = useSocket();
  const [isConnected, setIsConnected] = useState(false);
  const channelsDispatch = useChannels("dispatch");

  const CONNECTED_EVENT = "connected";
  const DISCONNECT_EVENT = "disconnect";
  const TYPING_EVENT = "typing";
  const STOP_TYPING_EVENT = "stopTyping";
  const MESSAGE_RECEIVED_EVENT = "messageReceived";
  const MESSAGE_EDITED_EVENT = "messageEdited";

  /*
   * Handles the event when a new message is received.
   */
  const onMessageReceived = (message) => {
    processReceivedServerMessage(
      message,
      messages,
      channelId,
      cursor,
      hasMore,
      channelsDispatch
    );
  };

  const onMessageEdited = (message) => {
    console.log(messages);
    processEditedServerMessage(
      message,
      messages,
      channelId,
      cursor,
      hasMore,
      channelsDispatch
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
          // Fetching another batch when observer intersects
          const errorStatusAfterFetch = await getMoreServerMessages(
            myMembership._id,
            channelId,
            cursor,
            channelsDispatch,
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
        myDetails={myMembership}
        sender={message.member}
        apiRoute="/messages/update/server"
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
