import mongoose from "mongoose";

const directMessageSchema = new mongoose.Schema(
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
    SenderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
    ReceiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DirectConversation",
      required: true,
    },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

directMessageSchema.index({ memberId: 1 });
directMessageSchema.index({ conversationId: 1 });

const DirectMessage = mongoose.model("DirectMessage", directMessageSchema);

export default DirectMessage;
