import express from "express";
import { changeRole } from "../controllers/membersController.js";

const router = express.Router();

router.put("/:serverId/:memberId", changeRole);

export default router;
