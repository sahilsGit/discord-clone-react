import express from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyToken } from "../middlewares/auth.middlewares.js";
import {
  getFile,
  getImage,
  uploadFile,
} from "../controllers/assets.controllers.js";

const router = express.Router(); // Instantiating router
router.use(verifyToken);

router
  .get("/getImage/:imageName", getImage)
  .get("/getFile/:fileName", getFile)
  .post("/uploadImage", upload.single("image"), uploadFile)
  .post("/uploadFile", upload.single("image"), uploadFile);

export default router;
