import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { USER_TEMPORARY_TOKEN_EXPIRY } from "../utils/constants.js";

const profileSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: { type: String, required: true },
    about: { type: String },
    image: { type: String, default: null },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    password: { type: String, required: [true, "Password is required"] },
    forgotPasswordToken: {
      type: String,
    },
    forgotPasswordExpiry: {
      type: Date,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationExpiry: {
      type: Date,
    },
    servers: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Server", required: true },
    ],
    members: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
    ],
    DirectConversation: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DirectConversation",
      },
    ],
  },
  { timestamps: true }
);

profileSchema.index({ servers: 1 });
profileSchema.index({ servers: 1, _id: 1 });

// Define hooks for the various secondary functionalities
profileSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

profileSchema.pre("remove", async function (next) {
  // Remove all associated servers and members when a profile is deleted
  await mongoose.model("Server").deleteMany({ profileId: this._id });
  await mongoose.model("Member").deleteMany({ profileId: this._id });
  next();
});

profileSchema.methods.generateTemporaryToken = function () {
  // Token to be sent for email verification
  const unHashedToken = crypto.randomBytes(20).toString("hex");

  // Save it in the DB to compare at the time of verification
  const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex");

  // This is the expiry time for the token (20 minutes)
  const tokenExpiry = Date.now() + USER_TEMPORARY_TOKEN_EXPIRY;
  return { unHashedToken, hashedToken, tokenExpiry };
};

const Profile = mongoose.model("Profile", profileSchema);

export default Profile;
