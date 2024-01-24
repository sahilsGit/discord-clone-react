import {
  fetchMessages,
  sendDirectMessage,
  sendServerMessage,
  updateDirectMessage,
  updateMessage,
} from "../controllers/messages.controllers.js";
import { verifyToken } from "../middlewares/auth.middlewares.js";
import express from "express";

const router = express.Router();
router.use(verifyToken);

router.post("/direct", sendDirectMessage);
router.post("/server", sendServerMessage);
router.get("/fetch", fetchMessages);
router.put("/update/server/:messageId/:memberId", updateMessage);
router.put("/update/direct/:messageId/:profileId", updateDirectMessage);

export default router;
