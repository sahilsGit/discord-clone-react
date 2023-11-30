import express from "express";
import {
  createServer,
  getAll,
  getOne,
  updateServerBasics,
  getMembers,
  findserver,
  acceptInvite,
} from "../controllers/serverController.js";

const router = express.Router();

/* GET users listing. */
router.get("/:username/getAll", getAll);
router.post("/:serverId/acceptInvite", acceptInvite);
router.post("/create", createServer);
router.get("/:username/:getOne", getOne);
router.get("/:username/find/:inviteCode", findserver);
router.put("/:serverId/update/basics", updateServerBasics);
router.get("/:username/:serverId/members", getMembers);

export default router;
