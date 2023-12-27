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

    const profile = await Profile.findById(req.user.profileId);
    const server = await Server.findById(req.params.serverId);

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
      members: server.members,
    });

    await channel.save();

    if (res.body) {
      res.body = {
        ...res.body,
        server: channel,
      };
    } else {
      res.body = { server: channel };
    }

    res.status(200).send(res.body);
  } catch (err) {
    res.send(err.message);
  }
};

export const getChannel = async (req, res) => {
  try {
    const profile = await Profile.findOne({
      _id: req.user.profileId,
      servers: req.params.serverId,
    });

    if (!profile) {
      return res.status(404).json({ error: "Server not found in profile" });
    }

    const server = await Server.findOne({
      _id: req.params.serverId,
    })
      .populate({
        path: "members",
        select: "_id profileId role",
        options: { limit: 10 },
      })
      .populate({
        path: "channels",
        select: "_id type name",
      });

    if (!server) {
      return res.status(404).send({ message: "Server not found" });
    }

    const doc = await Server.findById({ _id: req.params.serverId });
    const totalMembersCount = doc.members.length; // Use accurate count

    const populatedMembers = server.members.map(async (member) => {
      const profile = await Profile.findById(member.profileId).select(
        "image name email"
      );

      return profile
        ? {
            email: profile.email,
            name: profile.name,
            id: member._id,
            profileId: member.profileId,
            role: member.role,
            image: profile.image || null,
          }
        : null;
    });

    const serverData = {
      name: server.name,
      id: server._id,
      profileId: server.profileId,
      inviteCode: server.inviteCode,
      image: server.image,
      channels: server.channels,
      members: await Promise.all(populatedMembers),
      totalMembersCount,
      myMembership: server.members.find(
        (member) => member.profileId.toHexString() === req.user.profileId
      ),
    };

    const foundChannel = serverData.channels.find(
      (channelObj) => channelObj._id.toHexString() === req.params.channelId
    );

    const channelData = foundChannel
      ? [foundChannel._id, foundChannel]
      : [serverData.channels[0]._id, serverData.channels[0]];

    if (res.body) {
      res.body = { ...res.body, server: serverData, channel: channelData };
    } else {
      res.body = { server: serverData, channel: channelData };
    }

    res.status(200).send(res.body);
  } catch (err) {
    res.status(500).send(err.message);
  }
};
