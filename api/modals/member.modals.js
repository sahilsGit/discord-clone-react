import mongoose from "mongoose";

const memberSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["ADMIN", "MODERATOR", "GUEST"],
    default: "GUEST",
  },
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
    required: true,
  },
  serverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Server",
    required: true,
  },
  messages: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServerMessage",
    },
  ],
  createdAt: { type: Date, default: Date.now, required: true },
  updatedAt: { type: Date, default: Date.now, required: true },
});

memberSchema.index({ role: 1 });

const Member = mongoose.model("Member", memberSchema);

export default Member;
