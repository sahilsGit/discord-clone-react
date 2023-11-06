import { Profile, Server } from "../modals/Schema.js";

export const findServers = async (req, res, next) => {
  try {
    const profile = await Profile.findById(req.user.profileId); // Use the id from JWT token

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Find all servers with ids in profile's servers array
    const servers = await Server.find({
      _id: { $in: profile.servers },
    });

    // Map servers to only return necessary fields

    const serverData = servers.map((server) => ({
      name: server.name,
      id: server._id,
      image: server.image,
    }));

    if (res.body) {
      res.body = { ...res.body, servers: serverData };
    } else {
      res.body = { servers: serverData };
    }

    res.status(200).send(res.body);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};
