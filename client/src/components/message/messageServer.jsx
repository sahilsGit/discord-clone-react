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
  /*
   *
   * Responsible for rendering messages and managing related socket events
   * Also handles pagination logic using intersection observer and cursor
   * Corresponds to "channel" type, thereby handling server messages
   *
   *
   * "MessageDirect" is it's shadow component for when type is "conversation"
   *
   */

  const observerRef = useRef(); // For intersection observer
  const lastItemRef = useRef(); // For tracking last message
  const { socket } = useSocket();
  const name = activeChannel?.name;
  const authDispatch = useAuth("dispatch");
  const channelsDispatch = useChannels("dispatch");
  const myMembership = useServer("activeServer").myMembership;
  const channelId = activeChannel._id;
  const [error, setError] = useState(false);
  const [isEditing, setIsEditing] = useState([false, ""]);
  const [isConnected, setIsConnected] = useState(false);

  const DATE_FORMAT = "d-MM-yyyy, HH:mm";

  // Map socket-related events
  const CONNECTED_EVENT = "connected";
  const DISCONNECT_EVENT = "disconnect";
  const MESSAGE_RECEIVED_EVENT = "messageReceived";
  const MESSAGE_EDITED_EVENT = "messageEdited";
  const MESSAGE_DELETED_EVENT = "messageDeleted";

  // For when a specific message is being edited
  const handleEditChange = (status) => {
    setIsEditing([status[0], status[1]]);
  };

  // Handles socket's onMessageReceived event
  const onMessageReceived = (message) => {
    processReceivedServerMessage(
      message,
      messages,
      channelId,
      cursor,
      hasMore,
      channelsDispatch
    ); // Processor utility function
  };

  // Handles socket's onMessageEdited event
  const onMessageEdited = (message) => {
    processEditedServerMessage(
      message,
      messages,
      channelId,
      cursor,
      hasMore,
      channelsDispatch
    ); // Processor utility function
  };

  // Handles socket's onMessageDeleted event
  const onMessageDeleted = (message) => {
    processEditedServerMessage(
      message,
      messages,
      channelId,
      cursor,
      hasMore,
      channelsDispatch
    ); // Processor utility function
  };

  const onConnect = () => {
    setIsConnected(true);
  };

  const onDisconnect = () => {
    setIsConnected(false);
  };

  useEffect(() => {
    // Create an observer and start observing
    observerRef.current = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting) {
          // Don't fetch while editing a message to avoid bugs
          if (isEditing[0]) {
            return;
          }

          // Fetching another batch when observer intersects and store error if any
          const errorStatusAfterFetch = await getMoreServerMessages(
            myMembership._id,
            channelId,
            cursor,
            channelsDispatch,
            authDispatch,
            messages
          );

          // If error update the error state
          if (errorStatusAfterFetch) {
            setError(errorStatusAfterFetch);
          }
        }
      },
      { threshold: 0.5 }
    );

    // Start observing the message that's stored in lastItemRef i.e., last message
    if (lastItemRef.current) {
      observerRef?.current?.observe(lastItemRef.current);
    }

    // Cleanup Observer to avoid memory leak
    return () => {
      observerRef?.current?.disconnect();
    };
  }, [messages?.length, isEditing]);

  useEffect(() => {
    if (!socket) return;

    // Set up event listeners for various socket events:
    socket.on(CONNECTED_EVENT, onConnect);
    socket.on(DISCONNECT_EVENT, onDisconnect);
    socket.on(MESSAGE_RECEIVED_EVENT, onMessageReceived);
    socket.on(MESSAGE_EDITED_EVENT, onMessageEdited);
    socket.on(MESSAGE_DELETED_EVENT, onMessageDeleted);

    return () => {
      // Remove all the event listeners to avoid memory leaks.
      socket.off(CONNECTED_EVENT, onConnect);
      socket.off(DISCONNECT_EVENT, onDisconnect);
      socket.off(MESSAGE_RECEIVED_EVENT, onMessageReceived);
      socket.off(MESSAGE_EDITED_EVENT, onMessageEdited);
      socket.off(MESSAGE_DELETED_EVENT, onMessageDeleted);
    };
  }, [socket, messages]);

  // TODO
  if (error) {
    return <p>Something went wrong!</p>;
  }

  // Render a single message item
  const renderMessageItem = (message, index) => (
    <div
      className="group"
      key={message._id}
      ref={(element) => {
        // Check if it's the last message, if yes then update ref and start observing
        if (index === messages.length - 1) {
          lastItemRef.current = element;
        }
      }}
    >
      {/* Render the message item */}
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

  return (
    <div className="flex-1 max-w-[1224px] flex flex-col-reverse overflow-y-auto">
      {messages?.length ? (
        <div className="flex flex-col-reverse">
          {messages?.map((message, index) => renderMessageItem(message, index))}
        </div>
      ) : null}
      {/* Display chat welcome if it's the end of the conversation */}
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
