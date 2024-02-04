import Channel from "../modals/channel.modals.js";
import Profile from "../modals/profile.modals.js";
import Member from "../modals/member.modals.js";
import Server from "../modals/server.modals.js";

const createChannel = async (req, res, next) => {
  /*
   *
   * Handles channel creation logic
   *
   */
  try {
    // Get name and type of channel
    const { name, type } = req.body;

    // Validate
    if (!name || !type) {
      return res.send({
        message: "Server must have a name and a type!",
      });
    }

    const profile = await Profile.findById(req.user.profileId);
    const server = await Server.findById(req.params.serverId);

    if (!profile) {
      res.status(401).send({ message: "No user found!" });
    }

    if (!server) {
      res.status(401).send({ message: "Server Id missing!" });
    }

    // General channel is default the channel that's created on server creation
    if (name.toLowerCase() === "general") {
      res.status(400).send({ message: "Name cannot be 'general'" });
    }

    // Check if the user is an ADMIN or MODERATOR
    const member = await Member.findOne({
      profileId: req.user.profileId,
      serverId: req.params.serverId,
    });

    if (!member || (member.role !== "ADMIN" && member.role !== "MODERATOR")) {
      return res
        .status(403)
        .send({ message: "You do not have permission to create channels" });
    }

    // Create the channel
    const channel = new Channel({
      name,
      type,
      profileId: req.user.profileId,
      serverId: req.params.serverId,
      members: server.members,
    });

    await channel.save();

    // Response is customized to fulfill token-related demand,
    // Refer to auth.middlewares.js (71-82) for more information.

    if (res.body) {
      res.body = {
        ...res.body,
        server: channel,
      };
    } else {
      res.body = { server: channel };
    }

    // Send body
    res.status(200).send(res.body);
  } catch (error) {
    next(error);
  }
};

const getChannel = async (req, res, next) => {
  /*
   *
   * Name is self explanatory, returns basic channel details after proper validation
   *
   */
  try {
    let channel;
    let profile;

    // To check if the profile is part of the server whose channel info is being requested
    [profile, channel] = await Promise.all([
      Profile.findOne({
        _id: req.user.profileId,
        servers: { $in: [req.params.serverId] },
      }),
      Channel.findOne({ _id: req.params.channelId }).select([
        "_id",
        "name",
        "type",
        "conversationId",
        "serverId",
      ]),
    ]);

    if (!profile) {
      return res.status(404).send({
        message:
          "Server not found, either it doesn't exist or you are not a member",
      });
    }

    // If the requested channel doesn't exist then return the first channel that the server has

    if (!channel) {
      channel = await Channel.findOne({ serverId: req.params.serverId }).sort({
        createdAt: 1,
      });
    }

    // Structure data for transport
    const channelData = {
      _id: channel._id,
      name: channel.name,
      type: channel.type,
      conversationId: channel.conversationId,
      serverId: channel.serverId,
    };

    // Response is customized to fulfill token-related demand,
    // Refer to auth.middlewares.js (71-82) for more information.

    if (res.body) {
      res.body = {
        ...res.body,
        channel: channelData,
      };
    } else {
      res.body = {
        channel: channelData,
      };
    }

    // Send response
    res.status(200).send(res.body);
  } catch (error) {
    // Handle general error
    next(error);
  }
};

export { createChannel, getChannel };
