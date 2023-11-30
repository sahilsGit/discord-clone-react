import express from "express";
import { createChannel } from "../controllers/channelsController.js";

const router = express.Router();

router.post("/create/:serverId", createChannel);

export default router;
