import express from "express";
import {
  createServer,
  getAll,
  getOne,
  updateServerBasics,
  getMembers,
  findServer,
  acceptInvite,
} from "../controllers/server.controllers.js";
import { verifyToken } from "../middlewares/auth.middlewares.js";

const router = express.Router();

/* GET users listing. */
router.get("/:username/getAll", verifyToken, getAll);
router.post("/:serverId/acceptInvite", verifyToken, acceptInvite);
router.post("/create", verifyToken, createServer);
router.get("/:username/:getOne", verifyToken, getOne);
router.get("/:username/find/:inviteCode", verifyToken, findServer);
router.put("/:serverId/update/basics", verifyToken, updateServerBasics);
router.get("/:username/:serverId/members", verifyToken, getMembers);

export default router;
