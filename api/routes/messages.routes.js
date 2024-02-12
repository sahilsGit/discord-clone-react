import {
  deleteDirectMessage,
  deleteMessage,
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

console.log("here");

router.post("/direct", sendDirectMessage);
router.post("/server", sendServerMessage);
router.get("/fetch", fetchMessages);
router.put("/server/update/:messageId/:memberId", updateMessage);
router.delete("/server/delete/:messageId/:memberId", deleteMessage);
router.put("/direct/update/:messageId/:profileId", updateDirectMessage);
router.delete("/direct/delete/:messageId/:profileId", deleteDirectMessage);

export default router;
