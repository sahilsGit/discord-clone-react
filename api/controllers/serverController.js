import { Server, Profile } from "../modals/Schema.js";
import fs from "fs/promises";

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

    if (res.body) {
      res.status(200).send(res.body);
    } else {
      res.status(200).send("Server has been created!");
    }
  } catch (err) {
    res.status(500).send(err.message);

    next(err);
  }
};

export const findServers = async (req, res, next) => {
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
    })
      .populate({
        path: "members",
        select: "_id profileId role",
        options: { limit: 1 },
      })
      .populate({
        path: "channels",
        select: "_id type ",
        options: { limit: 1 },
      });

    // Map servers to only return necessary fields

    const serverData = servers.map((server, index) => ({
      name: server.name,
      inviteCode: server.inviteCode,
      id: server._id,
      image: server.image,
      channels: index === 0 ? server.channels : undefined, // Additional data for 1st server
      members: index === 0 ? server.members : undefined,
    }));

    if (res.body) {
      res.body = {
        ...res.body,
        servers: serverData,
        profileId: profileId,
      };
    } else {
      res.body = { servers: serverData, profileId: profileId };
    }

    res.status(200).send(res.body);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};

export const getServer = async (req, res, next) => {
  try {
    // const profile = await Profile.findById(req.user.profileId); // Use the id from JWT token

    // if (!profile) {
    //   return res.status(404).json({ message: "Profile not found" });
    // }

    // // Find all servers with ids in profile's servers array
    // const server = await Server.findOne({
    //   _id: req.params.server,
    // });

    const profileId = req.user.profileId;

    const server = await Server.findOne({
      _id: req.params.server,
      profileId,
    })
      .populate({
        path: "members",
        select: "_id profileId role",
      })
      .populate({
        path: "channels",
        select: "_id type ",
      });

    console.log("Here's server", server);

    if (!server) {
      res.status(404).send({ message: "Server not found" });
    }

    const serverData = {
      name: server.name,
      id: server._id,
      inviteCode: server.inviteCode,
      image: server.image,
      channels: server.channels,
      members: server.members,
    };

    if (res.body) {
      res.body = { ...res.body, server: serverData, profileId: profileId };
    } else {
      res.body = { server: serverData, profileId: profileId };
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

    const updatedServer = await server.save(); // Save the updated server

    console.log(process.cwd());
    if (oldImage) {
      const imagePath = `./public/images/${oldImage}`;
      await fs.unlink(imagePath);
    }

    res.status(200).json({
      message: "Server details updated successfully.",
      server: updatedServer,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};
