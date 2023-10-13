import express from "express";
import { verifyToken } from "../lib/verifyToken.js";
const router = express.Router();

/* GET home page. */
router.get("/get", verifyToken, function (req, res, next) {
  res.send("This is a protected page, you are logged in right?");
});

export default router;
