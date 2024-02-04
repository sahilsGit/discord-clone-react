import Profile from "../modals/profile.modals.js";
import Session from "../modals/session.modals.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { emailVerificationMailContent, sendEmail } from "../utils/mail.js";

const register = async (req, res, next) => {
  /*
  Handles user Registration
  */
  try {
    const { username, name, email, password } = req.body;

    // Validations
    if (!username) {
      return res.send({ message: "A unique username is required" });
    }
    if (!name) {
      return res.send({ message: "Full name is Required" });
    }
    if (!email) {
      return res.send({ message: "Email is Required" });
    }

    const existingProfile = await Profile.findOne({ email });

    // Checking if user already exists
    if (existingProfile) {
      return res.status(200).send({
        success: false,
        message: "Already Registered, you can login",
      });
    }

    // If not, then carry on with the registration process
    if (!password) {
      return res.send({ error: "Password is Required" });
    }

    const newProfile = new Profile({
      username,
      name,
      email,
      password: password,
    });

    // Checking if optional data given
    if (req.body.image) {
      newProfile.image = req.body.image;
    }

    const { unHashedCode, hashedCode, tokenExpiry } =
      newProfile.generateVerificationCode();

    newProfile.emailVerificationToken = hashedCode;
    newProfile.emailVerificationExpiry = tokenExpiry;

    await sendEmail({
      email: newProfile?.email,
      subject: "Please verify your email",
      content: emailVerificationMailContent(newProfile.username, unHashedCode),
    });

    await newProfile.save();

    // Create a session equivalent JWT token
    const access_token = jwt.sign(
      {
        username: newProfile.username,
        profileId: newProfile._id,
        name: newProfile.name,
        image: newProfile.image,
      },
      process.env.JWT,
      {
        expiresIn: "5m", // Token expiration time
      }
    ); // Authorize user using the secret key

    const refresh = jwt.sign(
      {
        username: newProfile.username,
        profileId: newProfile._id,
        name: newProfile.name,
        image: newProfile.image,
      },
      process.env.REFRESH,
      {
        expiresIn: "30m", // Token expiration time
      }
    ); // Authorize user using the secret key

    const newSession = new Session({
      token: refresh,
      profileId: newProfile._id,
      expireAt: new Date(Date.now() + 30 * 60 * 1000),
    });

    await newSession.save();

    res.cookie("refresh_token", refresh, {
      httpOnly: true,
      path: "/",
      sameSite: "Lax",
      maxAge: 30 * 60 * 1000,
    });

    res.status(200).send({
      username: newProfile.username,
      newAccessToken: access_token,
      profileId: newProfile._id,
      name: newProfile.name,
      image: newProfile.image || "",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(500).send({
        message: "Username is already taken, please enter a new one.",
      });
    }
    error.status = 500;
    error.message = "Internal server error!";
    next(error);
  }
};

const login = async (req, res, next) => {
  /*
  Handles user login
  */
  try {
    // Validation
    const email = req.body.email;
    const receivedPassword = req.body.password;

    if (!email || !receivedPassword) {
      return res.status(404).send({
        success: false,
        message: "email or password can't be empty",
      });
    }

    const userProfile = await Profile.findOne({ email });

    // Check if the user exists
    if (!userProfile) {
      return res.status(404).send({
        success: false,
        message: "Profile not found, register before logging in",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      receivedPassword,
      userProfile.password
    ); // Compare the password with its hashed version

    if (!isPasswordCorrect) {
      return res.status(404).send({
        success: false,
        message: "Incorrect Email or password.",
      });
    }

    // Create a session equivalent JWT token
    const access_token = jwt.sign(
      {
        username: userProfile.username,
        profileId: userProfile._id,
        name: userProfile.name,
        image: userProfile.image,
      },
      process.env.JWT,
      {
        expiresIn: "5m", // Token expiration time
      }
    ); // Authorize user using the secret key

    const refresh = jwt.sign(
      {
        username: userProfile.username,
        profileId: userProfile._id,
        name: userProfile.name,
        image: userProfile.image,
      },
      process.env.REFRESH,
      {
        expiresIn: "30m", // Token expiration time
      }
    ); // Authorize user using the secret key

    const newSession = new Session({
      token: refresh,
      profileId: userProfile._id,
      expireAt: new Date(Date.now() + 30 * 60 * 1000),
    });

    await newSession.save();

    res.cookie("refresh_token", refresh, {
      httpOnly: true,
      path: "/",
      sameSite: "Lax",
      maxAge: 30 * 60 * 1000,
    });

    res.status(200).send({
      username: userProfile.username,
      newAccessToken: access_token,
      profileId: userProfile._id,
      name: userProfile.name,
      image: userProfile.image || "",
    });
  } catch (error) {
    // error.status = 500;
    // error.message = "Internal server error!";
    next(error);
  }
};

const handleLogout = async (req, res, next) => {
  try {
    const cookies = req.cookies;
    if (cookies.refresh_token) {
      res.clearCookie("refresh_token");
    }

    await Session.findOneAndRemove({ token: cookies.refresh_token });

    // Send a response to the client
    res.send("Success! Cookies' gone");
  } catch (error) {
    next(error);
  }
};

const refreshUserDetails = async (req, res, next) => {
  // Extract tokens from cookies and headers
  try {
    const profile = await Profile.findById(req.user.profileId);

    res.status(200).send({
      user: profile.username,
      profileId: profile._id,
      name: profile.name,
      image: profile.image || "",
      email: { data: profile.email, isEmailVerified: profile.isEmailVerified },
      about: profile.about || "",
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  console.log(req.body);
  try {
    const otp = req.body.old;
    const newPassword = req.body.newPassword;
    const confirmPassword = req.body.confirmPassword;

    if (!otp) {
      return res.status(404).send({ message: "No code received!" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).send({
        message: "New password and confirm Password field don't match",
      });
    }

    // generate a hash from the token that we are receiving
    const hashedCode = crypto
      .createHash("sha256")
      .update(otp.toString())
      .digest("hex");

    const profile = await Profile.findOne({
      forgotPasswordToken: hashedCode,
      forgotPasswordExpiry: { $gt: Date.now() },
    });

    if (!profile) {
      return res
        .status(489)
        .send({ message: "OTP is either incorrect or has expired" });
    }

    profile.forgotPasswordToken = null;
    profile.forgotPasswordExpiry = null;

    profile.password = newPassword;
    await profile.save();

    return res.status(200).send({ message: "Password changed successfully!" });
  } catch (error) {
    next(error);
  }
};

const revokeToken = async (req, res, next) => {
  try {
    // Extract profileId from the request body
    const { profileId } = req.body;

    // Validate if profileId is provided
    if (!profileId) {
      return res
        .status(400)
        .send({ message: "ProfileId is required in the request body." });
    }

    // Find and remove sessions associated with the provided profileId
    const result = await Session.deleteMany({ profileId });

    // Check if any sessions were revoked
    if (result.deletedCount > 0) {
      return res.status(200).send({ message: "Token revoked successfully." });
    } else {
      return res
        .status(404)
        .send({ message: "No sessions found for the provided profileId." });
    }
  } catch (error) {
    next(error);
  }
};

export {
  handleLogout,
  refreshUserDetails,
  register,
  login,
  resetPassword,
  revokeToken,
};
