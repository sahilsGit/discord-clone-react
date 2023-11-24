import express from "express";
import { changeRole, searchMember } from "../controllers/membersController.js";

const router = express.Router();

router.put("/:serverId/:memberId", changeRole);
router.get("/:serverId/search", searchMember);

export default router;
