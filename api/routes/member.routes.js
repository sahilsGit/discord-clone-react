import express from "express";
import {
  changeRole,
  searchMember,
  removeMember,
} from "../controllers/member.controllers.js";
import { verifyToken } from "../middlewares/auth.middlewares.js";

const router = express.Router();

router.get("/:serverId/search", verifyToken, searchMember);
router.put("/:serverId/:memberId", verifyToken, changeRole);
router.delete("/:serverId/:memberId/remove", verifyToken, removeMember);

export default router;
