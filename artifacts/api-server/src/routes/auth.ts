import { Router } from "express";
import crypto from "crypto";
import {
  getUserByUsername,
  createUser,
  createSession,
  deleteSession,
  getSessionUser,
  toPublicUser,
} from "../lib/storage.js";
import { requireAuth, type AuthRequest } from "../lib/auth-middleware.js";

const router = Router();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "wasla_salt").digest("hex");
}

router.post("/auth/register", (req, res) => {
  const { username, displayName, password } = req.body as {
    username: string;
    displayName: string;
    password: string;
  };

  if (!username || !displayName || !password) {
    res.status(400).json({ error: "جميع الحقول مطلوبة" });
    return;
  }
  if (username.length < 3) {
    res.status(400).json({ error: "اسم المستخدم يجب أن يكون 3 أحرف على الأقل" });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" });
    return;
  }

  const existing = getUserByUsername(username);
  if (existing) {
    res.status(409).json({ error: "اسم المستخدم مستخدم بالفعل" });
    return;
  }

  const user = createUser({
    username,
    displayName,
    bio: null,
    avatarBase64: null,
    passwordHash: hashPassword(password),
    points: 100,
  });

  const sessionId = createSession(user.id);
  res.status(201).json({ user: toPublicUser(user), sessionId });
});

router.post("/auth/login", (req, res) => {
  const { username, password } = req.body as { username: string; password: string };
  if (!username || !password) {
    res.status(400).json({ error: "اسم المستخدم وكلمة المرور مطلوبان" });
    return;
  }

  const user = getUserByUsername(username);
  if (!user || user.passwordHash !== hashPassword(password)) {
    res.status(401).json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" });
    return;
  }

  const sessionId = createSession(user.id);
  res.json({ user: toPublicUser(user), sessionId });
});

router.post("/auth/logout", requireAuth, (req: AuthRequest, res) => {
  if (req.sessionId) deleteSession(req.sessionId);
  res.json({ success: true, message: "تم تسجيل الخروج" });
});

router.get("/auth/me", requireAuth, (req: AuthRequest, res) => {
  res.json(toPublicUser(req.user!));
});

export default router;
