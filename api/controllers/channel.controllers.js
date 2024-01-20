import Channel from "../modals/channel.modals.js";
import Profile from "../modals/profile.modals.js";
import Member from "../modals/member.modals.js";
import Server from "../modals/server.modals.js";

export const createChannel = async (req, res, next) => {
  try {
    const { name, type } = req.body;

    if (!name || !type) {
      return res.send({
        message: "Server must have a name and a type!",
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
    let channel;
    let profile;

    [profile, channel] = await Promise.all([
      Profile.findOne({
        _id: req.user.profileId,
        servers: { $in: [req.params.serverId] },
      }),
      Channel.findOne({ _id: req.params.channelId }),

      // .populate({
      //   path: "conversationId",
      //   populate: {
      //     path: "messages",
      //     options: { sort: { createdAt: -1 }, limit: 10 }, // Sort by createdAt in descending order and limit to 10 messages
      //   },
      // }),
    ]);

    if (!profile) {
      console.error(
        "Server not found, either it doesn't exist or you are not a member"
      );
      return res.status(404).json({
        error:
          "Server not found, either it doesn't exist or you are not a member",
      });
    }

    if (!channel) {
      channel = await Channel.findOne({ serverId: req.params.serverId }).sort({
        createdAt: 1,
      });
    }

    const channelToSend = {
      _id: channel._id,
      name: channel.name,
      type: channel.type,
      conversationId: channel.conversationId._id,
      // messages: channel.conversationId.messages,
    };

    if (res.body) {
      res.body = {
        ...res.body,
        channel: channelToSend,
      };
    } else {
      res.body = { channel: channelToSend };
    }

    res.status(200).send(res.body);
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
};

// {
//   $project: {
//     _id: {
//       $concat: ["Type: ", { $type: "$_id" }],
//     },
//     profileId: {
//       $concat: ["Type: ", { $type: "$$profileId" }],
//     },
//   },
// },
