import Profile from "../modals/profile.modals.js";
import fs from "fs";
import {
  emailVerificationMailContent,
  forgotPasswordMailContent,
  sendEmail,
} from "../utils/mail.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";

const searchUser = async (req, res, next) => {
  try {
    // Get the search query from the request query parameters
    const searchQuery = req.query.searchQuery;

    // Check if the search query is present
    if (!searchQuery) {
      return res.status(400).json({ error: "Search query is required." });
    }

    // Use a case-insensitive regular expression to perform a partial match on the username and name fields
    const searchRegex = new RegExp(searchQuery);

    // Use the Mongoose 'find' method to search for users
    const user = await Profile.find({
      username: { $regex: searchRegex },
    });

    if (!user || !user?.length) {
      return res.status(200).send({ message: "No user found!" });
    }
    const userData = {
      name: user[0].name,
      username: user[0].username,
      image: user[0].image || "",
      id: user[0]._id,
    };

    if (res.body) {
      res.body = {
        ...res.body,
        userData: userData,
      };
    } else {
      res.body = {
        userData: userData,
      };
    }

    res.status(200).send(res.body);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  let oldImage;

  try {
    const { name, image, username, about } = req.body;

    // Validate if required fields are present
    if (!name && !image && !username && !about) {
      return res.status(400).json({ message: "Can't update nothing" });
    }

    const profile = await Profile.findById(req.user.profileId); // Find the server by ID

    if (!profile) {
      return res.status(404).send({ message: "Profile not found" });
    } // Check if the server exists

    if (name) {
      profile.name = name;
    } // Set the updated value

    if (username) {
      profile.username = username;
    } // Set the updated value

    if (about) {
      profile.about = about;
    } // Set the updated value

    if (image) {
      oldImage = profile.image;
      profile.image = image;
    } // Update values

    await profile.save(); // Save the updated server

    if (oldImage) {
      const imagePath = `./public/images/${oldImage}`;

      fs.unlink(imagePath, (unlinkErr) => {
        if (unlinkErr) {
          // Ingulf the error
        }
      });
    }

    const updatedData = {
      user: profile.username,
      profileId: profile._id,
      name: profile.name,
      image: profile.image,
      about: profile.about,
    };

    if (res.body) {
      res.body = { ...res.body, updatedData: updatedData };
    } else {
      res.body = { updatedData: updatedData };
    }
    res.status(200).send(res.body);
  } catch (error) {
    next(error);
  }
};

const sendEmailVerification = async (req, res, next) => {
  try {
    const profile = await Profile.findById(req.user.profileId);

    if (!profile) {
      res.status(404).send({ message: "Profile is already verified" });
    }

    // if email is already verified throw an error
    if (profile.isEmailVerified) {
      res.status(409).send({ message: "Profile is already verified!" });
    }

    const { unHashedCode, hashedCode, tokenExpiry } =
      profile.generateVerificationCode();

    profile.emailVerificationToken = hashedCode;
    profile.emailVerificationExpiry = tokenExpiry;
    await profile.save();

    await sendEmail({
      email: profile?.email,
      subject: "Please verify your email",
      content: emailVerificationMailContent(profile.username, unHashedCode),
    });

    return res
      .status(200)
      .send({ message: "Mail has been sent to your mail ID" });
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const verificationCode = req.body.code;

    if (!verificationCode) {
      return res.status(400).send({ message: "No code received!" });
    }

    // generate a hash from the token that we are receiving
    const hashedCode = crypto
      .createHash("sha256")
      .update(verificationCode.toString())
      .digest("hex");

    const profile = await Profile.findOne({
      emailVerificationToken: hashedCode,
      emailVerificationExpiry: { $gt: Date.now() },
    });

    if (!profile) {
      return res
        .status(489)
        .send({ message: "Code is either incorrect or has expired" });
    }

    // If we found the profile that means the token is valid
    // Now we can remove the associated email token and expiry date as we no  longer need them

    profile.emailVerificationToken = null;
    profile.emailVerificationExpiry = null;

    profile.isEmailVerified = true;
    await profile.save();

    return res.status(200).send({ message: "Email verified successfully!" });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const oldPassword = req.body.old;
    const newPassword = req.body.newPassword;
    const confirmPassword = req.body.confirmPassword;

    if (!oldPassword) {
      return res.status(404).send({ message: "Old password not received" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).send({
        message: "New password and confirm Password field don't match",
      });
    }

    const profile = await Profile.findById(req.user.profileId);

    const isPasswordCorrect = await bcrypt.compare(
      oldPassword,
      profile.password
    ); // Compare the password with its hashed version

    if (!isPasswordCorrect) {
      return res.status(404).send({
        message: "Incorrect Email or password.",
      });
    }

    profile.password = newPassword;
    await profile.save();

    return res.status(200).send({ message: "Password changed successfully!" });
  } catch (error) {
    next(error);
  }
};

const forgotPasswordRequest = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(404).send({ message: "No email received!" });
    }

    // Check if user exists
    const profile = await Profile.findOne({ email });

    if (!profile) {
      return res
        .status(404)
        .send({ message: "No registered matches this email!" });
    }

    if (!profile.isEmailVerified) {
      return res.status(404).send({
        message:
          "Only users with verified emails are allowed to reset their password. If you have forgotten your password and your email wasn't verified, kindly reach out to our support center.",
      });
    }

    const { unHashedCode, hashedCode, tokenExpiry } =
      profile.generateVerificationCode();

    // save the hashed version a of the token and expiry in the DB
    profile.forgotPasswordToken = hashedCode;
    profile.forgotPasswordExpiry = tokenExpiry;
    await profile.save();

    // Send mail with the password reset link. It should be the link of the frontend url with token
    await sendEmail({
      email: profile?.email,
      subject: "Here's your OTP to change your password",
      content: forgotPasswordMailContent(profile.username, unHashedCode),
    });

    res
      .status(200)
      .send({ message: "OTP has been sent to your registered email." });
  } catch (error) {
    next(error);
  }
};

export {
  updateProfile,
  searchUser,
  sendEmailVerification,
  verifyEmail,
  forgotPasswordRequest,
  changePassword,
};
