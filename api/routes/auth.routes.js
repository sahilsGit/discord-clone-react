import express from "express";
import {
  register,
  login,
  refreshUserDetails,
} from "../controllers/auth.controllers.js";
import { verifyToken } from "../middlewares/auth.middlewares.js";

const router = express.Router();

//Handle requests

router.post("/register", register);
router.post("/login", login);
router.get("/refresh", verifyToken, refreshUserDetails);

export default router;
