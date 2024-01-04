import mongoose from "mongoose";
import Profile from "./profile.modals.js";
import Server from "./server.modals.js";
import ServerConversation from "./serverConversation.modals.js";

const channelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ["TEXT", "AUDIO", "VIDEO"],
    default: "TEXT",
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
  members: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
  ],
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServerConversation",
  },
  createdAt: { type: Date, default: Date.now, required: true },
  updatedAt: { type: Date, default: Date.now, required: true },
});

channelSchema.pre("save", async function (next) {
  const isNewChannel = this.isNew;

  if (isNewChannel) {
    try {
      const user = await Profile.findById(this.profileId); // Find profile with server's profileId argument
      const server = await Server.findById(this.serverId);
      if (server) {
        server.channels.push(this._id); // Push this server's id to profile's "servers" array
      }
      await user.save();
      await server.save();

      const newConversation = new ServerConversation({
        serverId: this.serverId,
        channelId: this._id,
      });

      this.conversationId = newConversation._id;
      await newConversation.save();
    } catch (err) {
      return next(err);
    }
  }
  next();
});

const Channel = mongoose.model("Channel", channelSchema);
export default Channel;
