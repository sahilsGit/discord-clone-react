import express from "express";
import {
  changeRole,
  searchMember,
  removeMember,
} from "../controllers/member.controllers.js";
import { verifyToken } from "../middlewares/auth.middlewares.js";

const router = express.Router();
router.use(verifyToken);

router.get("/:serverId/search", searchMember);
router.put("/:serverId/:memberId", changeRole);
router.delete("/:serverId/:memberId/remove", removeMember);

export default router;
