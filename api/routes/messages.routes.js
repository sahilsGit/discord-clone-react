import {
  fetchMessages,
  sendDirectMessage,
  sendServerMessage,
  updateMessage,
} from "../controllers/messages.controllers.js";
import { verifyToken } from "../middlewares/auth.middlewares.js";
import express from "express";

const router = express.Router();
router.use(verifyToken);

router.post("/direct", sendDirectMessage);
router.post("/server", sendServerMessage);
router.get("/fetch", fetchMessages);
router.put("/update/:messageId/:memberId", updateMessage);

export default router;
