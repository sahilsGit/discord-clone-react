import express from "express";
import handleLogout from "../controllers/logoutController.js";

const router = express.Router();

//Handle requests

router.get("/", handleLogout);

export default router;
