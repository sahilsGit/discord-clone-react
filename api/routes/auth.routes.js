import express from "express";
import { register, login } from "../controllers/auth.controllers.js";
import { refresh } from "../middlewares/auth.middlewares.js";

const router = express.Router();

//Handle requests

router.post("/register", register);
router.post("/login", login);
router.get("/refresh", refresh);

export default router;
