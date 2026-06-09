import { Router } from "express";
import {
  getMessages,
  addMessage,
  getPosts,
  getUserById,
  getUserData,
  toPublicUser,
} from "../lib/storage.js";
import { requireAuth, type AuthRequest } from "../lib/auth-middleware.js";

const router = Router();

router.get("/messages/conversations", requireAuth, (req: AuthRequest, res) => {
  const me = req.user!;
  const myData = getUserData(me.id);
  const conversations = myData.friends
    .map((fId) => {
      const friend = getUserById(fId);
      if (!friend) return null;
      const messages = getMessages(me.id, fId);
      if (messages.length === 0) return null;
      const lastMessage = messages[messages.length - 1];
      const unreadCount = messages.filter(
        (m) => m.toUserId === me.id && !m.content?.startsWith("__read__")
      ).length;
      return {
        userId: fId,
        user: toPublicUser(friend),
        lastMessage,
        unreadCount,
      };
    })
    .filter(Boolean)
    .sort((a: any, b: any) =>
      new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
    );
  res.json(conversations);
});

router.get("/messages/:userId", requireAuth, (req: AuthRequest, res) => {
  const me = req.user!;
  const { userId } = req.params;
  const other = getUserById(userId);
  if (!other) {
    res.status(404).json({ error: "المستخدم غير موجود" });
    return;
  }
  const messages = getMessages(me.id, other.id);
  res.json(messages);
});

router.post("/messages/:userId", requireAuth, (req: AuthRequest, res) => {
  const me = req.user!;
  const { userId } = req.params;
  const other = getUserById(userId);
  if (!other) {
    res.status(404).json({ error: "المستخدم غير موجود" });
    return;
  }
  const { type, content, mediaBase64, mediaType } = req.body as {
    type: "text" | "image" | "video";
    content?: string;
    mediaBase64?: string;
    mediaType?: string;
  };
  if (!type) {
    res.status(400).json({ error: "نوع الرسالة مطلوب" });
    return;
  }
  if (type === "text" && !content) {
    res.status(400).json({ error: "محتوى الرسالة مطلوب" });
    return;
  }

  const msg = addMessage(me.id, other.id, {
    type,
    content: content ?? null,
    mediaBase64: mediaBase64 ?? null,
    mediaType: mediaType ?? null,
  });

  res.status(201).json(msg);
});

export default router;
