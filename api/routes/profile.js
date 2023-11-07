import express from "express";
import { findServers, getServer } from "../controllers/profileController.js";
import { createServer } from "../controllers/serverController.js";

const router = express.Router();

/* GET users listing. */
router.get("/:username/servers", findServers);
router.post("/servers/create", createServer);
router.get("/:username/:server", getServer);

export default router;
