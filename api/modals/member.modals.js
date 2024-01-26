import mongoose from "mongoose";
import Profile from "./profile.modals.js";
import Channel from "./channel.modals.js";
import Server from "./server.modals.js";

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
