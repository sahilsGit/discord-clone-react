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

export { about, updateProfile };
