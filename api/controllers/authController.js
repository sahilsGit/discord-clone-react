import { Profile, Session } from "../modals/Schema.js";
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
    if (req.body.image) {
      newProfile.image = req.body.image;
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

    console.log(userProfile.name, userProfile.image);

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
      image: userProfile.image,
    });
  } catch (err) {
    err.status = 500;
    err.message = "Internal server error!";

    next(err);
  }
};
