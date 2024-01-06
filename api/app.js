import express from "express";
import logger from "morgan";
import serverRouter from "./routes/server.routes.js";
import authRouter from "./routes/auth.routes.js";
import membersRouter from "./routes/member.routes.js";
import channelsRouter from "./routes/channel.routes.js";
import conversationsRouter from "./routes/conversation.routes.js";
import messagesRouter from "./routes/messages.routes.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connect } from "./bin/db.js";
import { Server } from "socket.io";
import { createServer } from "http";
import { initializeSocket } from "./socket/io.js";
import imageRouter from "./routes/image.routes.js";

await connect();

export const app = express();
const httpServer = createServer(app);

export const io = new Server(httpServer, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.BASE,
    credentials: true,
  },
});

httpServer.listen(process.env.URL, () => {
  console.log("Server is listening at port 4000");
});

app.set("io", io);

app.use(
  cors({
    origin: process.env.BASE,
    credentials: true,
  })
);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/api/auth", authRouter);

// Protected routes
app.use("/api/servers", serverRouter);
app.use("/api/members", membersRouter);
app.use("/api/channels", channelsRouter);
app.use("/api/conversations", conversationsRouter);
app.use("/api/images", imageRouter);
app.use("/api/messages", messagesRouter);

initializeSocket(io);

// error handler
// app.use(function (err, res) {
//   const errorStatus = err.status || 500;
//   const errorMessage = err.errorMessage || "Something went wrong!";

//   return res.status(errorStatus).json({
//     success: false,
//     status: errorStatus,
//     message: errorMessage,
//     stack: err.stack,
//   });
// });
