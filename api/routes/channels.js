import express from "express";
import {
  createChannel,
  getChannel,
} from "../controllers/channelsController.js";

const router = express.Router();

router.post("/create/:serverId", createChannel);
router.get("/:serverId/:channelId", getChannel);

export default router;
