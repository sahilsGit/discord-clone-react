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

profileSchema.index({ servers: 1 });

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

serverSchema.index({ profileId: 1 });

// Add a pre-save hook to update the user's servers array
serverSchema.pre("save", async function (next) {
  // Find the user (profile) by their profileId and update their servers array

  const isNewServer = this.isNew;

  if (isNewServer) {
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
  }
  next();
});

// Add a pre-remove hook to remove the server's ID from the user's servers array
serverSchema.pre("remove", async function (next) {
  // Find the user (profile) by their profileId and remove the server's ID
  await mongoose.model("Member").deleteMany({ serverId: this._id });
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

memberSchema.post("deleteOne", async function (next) {
  const profileUpdatePromise = mongoose
    .model("Profile")
    .updateOne(
      { _id: this.profileId },
      { $pull: { members: this._id, servers: this.serverId } }
    );

  const serverUpdatePromise = mongoose
    .model("Server")
    .updateOne({ _id: this.serverId }, { $pull: { members: this._id } });
  try {
    await Promise.all([profileUpdatePromise, serverUpdatePromise]);

    // // Remove references from the associated Message documents
    // await mongoose
    //   .model("Message")
    //   .updateMany(
    //     { _id: { $in: this.messages } },
    //     { $pull: { members: this._id } }
    //   );

    // // Remove references from the associated DirectMessage documents
    // await mongoose
    //   .model("DirectMessage")
    //   .updateMany(
    //     { _id: { $in: this.directMessages } },
    //     { $pull: { members: this._id } }
    //   );

    // // Remove references from the associated Conversation documents
    // await mongoose.model("Conversation").updateMany(
    //   {
    //     $or: [
    //       { _id: { $in: this.conversationsInitiated } },
    //       { _id: { $in: this.conversationsReceived } },
    //     ],
    //   },
    //   { $pull: { members: this._id } }
    // );

    next();
  } catch (error) {
    next(error);
  }
});

memberSchema.index({ role: 1 });

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

// Add a pre-save hook to update the user's servers array
channelSchema.pre("save", async function (next) {
  // Find the user (profile) by their profileId and update their servers array

  const isNewChannel = this.isNew;

  if (isNewChannel) {
    try {
      const user = await Profile.findById(this.profileId); // Find profile with server's profileId argument
      if (user) {
        user.channels.push(this._id); // Push this server's id to profile's "servers" array
      }

      const server = await Server.findById(this.serverId);
      if (server) {
        server.channels.push(this._id); // Push this server's id to profile's "servers" array
      }
      await user.save();
      await server.save();
    } catch (err) {
      return next(err);
    }
  }
  next();
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
