import mongoose from "mongoose";

const serverConversationSchema = new mongoose.Schema({
  serverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Server",
    required: true,
  },
  channelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Channel",
    required: true,
  },
  messages: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServerMessage",
      required: true,
    },
  ],
});

const ServerConversation = mongoose.model(
  "ServerConversation",
  serverConversationSchema
);

export default ServerConversation;
