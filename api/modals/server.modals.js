import mongoose from "mongoose";
import Member from "./member.modals.js";

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
  console.log("inside pre");

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

        user.members.push(member._id);
        this.members.push(member._id);

        await member.save();
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

const Server = mongoose.model("Server", serverSchema);
export default Server;
