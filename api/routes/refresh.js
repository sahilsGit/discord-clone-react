import express from "express";
import verifyToken from "../controllers/tokensController.js";

const router = express.Router();

//Handle requests

router.get("/", verifyToken);

export default router;
