import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

const app = express();

// ✅ Allow only your Netlify frontend
app.use(cors({
  origin: "https://zesty-sprinkles-859cb8.netlify.app",
  credentials: true,
}));

app.use(express.json({ limit: "5mb" }));

// ✅ Create HTTP + Socket.IO server
const server = http.createServer(app);

export const io = new Server(server, {
  cors: { origin: "https://zesty-sprinkles-859cb8.netlify.app" },
});

export const userSocketMap = {}; // { userId: socketId }

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User Connected:", userId);
  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("User Disconnected:", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// ✅ Routes
app.use("/api/status", (req, res) => res.send("Server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// ✅ Connect to DB
await connectDB();

// ✅ Always listen (Render needs this)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
