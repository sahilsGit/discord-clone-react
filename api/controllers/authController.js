import { Profile } from "../models/Schema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res, next) => {
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

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const newProfile = new Profile({
      username,
      name,
      email,
      password: hash,
    });

    // Checking if optional data given
    if (req.body.imageUrl) {
      newProfile.imageUrl = req.body.imageUrl;
    }

    await newProfile.save();
    res.status(200).send("Profile has been created");
  } catch (err) {
    err.status = 500;
    err.message = "Internal server error!";

    next(err);
  }
};

export const login = async (req, res, next) => {
  /*
  Handles user login
  */

  try {
    // Validation
    const email = req.body.email;
    const recievedPassword = req.body.password;

    if (!email || !recievedPassword) {
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
      recievedPassword,
      userProfile.password
    ); // Compare the password with its hashed version

    if (!isPasswordCorrect) {
      return res.status(401).send({
        success: false,
        message: "Incorrect email or password",
      });
    }

    // Create a session equivalent JWT token
    const token = jwt.sign(
      {
        id: userProfile._id,
        username: userProfile.username,
      },
      process.env.JWT,
      {
        expiresIn: "5h", // Token expiration time
      }
    ); // Authorize user using the secret key

    res.cookie("login_token", token, {
      httpOnly: true,
      path: "/",
      sameSite: "Lax",
    });

    res.status(200).send({
      profileId: userProfile._id,
    });
  } catch (err) {
    err.status = 500;
    err.message = "Internal server error!";

    next(err);
  }
};
