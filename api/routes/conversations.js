import express from "express";
import {
  findConversation,
  getAllConversations,
} from "../controllers/conversationsController.js";

const router = express.Router();

//Handle requests
router.get("/:profileTwoId/:profileOneId", findConversation);
router.get("/:profileId", getAllConversations);
// router.get("/:conversationId", findConversationById);

export default router;
