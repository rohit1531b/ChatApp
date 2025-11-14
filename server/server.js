import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

const app = express();

// ✅ Allow only your Netlify frontend (CORS)
app.use(
  cors({
    origin: [
      "https://heartfelt-puppy-0d28f4.netlify.app",
      "https://zesty-sprinkles-859cb8.netlify.app",
      "https://talkietalk.netlify.app"
    ],
    credentials: true,
  })
);


app.use(express.json({ limit: "5mb" }));

// ✅ Create HTTP + Socket.IO server
const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "https://heartfelt-puppy-0d28f4.netlify.app",
    methods: ["GET", "POST"],
    credentials: true,
  },
});


export const userSocketMap = {}; // { userId: socketId }

// ✅ Socket.IO connection handler
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("🟢 User Connected:", userId);

  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("🔴 User Disconnected:", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// ✅ API Routes
app.get("/api/status", (req, res) => res.send("✅ Server is live!"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// ✅ Connect to MongoDB
await connectDB();

// ✅ Start server (Render will detect this)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// ✅ Optional: Export app for testing (not needed for Render)
export default app;
