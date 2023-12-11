import express from "express";
import {
  findConversation,
  getAllConversations,
} from "../controllers/conversationsController.js";

const router = express.Router();

console.log("conver rout");
//Handle requests

router.get("/:memberTwoId/:memberOneId", findConversation);
router.get("/:memberId", getAllConversations);

export default router;
