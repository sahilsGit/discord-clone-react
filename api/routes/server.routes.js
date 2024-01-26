import express from "express";
import {
  createServer,
  getAll,
  getOne,
  updateServerBasics,
  getMembers,
  findServer,
  acceptInvite,
  leaveServer,
} from "../controllers/server.controllers.js";
import { verifyToken } from "../middlewares/auth.middlewares.js";

const router = express.Router();
router.use(verifyToken);

/* GET users listing. */
router.get("/:username/getAll", getAll);
router.post("/:serverId/acceptInvite", acceptInvite);
router.post("/create", createServer);
router.get("/:username/:getOne", getOne);
router.get("/:username/find/:inviteCode", findServer);
router.put("/:serverId/update/basics", updateServerBasics);
router.get("/:username/:serverId/members", getMembers);
router.delete("/:serverId/:memberId/leave", leaveServer);

export default router;
