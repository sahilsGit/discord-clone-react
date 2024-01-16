import express from "express";
import { about, updateProfile } from "../controllers/profile.controllers.js";
import { verifyToken } from "../middlewares/auth.middlewares.js";

const router = express.Router();

router.use(verifyToken);

//Handle requests

router.get("/about", about);
router.put("/updateProfile", updateProfile);

export default router;
