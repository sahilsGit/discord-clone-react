import Profile from "../modals/profile.modals.js";
import Session from "../modals/session.modals.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { emailVerificationMailContent, sendEmail } from "../utils/mail.js";

const register = async (req, res, next) => {
  /*
   *
   * Handles user Registration
   *
   */

  try {
    const { username, name, email, password } = req.body;

    // Validations
    if (!username) {
      return res
        .status(400)
        .send({ message: "A unique username is required!" });
    }
    if (!name) {
      return res.status(400).send({ message: "Full name is Required!" });
    }
    if (!email) {
      return res.status(400).send({ message: "Email is Required!" });
    }
    if (!password) {
      return res.status(400).send({ message: "Password is Required!" });
    }

    // Check if user already exists
    const existingProfile = await Profile.findOne({ email });

    if (existingProfile) {
      return res.status(409).send({
        message:
          "You are already Registered, you can login using your email and password!",
      });
    }

    const newProfile = new Profile({
      username,
      name,
      email,
      password: password,
    });

    // Checking if optional data is provided
    if (req.body.image) {
      newProfile.image = req.body.image;
    }

    // Generate verification code for email verification using schema method
    const { unHashedCode, hashedCode, tokenExpiry } =
      newProfile.generateVerificationCode();

    // Save token temporarily in DB
    newProfile.emailVerificationToken = hashedCode;
    newProfile.emailVerificationExpiry = tokenExpiry;

    // Save user
    await newProfile.save();

    // Send verification email email using nodemailer
    await sendEmail({
      email: newProfile?.email,
      subject: "Please verify your email",
      content: emailVerificationMailContent(newProfile.username, unHashedCode),
    });

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
        expiresIn: "5m", // Short Token expiration time for safety
      }
    );

    // Create a refresh token to be saved on Database to revoke sessions on demand
    const refresh = jwt.sign(
      {
        username: newProfile.username,
        profileId: newProfile._id,
        name: newProfile.name,
        image: newProfile.image,
      },
      process.env.REFRESH,
      {
        expiresIn: "6hr", // Token expiration time
      }
    );

    // Save the refresh token inside database
    const newSession = new Session({
      token: refresh,
      profileId: newProfile._id,
      expireAt: new Date(Date.now() + 30 * 60 * 1000),
    });

    await newSession.save();

    // Send refresh token via HTTPONLY cookies
    res.cookie("refresh_token", refresh, {
      httpOnly: true,
      path: "/",
      sameSite: "None",
      secure: true,
      maxAge: 6 * 60 * 60 * 1000, // Set maxAge to 6 hours in milliseconds
    });

    // Send access and other details via body
    res.status(200).send({
      username: newProfile.username,
      newAccessToken: access_token,
      profileId: newProfile._id,
      name: newProfile.name,
      image: newProfile.image || "",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).send({
        message: "Username is already taken, please enter a new one.",
      });
    } // Mongoose "Not unique" error

    // Handle other errors
    error.status = 500;
    error.message = "Internal server error!";
    next(error);
  }
};

const login = async (req, res, next) => {
  /*
   *
   *
   * Handles user login
   *
   *
   */

  try {
    // Validation
    const email = req.body.email;
    const receivedPassword = req.body.password;

    if (!email || !receivedPassword) {
      return res.status(404).send({
        message: "Email or password can't be empty!",
      });
    }

    const userProfile = await Profile.findOne({ email });

    // Check if the user exists
    if (!userProfile) {
      return res.status(404).send({
        message: "Profile not found, kindly register before logging in!",
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
        expiresIn: "6hr", // Token expiration time
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
      sameSite: "None",
      secure: true,
      maxAge: 6 * 60 * 60 * 1000, // Set maxAge to 6 hours in milliseconds
    });

    res.status(200).send({
      username: userProfile.username,
      newAccessToken: access_token,
      profileId: userProfile._id,
      name: userProfile.name,
      image: userProfile.image || "",
    });
  } catch (error) {
    // Handle general error
    next(error);
  }
};

const handleLogout = async (req, res, next) => {
  /*
   *
   * Handles logout along with revoking current session
   *
   */
  try {
    // Extract cookies from the request
    const cookies = req.cookies;

    // Check if a refresh token exists in the cookies
    if (cookies.refresh_token) {
      // Clear the refresh token cookie
      res.clearCookie("refresh_token");
    }

    // Remove the session from the database based on the provided refresh token
    await Session.findOneAndRemove({ token: cookies.refresh_token });

    // Send a success message to the client
    res.send({ message: "Success! Refresh token cleared." });
  } catch (error) {
    // Pass any encountered errors to the next middleware
    next(error);
  }
};

const refreshUserDetails = async (req, res, next) => {
  /*
   *
   * Sends updated user details on clients request
   *
   */
  try {
    const profile = await Profile.findById(req.user.profileId);

    // Send updated data
    res.status(200).send({
      user: profile.username,
      profileId: profile._id,
      name: profile.name,
      image: profile.image || "",
      email: { data: profile.email, isEmailVerified: profile.isEmailVerified },
      about: profile.about || "",
    });
  } catch (error) {
    // process general error
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  /*
   *
   * Handles reset password request
   *
   */
  try {
    // Get data from body
    const otp = req.body.old;
    const newPassword = req.body.newPassword;
    const confirmPassword = req.body.confirmPassword;

    if (!otp) {
      return res.status(404).send({ message: "No code received!" });
    }

    // Although comes pre-validated, but re-validating at server side is a good practice
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

    // Query DB so that it gets profile with matching hashCode and give expiry date
    const profile = await Profile.findOne({
      forgotPasswordToken: hashedCode,
      forgotPasswordExpiry: { $gt: Date.now() },
    });

    if (!profile) {
      return res
        .status(489)
        .send({ message: "OTP is either incorrect or has expired" });
    }

    // Reset the token - only one-time-use is allowed
    profile.forgotPasswordToken = null;
    profile.forgotPasswordExpiry = null;

    // Set new password - Password is hashed using mongoose method
    profile.password = newPassword;
    await profile.save();

    return res.status(200).send({ message: "Password changed successfully!" });
  } catch (error) {
    // Handle general error
    next(error);
  }
};

const invalidateAllSessions = async (req, res, next) => {
  /*
   *
   * Invalidates all active sessions
   *
   */
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
  invalidateAllSessions,
};
