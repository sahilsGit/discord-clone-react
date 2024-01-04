import mongoose from "mongoose";

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

const Session = mongoose.model("Session", sessionSchema);
export default Session;
