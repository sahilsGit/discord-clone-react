import express from "express";
import {
  register,
  login,
  refreshUserDetails,
  resetPassword,
  invalidateAllSessions,
} from "../controllers/auth.controllers.js";
import { verifyToken } from "../middlewares/auth.middlewares.js";

const router = express.Router();

//Handle requests
router.post("/register", register);
router.post("/login", login);
router.get("/refresh", verifyToken, refreshUserDetails);
router.put("/resetPassword", resetPassword);
router.put("/revokeToken", invalidateAllSessions);

export default router;
