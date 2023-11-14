import express from "express";
import {
  createServer,
  getAll,
  getOne,
  updateServerBasics,
} from "../controllers/serverController.js";

const router = express.Router();

/* GET users listing. */
router.get("/:username/getAll", getAll);
router.post("/create", createServer);
router.get("/:username/:getOne", getOne);
router.put("/:serverId/update/basics", updateServerBasics);

export default router;
