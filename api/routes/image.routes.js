import express from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { verifyToken } from "../middlewares/auth.middlewares.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router(); // Instantiating router
router.use(verifyToken);

router.get("/get/:imageName", (req, res) => {
  const imageName = req.params.imageName;
  const imagePath = path.join(__dirname, "../public/images", imageName);

  if (!fs.existsSync(imagePath)) {
    return res.status(404).send("Image not found");
  }

  res.setHeader("Content-Type", "image/jpeg");
  res.sendFile(imagePath);
});

router.post("/upload", upload.single("image"), (req, res) => {
  const newFilename = req.file.filename;
  res.json({ newFilename });
});

export default router;
