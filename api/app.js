import express from "express";
import path from "path";
import logger from "morgan";
import { fileURLToPath } from "url";
import indexRouter from "./routes/index.js";
import serverRouter from "./routes/servers.js";
import authRouter from "./routes/auth.js";
import membersRouter from "./routes/members.js";
import channelsRouter from "./routes/channels.js";
import conversationsRouter from "./routes/conversations.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";
import { verifyToken } from "./controllers/tokensController.js";
import logoutRouter from "./routes/logout.js";
import fs from "fs";
import { connect } from "./bin/db.js";
import { Server } from "socket.io";
import http from "http";

await connect();

export const app = express();

app.use(
  cors({
    origin: process.env.BASE, // Update with your client's URL
    credentials: true,
  })
);

const server = http.createServer(app);
const io = new Server(server);

io.on("connection", (socket) => {
  console.log("A user connected,", socket.id);
});

app.listen(process.env.URL, () => {
  console.log("Server is listening at port 4000");
});

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/images"); // set the destination folder
    },
    filename: function (req, file, cb) {
      // generate a unique filename
      cb(null, Date.now() + "-" + file.originalname);
    },
  }),
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/api/auth", authRouter);
app.use(verifyToken);
app.use("/api/logout", logoutRouter);
app.use("/api/servers", serverRouter);
app.use("/api/members", membersRouter);
app.use("/api/channels", channelsRouter);
app.use("/api/conversations", conversationsRouter);

app.get("/api/getImage/:imageName", (req, res) => {
  const imageName = req.params.imageName;
  const imagePath = path.join(__dirname, "public/images", imageName);

  if (fs.existsSync(imagePath)) {
    // Set appropriate headers (e.g., for a JPEG image)
    res.setHeader("Content-Type", "image/jpeg");
    // Send the image file as a response
    res.sendFile(imagePath);
  } else {
    // Handle the case where the image doesn't exist
    res.status(404).send("Image not found");
  }

  // res.sendFile(imagePath);
});

app.post("/api/upload", upload.single("image"), (req, res) => {
  const newFilename = req.file.filename;

  // Send the new filename as a response
  res.json({ newFilename });
});

// error handler
app.use(function (err, res, next) {
  const errorStatus = err.status || 500;
  const errorMessage = err.errorMessage || "Something went wrong!";

  return res.status(errorStatus).json({
    success: false,
    status: errorStatus,
    message: errorMessage,
    stack: err.stack,
  });
});
