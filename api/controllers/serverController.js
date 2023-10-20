import { Server } from "../models/Schema.js";

export const createServer = async (req, res, next) => {
  try {
    const { name, inviteCode, profileId } = req.body;

    // Validations
    if (!name) {
      return res.send({ message: "Server must have a name!" });
    }
    if (!profileId) {
      return res.send({
        message: "The server must be associated with a user",
      });
    }
    if (!profileId) {
      return res.send({
        message: "Please create a valid invite code or use auto generator!",
      });
    }

    const newServer = new Server({
      name,
      inviteCode,
      profileId,
    });

    const server = await newServer.save();

    // Upload image
    upload.single("image")(req, res, (err) => {
      if (err) {
        // handle error
      } else {
        server.imageUrl = req.file.path;
        server.save();
      }
    });

    res.status(200).send("Server has been created!");
  } catch (err) {
    err.status = 500;
    err.message = "Internal server error!";

    next(err);
  }
};
