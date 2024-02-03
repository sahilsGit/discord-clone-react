// Concept code where every ping/emit/event is authenticated
// TODO: Implement a socket.use() middleware instead

import jwt from "jsonwebtoken";
import Profile from "../modals/profile.modals.js";
import { ConversationEventEnum } from "../utils/constants.js";

const authenticateSocket = async (socket) => {
  try {
    // Extract the access_token out of the auth header
    const access_token = socket.handshake.auth?.access_token;

    if (!access_token) {
      throw new Error("Un-authorized handshake. Token is missing");
    }

    const decodedToken = jwt.verify(access_token, process.env.JWT);
    const profile = await Profile.findById(decodedToken?.profileId).select(
      "-password -emailVerificationToken -emailVerificationExpiry"
    );

    if (!profile) {
      throw new Error("Un-authorized handshake. Token is invalid");
    }

    socket.profile = profile;
  } catch (error) {
    return error;
  }
};

const mountJoinConversationEvent = (socket) => {
  socket.on(ConversationEventEnum.JOIN_CONVERSATION, async (conversationId) => {
    try {
      await authenticateSocket(socket);
      socket.join(conversationId);
    } catch (error) {
      socket.emit(
        ConversationEventEnum.SOCKET_ERROR,
        error?.message || "Unauthorized"
      );
    }
  });
};

const mountParticipantTypingEvent = (socket) => {
  socket.on(ConversationEventEnum.TYPING, async (conversationId) => {
    try {
      await authenticateSocket(socket);
      socket
        .in(conversationId)
        .emit(ChatEventEnum.TYPING_EVENT, conversationId);
    } catch (error) {
      socket.emit(
        ConversationEventEnum.SOCKET_ERROR,
        error?.message || "Unauthorized"
      );
    }
  });
};

const mountParticipantStoppedTypingEvent = (socket) => {
  socket.on(ConversationEventEnum.STOP_TYPING, async (conversationId) => {
    try {
      await authenticateSocket(socket);
      socket.in(conversationId).emit(ChatEventEnum.STOP_TYPING, conversationId);
    } catch (error) {
      socket.emit(
        ConversationEventEnum.SOCKET_ERROR,
        error?.message || "Unauthorized"
      );
    }
  });
};

const initializeSocket = (io) => {
  return io.on("connection", async (socket) => {
    try {
      await authenticateSocket(socket);

      socket.join(socket.profile._id.toString());
      socket.emit(ConversationEventEnum.CONNECTED); // Emit "connection successful" event to the client

      mountJoinConversationEvent(socket);
      mountParticipantTypingEvent(socket);
      mountParticipantStoppedTypingEvent(socket);

      socket.on(ConversationEventEnum.DISCONNECT, () => {
        if (socket.profile?._id) {
          socket.leave(socket.profile._id);
        }
      });
    } catch (error) {
      socket.emit(
        ConversationEventEnum.SOCKET_ERROR,
        error?.message || "Unauthorized"
      );
    }
  });
};

const emitSocketEvent = (req, roomId, event, payload) => {
  req.app.get("io").in(roomId).emit(event, payload);
};

export { initializeSocket, emitSocketEvent };
