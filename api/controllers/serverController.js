import { Server } from "../modals/Schema.js";

export const createServer = async (req, res, next) => {
  try {
    const { name, inviteCode, username, image } = req.body;

    // Validations
    if (!name) {
      return res.send({ message: "Server must have a name!" });
    }
    if (!username) {
      return res.send({
        message: "The server must be associated with a user!",
      });
    }
    if (!image) {
      return res.send({
        message: "The server must have an image!",
      });
    }
    if (!inviteCode) {
      return res.send({
        message: "An invite code must be provided!",
      });
    }

    const profileId = req.user.profileId;

    if (req.user.username != username) {
      res.status(401).send("Token does not match the given user");
    }

    const newServer = new Server({
      name,
      inviteCode,
      profileId,
      image,
    });

    await newServer.save();

    if (res.body) {
      res.status(200).send(res.body);
    } else {
      res.status(200).send("Server has been created!");
    }
  } catch (err) {
    err.status = 500;
    err.message = "Internal server error!";

    next(err);
  }
};
