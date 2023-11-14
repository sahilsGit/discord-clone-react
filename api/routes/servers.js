import express from "express";
import {
  createServer,
  findServers,
  getServer,
  updateServerBasics,
} from "../controllers/serverController.js";

const router = express.Router();

/* GET users listing. */
router.get("/:username/servers", findServers);
router.post("/create", createServer);
router.get("/:username/:server", getServer);
router.put("/:serverId/update/basics", updateServerBasics);

export default router;
