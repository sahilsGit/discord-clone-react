import express from "express";
import {
  about,
  searchUser,
  updateProfile,
} from "../controllers/profile.controllers.js";
import { verifyToken } from "../middlewares/auth.middlewares.js";

const router = express.Router();

router.use(verifyToken);

//Handle requests

router
  .get("/about", about)
  .put("/updateProfile", updateProfile)
  .get("/find", searchUser);

export default router;
