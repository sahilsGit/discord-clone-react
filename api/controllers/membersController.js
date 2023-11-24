import { Member, Profile, Server } from "../modals/Schema.js";
import mongoose, { ObjectId } from "mongoose";

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
      email: profile.email,
      name: profile.name,
      id: updatedMember._id,
      profileId: updatedMember.profileId,
      role: updatedMember.role,
      image: profile.image ? profile.image : null,
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
  const limit = 2;
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
          email: "$profile.email",
          name: "$profile.name",
          id: "$_id",
          image: { $ifNull: ["$profile.image", null] },
          profileId: "$profile._id",
          role: 1,
        },
      },
      {
        $skip: parseInt(skip, 10),
      },
      {
        $limit: limit, // Limit the result to a certain number of documents
      },
    ]);

    console.log("searched member", result);

    if (res.body) {
      res.body = { ...res.body, members: result };
    } else {
      res.body = { members: result };
    }
    res.status(200).send(res.body);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send(err.message);
  }
};
