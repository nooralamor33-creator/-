import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import app from "./app.js";
import { logger } from "./lib/logger.js";
import { getSessionUser, addMessage } from "./lib/storage.js";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: true,
    credentials: true,
  },
  path: "/api/socket.io",
});

// Map of userId -> socket id
const onlineUsers = new Map<string, string>();

io.on("connection", (socket) => {
  const authHeader = socket.handshake.auth?.token as string | undefined;
  let currentUserId: string | null = null;

  if (authHeader) {
    const sessionId = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
    const user = getSessionUser(sessionId);
    if (user) {
      currentUserId = user.id;
      onlineUsers.set(user.id, socket.id);
      socket.join(`user:${user.id}`);
      logger.info({ userId: user.id }, "User connected via Socket.IO");
    }
  }

  socket.on("send_message", (data: { toUserId: string; type: string; content?: string; mediaBase64?: string; mediaType?: string }) => {
    if (!currentUserId) return;
    const msg = addMessage(currentUserId, data.toUserId, {
      type: data.type as "text" | "image" | "video",
      content: data.content ?? null,
      mediaBase64: data.mediaBase64 ?? null,
      mediaType: data.mediaType ?? null,
    });
    io.to(`user:${data.toUserId}`).emit("new_message", msg);
    socket.emit("message_sent", msg);
  });

  socket.on("typing", (data: { toUserId: string }) => {
    if (!currentUserId) return;
    io.to(`user:${data.toUserId}`).emit("user_typing", { fromUserId: currentUserId });
  });

  socket.on("disconnect", () => {
    if (currentUserId) {
      onlineUsers.delete(currentUserId);
      logger.info({ userId: currentUserId }, "User disconnected");
    }
  });
});

httpServer.listen(port, (err?: Error) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }
  logger.info({ port }, "Server listening with Socket.IO");
});
