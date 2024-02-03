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
import { format } from "date-fns";

const MessageServer = memo(({ activeChannel, messages, cursor, hasMore }) => {
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
  const [isEditing, setIsEditing] = useState([false, ""]);
  const DATE_FORMAT = "d-MM-yyyy, HH:mm";

  const CONNECTED_EVENT = "connected";
  const DISCONNECT_EVENT = "disconnect";
  const TYPING_EVENT = "typing";
  const STOP_TYPING_EVENT = "stopTyping";
  const MESSAGE_RECEIVED_EVENT = "messageReceived";
  const MESSAGE_EDITED_EVENT = "messageEdited";
  const MESSAGE_DELETED_EVENT = "messageDeleted";

  const handleEditChange = (status) => {
    setIsEditing([status[0], status[1]]);
  };

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
    processEditedServerMessage(
      message,
      messages,
      channelId,
      cursor,
      hasMore,
      channelsDispatch
    );
  };

  const onMessageDeleted = (message) => {
    processEditedServerMessage(
      message,
      messages,
      channelId,
      cursor,
      hasMore,
      channelsDispatch
    );
  };

  /*
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
    observerRef.current = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting) {
          if (isEditing[0]) {
            return;
          }

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
      { threshold: 0.5 }
    );

    if (lastItemRef.current) {
      observerRef?.current?.observe(lastItemRef.current);
    }

    return () => {
      observerRef?.current?.disconnect();
    };
  }, [messages?.length, isEditing]);

  useEffect(() => {
    if (!socket) return;

    // Set up event listeners for various socket events:
    socket.on(CONNECTED_EVENT, onConnect);
    socket.on(DISCONNECT_EVENT, onDisconnect);
    socket.on(TYPING_EVENT, handleOnSocketTyping);
    socket.on(STOP_TYPING_EVENT, handleOnSocketStopTyping);
    socket.on(MESSAGE_RECEIVED_EVENT, onMessageReceived);
    socket.on(MESSAGE_EDITED_EVENT, onMessageEdited);
    socket.on(MESSAGE_DELETED_EVENT, onMessageDeleted);

    return () => {
      // Remove all the event listeners to avoid memory leaks.
      socket.off(CONNECTED_EVENT, onConnect);
      socket.off(DISCONNECT_EVENT, onDisconnect);
      socket.off(TYPING_EVENT, handleOnSocketTyping);
      socket.off(STOP_TYPING_EVENT, handleOnSocketStopTyping);
      socket.off(MESSAGE_RECEIVED_EVENT, onMessageReceived);
      socket.off(MESSAGE_EDITED_EVENT, onMessageEdited);
      socket.off(MESSAGE_DELETED_EVENT, onMessageDeleted);
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
        timeStamp={format(new Date(message.createdAt), DATE_FORMAT)}
        myDetails={myMembership}
        sender={message.member}
        apiRoute="/messages/server"
        isEditing={isEditing}
        setIsEditing={handleEditChange}
      />
    </div>
  );

  if (error) {
    return <p>Something went wrong!</p>;
  }

  return (
    <div className="flex-1 max-w-[1224px] flex flex-col-reverse overflow-y-auto">
      {messages?.length ? (
        <div className="flex flex-col-reverse">
          {messages?.map((message, index) => renderMessageItem(message, index))}
        </div>
      ) : null}
      {(!messages?.length || !hasMore) && (
        <div className="flex flex-col pt-3 pr-4">
          <div />
          <MessageWelcome type="channel" name={name} />
        </div>
      )}
    </div>
  );
});

export default MessageServer;
