import express from "express";
import {
  changeRole,
  searchMember,
  removeMember,
} from "../controllers/membersController.js";

const router = express.Router();

router.get("/:serverId/search", searchMember);
router.put("/:serverId/:memberId", changeRole);
router.delete("/:serverId/:memberId/remove", removeMember);

export default router;
