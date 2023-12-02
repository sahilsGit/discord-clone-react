import express from "express";
import { register, login } from "../controllers/authController.js";
import { refresh } from "../controllers/tokensController.js";

const router = express.Router();

//Handle requests

router.post("/register", register);
router.post("/login", login);
router.get("/refresh", refresh);

export default router;
