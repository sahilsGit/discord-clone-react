import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getImage = async (req, res) => {
  const imageName = req.params.imageName;
  const imagePath = path.join(__dirname, "../public/images", imageName);

  if (!fs.existsSync(imagePath)) {
    return res.status(404).send("Image not found");
  }

  res.setHeader("Content-Type", "image/jpeg");
  res.sendFile(imagePath);
};

const getFile = async (req, res) => {
  const imageName = req.params.imageName;
  const imagePath = path.join(__dirname, "../public/images", imageName);

  if (!fs.existsSync(imagePath)) {
    return res.status(404).send("Image not found");
  }

  res.setHeader("Content-Type", "image/jpeg");
  res.sendFile(imagePath);
};

const uploadFile = async (req, res) => {
  const newFilename = req.file.filename;
  res.json({ newFilename });
};

export { getImage, getFile, uploadFile };
