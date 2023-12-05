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

export const getChannel = async (req, res, next) => {
  console.log("inside get channel");

  try {
    const profile = await Profile.findById(req.user.profileId);

    console.log(profile);

    if (!profile) {
      return res.status(403).send("Profile not found");
    }

    // const hasChannel = profile.channels.includes(req.params.channelId);
    const hasServer = profile.servers.includes(req.params.serverId);

    if (!hasServer) {
      return res
        .status(404)
        .json({ error: "User is not a member of this server" });
    }

    const channel = await Channel.findById(req.params.channelId);

    if (!channel) {
      return res
        .status(404)
        .json({ error: "Channel not found, does it even exists" });
    }

    if (res.body) {
      res.body = {
        ...res.body,
        channel: [
          channel._id,
          { _id: channel._id, name: channel.name, type: channel.type },
        ],
      };
    } else {
      res.body = {
        channel: [
          channel._id,
          { _id: channel._id, name: channel.name, type: channel.type },
        ],
      };
    }

    res.status(200).send(res.body);
  } catch (err) {
    res.status(500).send(err.message);
  }
};
