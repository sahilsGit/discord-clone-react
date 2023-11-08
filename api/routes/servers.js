import express from "express";
import {
  createServer,
  findServers,
  getServer,
} from "../controllers/serverController.js";

const router = express.Router();

/* GET users listing. */
router.get("/:username/servers", findServers);
router.post("/servers/create", createServer);
router.get("/:username/:server", getServer);

export default router;
