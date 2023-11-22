import express from "express";
import {
  createServer,
  getAll,
  getOne,
  updateServerBasics,
  getMembers,
} from "../controllers/serverController.js";

const router = express.Router();

/* GET users listing. */
router.get("/:username/getAll", getAll);
router.post("/create", createServer);
router.get("/:username/:getOne", getOne);
router.put("/:serverId/update/basics", updateServerBasics);

router.get("/:username/:serverId/members", getMembers);
// router.put("/serverId/members/memberId", changeMemberRole);

export default router;
