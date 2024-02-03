import express from "express";
import logger from "morgan";
import serverRouter from "./routes/server.routes.js";
import authRouter from "./routes/auth.routes.js";
import membersRouter from "./routes/member.routes.js";
import channelsRouter from "./routes/channel.routes.js";
import conversationsRouter from "./routes/conversation.routes.js";
import messagesRouter from "./routes/messages.routes.js";
import profileRouter from "./routes/profile.routes.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connect } from "./bin/db.js";
import { Server } from "socket.io";
import { createServer } from "http";
import { initializeSocket } from "./socket/io.js";
import assetsRouter from "./routes/asset.routes.js";
import { getToken } from "./socket/webRtc.js";

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

initializeSocket(io);

// Protected routes
app.use("/api/servers", serverRouter);
app.use("/api/members", membersRouter);
app.use("/api/channels", channelsRouter);
app.use("/api/conversations", conversationsRouter);
app.use("/api/assets", assetsRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/profiles", profileRouter);
app.get("/api/getToken", getToken);

// error handler
app.use((error, req, res, next) => {
  const errorStatus = error.status || 500;
  const errorMessage = "Something went wrong!";

  return res.status(errorStatus).send({
    success: false,
    status: errorStatus,
    message: errorMessage,
    stack: error.stack,
  });
});
