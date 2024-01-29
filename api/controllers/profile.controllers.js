// import { Profile, Server } from "../modals/Schema.js";

import Profile from "../modals/profile.modals.js";
import fs from "fs";

const about = async (req, res, next) => {
  try {
    console.log(req.user);
    const profile = await Profile.findById(req.user.profileId); // Use the id from JWT token

    console.log(profile);

    if (res.body) {
      res.body = { ...res.body, about: profile.about, email: profile.email };
    } else {
      res.body = { about: profile.about, email: profile.email };
    }

    res.status(200).send(res.body);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

const searchUser = async (req, res) => {
  console.log("searching");
  try {
    // Get the search query from the request query parameters
    const searchQuery = req.query.searchQuery;

    // Check if the search query is present
    if (!searchQuery) {
      return res.status(400).json({ error: "Search query is required." });
    }

    // Use a case-insensitive regular expression to perform a partial match on the username and name fields
    const searchRegex = new RegExp(searchQuery);

    // Use the Mongoose 'find' method to search for users
    const user = await Profile.find({
      username: { $regex: searchRegex },
    });

    console.log(user);

    if (!user || !user?.length) {
      return res.status(200).send({ message: "No user found!" });
    }
    const userData = {
      name: user[0].name,
      username: user[0].username,
      image: user[0].image || "",
      id: user[0]._id,
    };

    if (res.body) {
      res.body = {
        ...res.body,
        userData: userData,
      };
    } else {
      res.body = {
        userData: userData,
      };
    }

    res.status(200).send(res.body);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateProfile = async (req, res) => {
  let oldImage;

  try {
    const { name, image, username, about } = req.body;

    // Validate if required fields are present
    if (!name && !image && !username && !about) {
      return res.status(400).json({ message: "Can't update nothing" });
    }

    const profile = await Profile.findById(req.user.profileId); // Find the server by ID

    if (!profile) {
      return res.status(404).send("Profile not found");
    } // Check if the server exists

    if (name) {
      profile.name = name;
    } // Set the updated value

    if (username) {
      profile.username = username;
    } // Set the updated value

    if (about) {
      profile.about = about;
    } // Set the updated value

    if (image) {
      oldImage = profile.image;
      profile.image = image;
    } // Update values

    await profile.save(); // Save the updated server

    console.log(oldImage);

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

    const updatedData = {
      user: profile.username,
      profileId: profile._id,
      name: profile.name,
      image: profile.image,
      about: profile.about,
    };

    if (res.body) {
      res.body = { ...res.body, updatedData: updatedData };
    } else {
      res.body = { updatedData: updatedData };
    }
    res.status(200).send(res.body);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};

export { about, updateProfile, searchUser };
