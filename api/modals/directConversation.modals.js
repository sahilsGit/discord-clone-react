import mongoose from "mongoose";

const directConversationSchema = new mongoose.Schema({
  initiatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
    required: true,
  },
  initiatedFor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
    required: true,
  },
  messages: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DirectMessage",
      required: true,
    },
  ],
});

const DirectConversation = mongoose.model(
  "DirectConversation",
  directConversationSchema
);

export default DirectConversation;
