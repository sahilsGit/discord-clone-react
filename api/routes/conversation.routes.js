import express from "express";
import {
  getAllConversations,
  getOrCreateConversation,
  getServerConversation,
} from "../controllers/conversation.controllers.js";
import { verifyToken } from "../middlewares/auth.middlewares.js";

const router = express.Router();

router.use(verifyToken);

//Handle requests
router.get("/:profileTwoId/:profileOneId", getOrCreateConversation);
router.get("/:profileId", getAllConversations);
router.get("/:memberId:channelId/", getServerConversation);
// router.get("/:conversationId", findConversationById);

export default router;
