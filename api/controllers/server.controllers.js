import Profile from "../modals/profile.modals.js";
import Server from "../modals/server.modals.js";
import Channel from "../modals/channel.modals.js";
import Member from "../modals/member.modals.js";
import fs from "fs";
import mongoose from "mongoose";

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

    // Create the general channel
    const generalChannel = new Channel({
      name: "general",
      type: "TEXT",
      profileId: req.user.profileId,
      serverId: newServer._id,
    });

    await generalChannel.save();

    const member = await Member.find({ profileId: profileId }).select(["_id"]);

    await Channel.findByIdAndUpdate(
      generalChannel._id,
      { $push: { members: member } },
      { new: true }
    );

    if (res.body) {
      res.body = {
        ...res.body,
        server: newServer,
      };
    } else {
      res.body = { server: newServer };
    }
    res.status(200).send(res.body);
  } catch (err) {
    res.status(500).send(err.message);

    next(err);
  }
};

export const getAll = async (req, res, next) => {
  try {
    // TODO : Possiblity for reducing db look for optimisation
    const profileId = req.user.profileId;

    const profile = await Profile.findById(profileId); // Use the id from JWT token

    if (!profile || req.user.username !== req.params.username) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Find all servers with ids in profile's servers array
    const servers = await Server.find({
      _id: { $in: profile.servers },
    });

    const serverData = servers.reduce((accumulator, server) => {
      accumulator[server._id] = {
        name: server.name,
        inviteCode: server.inviteCode,
        id: server._id,
        image: server.image,
        channels: server.channels,
      };
      return accumulator;
    }, {});

    // const serverData = servers.map((server) => ({
    //   name: server.name,
    //   inviteCode: server.inviteCode,
    //   id: server._id,
    //   image: server.image,
    // }));

    if (res.body) {
      res.body = {
        ...res.body,
        servers: serverData,
      };
    } else {
      res.body = { servers: serverData };
    }

    res.status(200).send(res.body);
  } catch (err) {
    // console.error(err);
    res.status(500).send(err.message);
  }
};

export const getOne = async (req, res) => {
  try {
    const profile = await Profile.findOne({
      _id: req.user.profileId,
      servers: req.params.getOne,
    });

    if (!profile) {
      return res.status(404).json({ error: "Server not found in profile" });
    }

    const serverRes = await Server.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(req.params.getOne) },
      },
      {
        $lookup: {
          from: "channels",
          localField: "channels",
          foreignField: "_id",
          as: "channels",
        },
      },
      {
        $lookup: {
          from: "members",
          let: { serverId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$serverId", "$$serverId"],
                },
              },
            },
            { $limit: 2 },
          ],
          as: "members",
        },
      },
      {
        $unwind: "$members",
      },
      {
        $lookup: {
          from: "profiles",
          localField: "members.profileId",
          foreignField: "_id",
          as: "members.profile",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          inviteCode: 1,
          image: 1,
          "channels._id": 1,
          "channels.name": 1,
          "channels.type": 1,
          "channels.conversationId": 1,
          "channels.createdAt": 1,
          "members.role": 1,
          "members._id": 1,
          "members.profile._id": 1,
          "members.profile.email": 1,
          "members.profile.name": 1,
          "members.profile.image": 1,
        },
      },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          inviteCode: { $first: "$inviteCode" },
          image: { $first: "$image" },
          channels: { $first: "$channels" },
          members: {
            $push: {
              _id: "$members._id",
              role: "$members.role",
              profile: { $arrayElemAt: ["$members.profile", 0] },
            },
          },
        },
      },
      {
        $unwind: "$channels",
      },
      {
        $sort: {
          "channels.createdAt": 1,
        },
      },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          inviteCode: { $first: "$inviteCode" },
          image: { $first: "$image" },
          channels: { $push: "$channels" },
          members: { $first: "$members" },
        },
      },
      {
        $lookup: {
          from: "members",
          let: {
            serverId: "$_id",
            profileId: new mongoose.Types.ObjectId(req.user.profileId),
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$serverId", "$$serverId"] },
                    { $eq: ["$profileId", "$$profileId"] },
                  ],
                },
              },
            },
            {
              $project: {
                _id: 1,
                role: 1,
                profileId: 1,
              },
            },
          ],
          as: "myMembership",
        },
      },
      {
        $lookup: {
          from: "profiles",
          let: { profileId: "$myMembership.profileId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", { $arrayElemAt: ["$$profileId", 0] }] },
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                image: 1,
              },
            },
          ],
          as: "profile",
        },
      },
    ]);

    const server = serverRes[0];

    const serverDocument = await Server.findById({ _id: req.params.getOne });
    const totalMembersCount = serverDocument.members.length; // Use accurate count

    const myMembershipProcessed = server.myMembership[0];
    myMembershipProcessed.profile = server.profile[0];

    const serverData = {
      name: server.name,
      id: server._id,
      // profileId: server.profileId,
      inviteCode: server.inviteCode,
      image: server.image,
      channels: server.channels,
      members: server.members,
      totalMembersCount,
      myMembership: myMembershipProcessed,
    };

    if (res.body) {
      res.body = { ...res.body, server: serverData };
    } else {
      res.body = { server: serverData };
    }

    res.status(200).send(res.body);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};

export const updateServerBasics = async (req, res, next) => {
  let oldImage;

  try {
    const { name, image } = req.body;

    // Validate if required fields are present
    if (!name && !image) {
      return res
        .status(400)
        .json({ message: "ServerName or image is required for update." });
    }

    const server = await Server.findById(req.params.serverId); // Find the server by ID

    if (!server) {
      return res.status(404).send(err.message);
    } // Check if the server exists

    if (name) {
      server.name = name;
    } // Set the updated value

    if (image) {
      oldImage = server.image;
      server.image = image;
    } // Update values

    await server.save(); // Save the updated server

    if (oldImage) {
      const imagePath = `./public/images/${oldImage}`;

      console.log("Deleting image at path:", imagePath);

      fs.unlink(imagePath, (unlinkErr) => {
        if (unlinkErr) {
          console.error("Error deleting image:", unlinkErr);
        } else {
          console.log("Image deleted successfully");
        }
      });
    }

    const updatedServerDocument = {
      name: server.name,
      inviteCode: server.inviteCode,
      id: server._id,
      image: server.image,
      channels: server.channels,
    };

    if (res.body) {
      res.body = { ...res.body, server: updatedServerDocument };
    } else {
      res.body = { server: updatedServerDocument };
    }

    res.status(200).send(res.body);
  } catch (err) {
    // console.error(err);
    res.status(500).send(err.message);
  }
};

export const findServer = async (req, res, next) => {
  let exists;
  try {
    const server = await Server.findOne({ inviteCode: req.params.inviteCode });

    if (!server) {
      res.status(401).send({ message: "No server with this invite code" });
    }

    const profile = await Profile.findById(req.user.profileId);

    if (!profile) {
      return res.status(401).send({ message: "Profile not found" });
    }

    const serverExistsInProfile = profile.servers.includes(server._id);

    if (serverExistsInProfile) {
      exists = true;
    } else {
      exists = false;
    }

    if (res.body) {
      res.body = {
        ...res.body,
        exists: exists,
        serverId: server._id,
      };
    } else {
      res.body = { exists: exists, serverId: server._id };
    }
    res.status(200).send(res.body);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const acceptInvite = async (req, res, next) => {
  try {
    const user = await Profile.findById(req.user.profileId); // Find profile with server's profileId argument
    const server = await Server.findById(req.params.serverId);

    if (user) {
      user.servers.push(req.params.serverId); // Push this server's id to profile's "servers" array

      // Create member
      const member = new Member({
        role: "GUEST", // Set the default role here if needed
        profileId: req.user.profileId, // user's id
        serverId: req.params.serverId, // server's id
      });

      await member.save();

      await Channel.updateMany(
        {
          serverId: req.params.serverId,
        },
        {
          $addToSet: {
            members: member._id,
          },
        }
      );

      user.members.push(member._id);
      server.members.push(member._id);

      await user.save(); // save user
      await server.save();

      if (res.body) {
        res.body = { ...res.body, message: "Joined successfully" };
      } else {
        res.body = { message: "Joined successfully" };
      }

      res.status(200).send(res.body);
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
};

const leaveServer = async (req, res, next) => {
  try {
    const { serverId, memberId } = req.params;

    // Find the member document by serverId and memberId
    const member = await Member.findOne({
      _id: memberId,
      serverId: serverId,
      profileId: req.user.profileId,
    });

    if (!member) {
      return res.status(404).send("Member not found");
    }

    const server = await Server.findById(serverId);
    if (!server || server.profileId.equals(req.user.profileId)) {
      return res
        .status(403)
        .json({ message: "Admins cannot leave the server" });
    }

    // Remove member from Profile
    const profileUpdatePromise = Profile.updateOne(
      { _id: member.profileId },
      { $pull: { members: member._id, servers: member.serverId } }
    );

    // Remove member from Server
    const serverUpdatePromise = Server.updateOne(
      { _id: member.serverId },
      { $pull: { members: member._id } }
    );

    // Remove member from Channels
    await Channel.updateMany(
      { _id: { $in: server.channels } },
      { $pull: { members: member._id } }
    );

    // Remove member reference from ServerMessage
    // const messageUpdatePromise = ServerMessage.updateMany(
    //   { memberId: member._id },
    //   { memberId: null }
    // );

    await Promise.all([profileUpdatePromise, serverUpdatePromise]);
    await Member.deleteOne({ _id: member._id });

    if (res.body) {
      res.status(200).send(res.body);
    } else {
      res.status(200).send({ message: "Member removed Successfully" });
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// MEMBERS' SPECIFIC APIs++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

export const getMembers = async (req, res) => {
  const { skip } = req.query;

  try {
    const populatedMembers = await Server.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(req.params.serverId) },
      },
      {
        $lookup: {
          from: "members",
          let: { serverId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$serverId", "$$serverId"],
                },
              },
            },
            { $skip: parseInt(skip) || 0 },
            { $limit: 2 },
          ],
          as: "members",
        },
      },
      {
        $unwind: "$members",
      },
      {
        $lookup: {
          from: "profiles",
          localField: "members.profileId",
          foreignField: "_id",
          as: "members.profile",
        },
      },
      {
        $project: {
          "members.role": 1,
          "members._id": 1,
          "members.profile._id": 1,
          "members.profile.email": 1,
          "members.profile.name": 1,
          "members.profile.image": 1,
        },
      },
      {
        $group: {
          _id: "$_id",
          members: {
            $push: {
              _id: "$members._id",
              role: "$members.role",
              profile: { $arrayElemAt: ["$members.profile", 0] },
            },
          },
        },
      },
    ]);

    console.log(!populatedMembers.length);

    if (!populatedMembers.length) {
      return res.status(201).send("That's it, no more members to fetch!");
    }

    if (res.body) {
      res.body = { ...res.body, members: populatedMembers[0].members };
    } else {
      res.body = { members: populatedMembers[0].members };
    }

    res.status(200).send(res.body);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

export { leaveServer };
