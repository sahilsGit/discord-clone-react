import Channel from "../modals/channel.modals.js";
import Profile from "../modals/profile.modals.js";
import Member from "../modals/member.modals.js";
import Server from "../modals/server.modals.js";
import mongoose from "mongoose";

export const changeRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    // Check if the server exists
    const server = await Server.findById(req.params.serverId);
    if (!server) {
      return res.status(404).json({ error: "Server not found" });
    }

    // Check if the member exists in the server's members array
    if (!server.members.includes(req.params.memberId)) {
      return res.status(404).json({ error: "Member not found in the server" });
    }

    // Update the member's role in the Member collection
    const updatedMember = await Member.findById(
      req.params.memberId
      // This option returns the updated document
    );

    updatedMember.role = role;
    await updatedMember.save();

    const profile = await Profile.findById(updatedMember.profileId).select(
      "image name email"
    );

    const memberPayloadToSend = {
      _id: updatedMember._id,
      role: updatedMember.role,
      profile: {
        _id: updatedMember.profileId,
        name: profile.name,
        image: profile.image ? profile.image : null,
        email: profile.email,
      },
    };

    if (res.body) {
      res.body = { ...res.body, member: memberPayloadToSend };
    } else {
      res.body = { member: memberPayloadToSend };
    }

    res.status(200).send(res.body);
  } catch (err) {
    res.send(err.message);
  }
};

export const searchMember = async (req, res, next) => {
  const { term, skip } = req.query;
  const limit = 1;
  const serverId = new mongoose.Types.ObjectId(req.params.serverId);

  if (!term) {
    return res.status(400).send({ message: "Search term is required" });
  }

  if (term.length < 3) {
    return res
      .status(400)
      .send({ message: "Search term must be at least 3 characters" });
  }

  try {
    // Use aggregation pipeline to retrieve relevant data
    const result = await Member.aggregate([
      {
        $match: {
          serverId: serverId,
        },
      },
      {
        $lookup: {
          from: "profiles",
          localField: "profileId",
          foreignField: "_id",
          as: "profile",
        },
      },
      {
        $unwind: "$profile",
      },
      {
        $match: {
          "profile.name": { $regex: term, $options: "i" }, // Case-insensitive regex matching for the name
        },
      },
      {
        $project: {
          _id: 1,
          role: 1,
          "profile.email": "$profile.email",
          "profile.name": "$profile.name",
          "profile._id": "$profile._id",
          "profile.image": { $ifNull: ["$profile.image", null] },
        },
      },
      {
        $skip: parseInt(skip, 10),
      },
      {
        $limit: limit, // Limit the result to a certain number of documents
      },
    ]);

    console.log(result);

    if (res.body) {
      res.body = { ...res.body, members: result };
    } else {
      res.body = { members: result };
    }
    res.status(200).send(res.body);
  } catch (err) {
    // console.error(err.message);
    return res.status(500).send(err.message);
  }
};

export const removeMember = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.memberId);

    if (!member) {
      return res.status(404).send("Member not found");
    }

    const server = await Server.findById(member.serverId);

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
    res.send(err.message);
  }
};
