import express from "express";
import {
  createChannel,
  getChannel,
} from "../controllers/channel.controllers.js";
import { verifyToken } from "../middlewares/auth.middlewares.js";

const router = express.Router();

router.use(verifyToken);

router.post("/create/:serverId", createChannel);
router.get("/:serverId/:channelId", getChannel);

export default router;
