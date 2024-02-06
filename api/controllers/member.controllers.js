import Channel from "../modals/channel.modals.js";
import Profile from "../modals/profile.modals.js";
import Member from "../modals/member.modals.js";
import Server from "../modals/server.modals.js";
import mongoose from "mongoose";

const changeRole = async (req, res, next) => {
  /*
   *
   * Handles the role change logic of any specific member
   *
   */
  try {
    const updatedRole = req.body.role;
    const currentUserRole = req.query.myRole;

    // Check if the current user is "ADMIN" or "MODERATOR"
    if (currentUserRole !== "ADMIN" && currentUserRole !== "MODERATOR") {
      return res.status(400).send({
        message:
          "You are not allowed, only admin or a Moderator can change role!",
      });
    }

    // Check if the server exists
    const server = await Server.findById(req.params.serverId);
    if (!server) {
      return res.status(404).send({ message: "Server not found" });
    }

    // Check if the member exists in the server's members array
    if (!server.members.includes(req.params.memberId)) {
      return res
        .status(404)
        .send({ message: "Member not found in the server" });
    }

    // Update the member's role in the Member collection
    const updatedMember = await Member.findById(req.params.memberId);
    updatedMember.role = updatedRole;

    // Save the member document
    await updatedMember.save();

    // Get the updated details of member's profile, in case it changed
    const profile = await Profile.findById(updatedMember.profileId).select(
      "image name email"
    );

    // Shape the updated member document as the client desires
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

    // Response is customized to fulfill token-related demand,
    // Refer to auth.middlewares.js (71-82) for more information.

    if (res.body) {
      res.body = { ...res.body, member: memberPayloadToSend };
    } else {
      res.body = { member: memberPayloadToSend };
    }

    // Send response
    res.status(200).send(res.body);
  } catch (error) {
    // Handle any left over error
    next(error);
  }
};

const searchMember = async (req, res, next) => {
  /*
   *
   * For Client-side debounced member search functionality
   *
   */

  // Get the term and the number of members already fetched
  const { term, skip } = req.query;

  // limit the members count to 10
  const limit = 10;

  // Create a new Object that the aggregation pipeline recognizes
  const serverId = new mongoose.Types.ObjectId(req.params.serverId);

  // Return if search term doesn't exist, although client takes care of it but for just in case
  if (!term) {
    return res.status(400).send({ message: "Search term is required" });
  }

  // Same as above
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

    // Response is customized to fulfill token-related demand,
    // Refer to auth.middlewares.js (71-82) for more information.

    if (res.body) {
      res.body = { ...res.body, members: result };
    } else {
      res.body = { members: result };
    }

    // Send response
    res.status(200).send(res.body);
  } catch (error) {
    // Handle error that's already not handled
    next(error);
  }
};

const removeMember = async (req, res, next) => {
  /*
   *
   * For kicking member out of the server
   *
   */
  try {
    const member = await Member.findById(req.params.memberId);

    if (!member) {
      return res.status(404).send({ message: "Member not found" });
    }

    if (member.role === "ADMIN") {
      return res
        .status(400)
        .send({ message: "You can't just throw ADMIN out of the server!" });
    }

    if (member.profileId === req.user.profileId) {
      return res
        .status(400)
        .send({ message: "You can't kick yourself out of the server!" });
    }

    const server = await Server.findById(member.serverId);

    // The server in the member document that's fetched above is not same as the server whose id is provided in params
    if (req.params.serverId !== server._id.toHexString()) {
      return res.status(404).send({ message: "Something went wrong" });
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

    await Promise.all([profileUpdatePromise, serverUpdatePromise]);

    // Delete the member document
    await Member.deleteOne({ _id: member._id });

    // Response is customized to fulfill token-related demand,
    // Refer to auth.middlewares.js (71-82) for more information.

    if (res.body) {
      res.body = { ...res.body, message: "Member removed Successfully!" };
    } else {
      res.body = { message: "Member removed Successfully!" };
    }

    // Send response
    res.status(200).send(res.body);
  } catch (error) {
    next(error);
  }
};

export { changeRole, searchMember, removeMember };
