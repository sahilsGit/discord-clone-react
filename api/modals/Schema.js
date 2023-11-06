import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  image: String,
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

const sessionSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
    required: true,
  },
  createdAt: { type: Date, default: Date.now, required: true },
  expireAt: { type: Date, required: true },
});

// Remove `expireAfterSeconds` from index
sessionSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
sessionSchema.index({ token: 1 });
sessionSchema.index({ profileId: 1 });

// Define a pre-remove hook for the Profile schema
profileSchema.pre("remove", async function (next) {
  // Remove all associated servers and members when a profile is deleted
  await mongoose.model("Server").deleteMany({ profileId: this._id });
  await mongoose.model("Member").deleteMany({ profileId: this._id });
  next();
});

const serverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: String,
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

// Add a pre-save hook to update the user's servers array
serverSchema.pre("save", async function (next) {
  // Find the user (profile) by their profileId and update their servers array
  const Profile = mongoose.model("Profile");
  try {
    const user = await Profile.findById(this.profileId); // Find profile with server's profileId argument
    if (user) {
      user.servers.push(this._id); // Push this server's id to profile's "servers" array

      // Create member
      const member = new Member({
        role: "ADMIN", // Set the default role here if needed
        profileId: user._id, // user's id
        serverId: this._id, // server's id
      });

      await member.save();
      user.members.push(member._id);
      this.members.push(member._id);
      await user.save(); // save user
    }
  } catch (err) {
    return next(err);
  }

  next();
});

// Add a pre-remove hook to remove the server's ID from the user's servers array
serverSchema.pre("remove", async function (next) {
  // Find the user (profile) by their profileId and remove the server's ID
  const Profile = mongoose.model("Profile");
  try {
    const user = await Profile.findById(this.profileId);
    if (user) {
      user.servers.pull(this._id); // Remove the server's ID from the array
      await user.save();
    }
  } catch (err) {
    return next(err);
  }
  next();
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
const Session = mongoose.model("Session", sessionSchema);

export {
  Profile,
  Server,
  Member,
  Channel,
  Message,
  Conversation,
  DirectMessage,
  Session,
};
