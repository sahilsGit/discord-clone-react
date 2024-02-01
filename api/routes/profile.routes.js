import express from "express";
import {
  changePassword,
  forgotPasswordRequest,
  searchUser,
  sendEmailVerification,
  updateProfile,
  verifyEmail,
  // about,
} from "../controllers/profile.controllers.js";
import { verifyToken } from "../middlewares/auth.middlewares.js";

const router = express.Router();

router.post("/forgotPassword", forgotPasswordRequest);
router.use(verifyToken);

//Handle requests

router
  .put("/updateProfile", updateProfile)
  .get("/find", searchUser)
  .put("/verify/:profileId", sendEmailVerification)
  .put("/verifyCode", verifyEmail)
  .put("/newPassword", changePassword);

export default router;
