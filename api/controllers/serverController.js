import { Server, Profile, Member, Channel } from "../modals/Schema.js";
import fs from "fs";

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

    const server = await newServer.save();

    // Create the general channel
    const generalChannel = new Channel({
      name: "general",
      type: "TEXT",
      profileId: req.user.profileId,
      serverId: newServer._id,
    });

    await generalChannel.save();

    if (res.body) {
      res.body = {
        ...res.body,
        server: server,
      };
    } else {
      res.body = { server: server };
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

    if (!profile) {
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

export const getOne = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({
      _id: req.user.profileId,
      servers: req.params.getOne,
    });

    if (!profile) {
      return res.status(404).json({ error: "Server not found in profile" });
    }

    const server = await Server.findOne({
      _id: req.params.getOne,
    })
      .populate({
        path: "members",
        select: "_id profileId role",
        match: { profileId: req.user.profileId },
        options: { limit: 1 },
      })
      .populate({
        path: "channels",
        select: "_id type name",
      });

    const doc = await Server.findById({ _id: req.params.getOne });
    const totalMembersCount = doc.members.length;

    if (!server) {
      return res.status(404).send({ message: "Server not found" });
    }

    const sendMemberWithImage = async (member) => {
      const profile = await Profile.findById(member.profileId).select(
        "image name email"
      );

      if (!profile) {
        return null;
      }

      return {
        email: profile.email,
        name: profile.name,
        id: member._id,
        profileId: member.profileId,
        role: member.role,
        image: profile.image ? profile.image : null,
      };
    };

    const populatedMembers = await Promise.all(
      server.members.map(sendMemberWithImage)
    );

    const serverData = {
      name: server.name,
      id: server._id,
      profileId: server.profileId,
      inviteCode: server.inviteCode,
      image: server.image,
      channels: server.channels,
      members: populatedMembers,
      totalMembersCount: totalMembersCount,
    };

    if (res.body) {
      res.body = { ...res.body, server: serverData };
    } else {
      res.body = { server: serverData };
    }

    res.status(200).send(res.body);
  } catch (err) {
    // console.error(err);
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
      fs.unlink(imagePath);
    }

    if (res.body) {
      res.body = { ...res.body };
      res.status(200).send(res.body);
    } else {
      res.status(200).send({ message: "okay..." });
    }
  } catch (err) {
    // console.error(err);
    res.status(500).send(err.message);
  }
};

export const findserver = async (req, res, next) => {
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

// MEMBERS' SPECIFIC APIs++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

export const getMembers = async (req, res) => {
  const { skip } = req.query;

  try {
    const server = await Server.findOne({
      _id: req.params.serverId,
    }).populate({
      path: "members",
      select: "_id profileId role",
      options: {
        limit: 1,
        skip: skip || 0,
      },
    });

    if (!server) {
      res.status(404).send({ message: "Server not found" });
    }

    const sendMemberWithImage = async (member) => {
      const profile = await Profile.findById(member.profileId).select(
        "image name email"
      );

      if (!profile) {
        return null;
      }

      return {
        email: profile.email,
        name: profile.name,
        id: member._id,
        profileId: member.profileId,
        role: member.role,
        image: profile.image ? profile.image : null,
      };
    };

    // Use Promise.all to initiate parallel fetching of member details and images
    const populatedMembers = await Promise.all(
      server.members.map(sendMemberWithImage)
    );

    if (res.body) {
      res.body = { ...res.body, members: populatedMembers };
    } else {
      res.body = { members: populatedMembers };
    }

    res.status(200).send(res.body);
  } catch (err) {
    // console.error(err);
    res.status(500).send("Server Error");
  }
};
