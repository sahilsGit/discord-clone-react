import { Server } from "../models/Schema.js";

export const createServer = async (req, res, next) => {
  try {
    const { name, inviteCode, profileId, imageUrl } = req.body;

    // Validations
    if (!name) {
      return res.send({ message: "Server must have a name!" });
    }
    if (!profileId) {
      return res.send({
        message: "The server must be associated with a user!",
      });
    }
    if (!imageUrl) {
      return res.send({
        message: "The server must have an image!",
      });
    }
    if (!inviteCode) {
      return res.send({
        message: "An invite code must be provided!",
      });
    }

    const newServer = new Server({
      name,
      inviteCode,
      profileId,
      imageUrl,
    });

    await newServer.save();

    res.status(200).send("Server has been created!");
  } catch (err) {
    err.status = 500;
    err.message = "Internal server error!";

    next(err);
  }
};
