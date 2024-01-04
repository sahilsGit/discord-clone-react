import mongoose from "mongoose";

const serverMessageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
    },
    fileUrl: {
      type: [
        {
          url: String,
          localPath: String,
        },
      ],
      default: [],
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
    },
    serverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Server",
      required: true,
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServerConversation",
      required: true,
    },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

serverMessageSchema.index({ channelId: 1 });
serverMessageSchema.index({ memberId: 1 });
serverMessageSchema.index({ serverId: 1 });

const ServerMessage = mongoose.model("ServerMessage", serverMessageSchema);
export default ServerMessage;
