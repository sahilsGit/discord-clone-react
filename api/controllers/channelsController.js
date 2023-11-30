import { Channel, Member, Profile, Server } from "../modals/Schema.js";

export const createChannel = async (req, res, next) => {
  try {
    const { name, type } = req.body;
    // Validations
    if (!name) {
      return res.send({
        message: "Server must have a name!",
      });
    }
    if (!type) {
      return res.send({
        message: "Channel type must be provided",
      });
    }

    const profile = Profile.findById(req.user.profileId);
    const server = Server.findById(req.params.serverId);

    if (!profile) {
      res.status(401).send("No user found");
    }

    if (!server) {
      res.status(401).send("Server Id missing");
    }

    if (name.toLowerCase() === "general") {
      res.status(400).send("Name cannot be 'general'");
    }

    // Check if the user is an ADMIN or MODERATOR
    const member = await Member.findOne({
      profileId: req.user.profileId,
      serverId: req.params.serverId,
    });

    if (!member || (member.role !== "ADMIN" && member.role !== "MODERATOR")) {
      return res
        .status(403)
        .send("You do not have permission to create channels");
    }

    // Create the channel
    const channel = new Channel({
      name,
      type,
      profileId: req.user.profileId,
      serverId: req.params.serverId,
    });

    await channel.save();

    if (res.body) {
      res.body = {
        ...res.body,
        server: server,
      };
    } else {
      res.body = { server: server };
    }
  } catch (err) {
    res.send(err.message);
  }
};
