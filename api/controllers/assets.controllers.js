import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// General endpoint for getting images
const getImage = async (req, res, next) => {
  try {
    const imageName = req.params.imageName;
    const imagePath = path.join(__dirname, "../public/images", imageName);

    if (!fs.existsSync(imagePath)) {
      return res.status(404).send("Image not found");
    }

    res.setHeader("Content-Type", "image/jpeg");
    res.sendFile(imagePath);
  } catch (error) {
    next(error);
  }
};

// General endpoint for getting files
const getFile = async (req, res, next) => {
  try {
    const imageName = req.params.imageName;
    const imagePath = path.join(__dirname, "../public/images", imageName);

    if (!fs.existsSync(imagePath)) {
      return res.status(404).send("Image not found");
    }

    res.setHeader("Content-Type", "image/jpeg");
    res.sendFile(imagePath);
  } catch (error) {
    next(error);
  }
};

// General endpoint for uploading files
const uploadFile = async (req, res, next) => {
  try {
    const newFilename = req.file.filename;
    res.json({ newFilename });
  } catch (error) {
    next(error);
  }
};

export { getImage, getFile, uploadFile };
