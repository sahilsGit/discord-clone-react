import jwt from "jsonwebtoken";
import Profile from "../modals/profile.modals.js";
import { ConversationEventEnum } from "../utils/constants.js";

const mountChannels = async (socket) => {
  const channels = await Profile.aggregate([
    {
      $match: {
        _id: socket.profile._id,
      },
    },
    {
      $unwind: "$servers",
    },
    {
      $lookup: {
        from: "servers",
        localField: "servers",
        foreignField: "_id",
        as: "serverData",
      },
    },
    {
      $unwind: "$serverData",
    },
    {
      $project: {
        channels: "$serverData.channels",
      },
    },
    {
      $group: {
        _id: null,
        allChannels: { $addToSet: "$channels" },
      },
    },
    {
      $project: {
        _id: 0,
        allChannels: {
          $reduce: {
            input: "$allChannels",
            initialValue: [],
            in: { $concatArrays: ["$$value", "$$this"] },
          },
        },
      },
    },
  ]);

  channels[0]?.allChannels?.forEach((channel) => {
    const channelName = channel.toString("hex"); // Convert ObjectId to hexadecimal
    socket.join(channelName); // Joining all the channels
  });
};

const mountParticipantTypingEvent = (socket) => {
  socket.on(ConversationEventEnum.TYPING, async (conversationId) => {
    socket.in(conversationId).emit(ChatEventEnum.TYPING_EVENT, conversationId);
  });
};

const mountParticipantStoppedTypingEvent = (socket) => {
  socket.on(ConversationEventEnum.STOP_TYPING, async (conversationId) => {
    socket.in(conversationId).emit(ChatEventEnum.STOP_TYPING, conversationId);
  });
};

const initializeSocket = (io) => {
  return io.on("connection", async (socket) => {
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

      mountChannels(socket);

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
        error?.message || "Something went wrong while connecting to the socket."
      );
    }
  });
};

const emitSocketEvent = (req, roomId, event, payload) => {
  req.app.get("io").in(roomId).emit(event, payload);
};

export { initializeSocket, emitSocketEvent };
