import express from "express";
import {
  getAllConversations,
  getOrCreateConversation,
} from "../controllers/conversation.controllers.js";
import { verifyToken } from "../middlewares/auth.middlewares.js";

const router = express.Router();

//Handle requests
router.get(
  "/:profileTwoId/:profileOneId",
  verifyToken,
  getOrCreateConversation
);
router.get("/:profileId", verifyToken, getAllConversations);
// router.get("/:conversationId", findConversationById);

export default router;
