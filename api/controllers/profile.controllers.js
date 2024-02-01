// import { Profile, Server } from "../modals/Schema.js";

import Profile from "../modals/profile.modals.js";
import fs from "fs";
import {
  emailVerificationMailContent,
  forgotPasswordMailContent,
  sendEmail,
} from "../utils/mail.js";
import crypto from "crypto";

// const about = async (req, res, next) => {
//   try {
//     console.log(req.user);
//     const profile = await Profile.findById(req.user.profileId); // Use the id from JWT token

//     console.log(profile);

//     if (res.body) {
//       res.body = { ...res.body, about: profile.about, email: profile.email };
//     } else {
//       res.body = { about: profile.about, email: profile.email };
//     }

//     res.status(200).send(res.body);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: err.message });
//   }
// };

const searchUser = async (req, res) => {
  console.log("searching");
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

    console.log(user);

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
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateProfile = async (req, res) => {
  let oldImage;

  try {
    const { name, image, username, about } = req.body;

    // Validate if required fields are present
    if (!name && !image && !username && !about) {
      return res.status(400).json({ message: "Can't update nothing" });
    }

    const profile = await Profile.findById(req.user.profileId); // Find the server by ID

    if (!profile) {
      return res.status(404).send("Profile not found");
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

    console.log(oldImage);

    if (oldImage) {
      const imagePath = `./public/images/${oldImage}`;

      console.log("Deleting image at path:", imagePath);

      fs.unlink(imagePath, (unlinkErr) => {
        if (unlinkErr) {
          console.error("Error deleting image:", unlinkErr);
        } else {
          console.log("Image deleted successfully");
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
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};

const sendEmailVerification = async (req, res) => {
  try {
    const profile = await Profile.findById(req.user.profileId);

    if (!profile) {
      res.status(404).send("Profile is already verified");
    }

    // if email is already verified throw an error
    if (profile.isEmailVerified) {
      res.status(409).send("Profile is already verified");
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

    return res.status(200).send("Mail has been sent to your mail ID");
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

const verifyEmail = async (req, res) => {
  try {
    const verificationCode = req.body.code;

    if (!verificationCode) {
      return res.status(404).send("No code received!");
    }

    // generate a hash from the token that we are receiving
    const hashedCode = crypto
      .createHash("sha256")
      .update(verificationCode.toString())
      .digest("hex");

    console.log(verificationCode, hashedCode);

    const profile = await Profile.findOne({
      emailVerificationToken: hashedCode,
      emailVerificationExpiry: { $gt: Date.now() },
    });

    if (!profile) {
      return res.status(489).send("Code is either incorrect or expired");
    }

    // If we found the profile that means the token is valid
    // Now we can remove the associated email token and expiry date as we no  longer need them
    profile.emailVerificationToken = null;
    profile.emailVerificationExpiry = null;

    profile.isEmailVerified = true;
    await profile.save();

    return res.status(200).send("Email is verified");
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

const changePassword = async (req, res) => {
  try {
    const otp = req.body.code;
    const newPassword = req.body.newPassword;

    if (!otp) {
      return res.status(404).send("No code received!");
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
      return res.status(489).send("OTP is either incorrect or has expired");
    }

    profile.forgotPasswordToken = null;
    profile.forgotPasswordExpiry = null;

    profile.password = newPassword;
    await profile.save();

    return res.status(200).send("Password changed successfully!");
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

const forgotPasswordRequest = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(404).send("No email received!");
    }

    // Check if user exists
    const profile = await Profile.findOne({ email });

    if (!profile) {
      return res.status(404).send("No registered matches this email!");
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

    res.status(200).send("OTP has been sent to your registered email.");
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
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
