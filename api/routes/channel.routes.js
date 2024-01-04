import express from "express";
import {
  createChannel,
  getChannel,
} from "../controllers/channel.controllers.js";
import { verifyToken } from "../middlewares/auth.middlewares.js";

const router = express.Router();

router.post("/create/:serverId", verifyToken, createChannel);
router.get("/:serverId/:channelId", verifyToken, getChannel);

export default router;
