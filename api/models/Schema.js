import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  imageUrl: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  servers: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Server", required: true },
  ],
  members: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
  ],
  channels: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Channel", required: true },
  ],
  createdAt: { type: Date, default: Date.now, required: true },
  updatedAt: { type: Date, default: Date.now, required: true },
});

// Define a pre-remove hook for the Profile schema
profileSchema.pre("remove", async function (next) {
  // Remove all associated servers and members when a profile is deleted
  await mongoose.model("Server").deleteMany({ profileId: this._id });
  await mongoose.model("Member").deleteMany({ profileId: this._id });
  next();
});

const serverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  imageUrl: String,
  inviteCode: { type: String, unique: true, required: true },
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
    required: true,
  },
  members: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
  ],
  channels: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Channel", required: true },
  ],
  createdAt: { type: Date, default: Date.now, required: true },
  updatedAt: { type: Date, default: Date.now, required: true },
});

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
    { type: mongoose.Schema.Types.ObjectId, ref: "Message", required: true },
  ],
  directMessages: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DirectMessage",
      required: true,
    },
  ],
  conversationsInitiated: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
  ],
  conversationsReceived: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
  ],
  createdAt: { type: Date, default: Date.now, required: true },
  updatedAt: { type: Date, default: Date.now, required: true },
});

// Define a pre-remove hook for the Server schema
serverSchema.pre("remove", async function (next) {
  // Remove all associated members when a server is deleted
  await mongoose.model("Member").deleteMany({ serverId: this._id });
  next();
});

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
  messages: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Message", required: true },
  ],
  createdAt: { type: Date, default: Date.now, required: true },
  updatedAt: { type: Date, default: Date.now, required: true },
});

const messageSchema = new mongoose.Schema({
  content: { type: mongoose.Schema.Types.String, required: true },
  fileUrl: { type: String },
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
  deleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, required: true },
  updatedAt: { type: Date, default: Date.now, required: true },
});

const conversationSchema = new mongoose.Schema({
  memberOneId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member",
    required: true,
  },
  memberTwoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member",
    required: true,
  },
  directMessages: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DirectMessage",
      required: true,
    },
  ],
  createdAt: { type: Date, default: Date.now, required: true },
});

const directMessageSchema = new mongoose.Schema({
  content: { type: mongoose.Schema.Types.String, required: true },
  fileUrl: { type: String },
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member",
    required: true,
  },
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
    required: true,
  },
  deleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, required: true },
  updatedAt: { type: Date, default: Date.now, required: true },
});

const Profile = mongoose.model("Profile", profileSchema);
const Server = mongoose.model("Server", serverSchema);
const Member = mongoose.model("Member", memberSchema);
const Channel = mongoose.model("Channel", channelSchema);
const Message = mongoose.model("Message", messageSchema);
const Conversation = mongoose.model("Conversation", conversationSchema);
const DirectMessage = mongoose.model("DirectMessage", directMessageSchema);

export {
  Profile,
  Server,
  Member,
  Channel,
  Message,
  Conversation,
  DirectMessage,
};
