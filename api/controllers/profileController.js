import { Profile } from "../models/Schema.js";

export const findServers = async (req, res, next) => {
  try {
    // Get the profile ID from the request parameters
    const profileId = req.params.id;

    // Query the database to find the profile by _id
    const profile = await Profile.findById(profileId);

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Access the profile's list of servers (assuming it's an array property on the profile document)
    const profileServers = profile.servers;

    res.send({ servers: profileServers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};
