import { Router } from "express";
import { getUserByUserId, updateUser, toPublicUser } from "../lib/storage.js";
import { requireAuth, type AuthRequest } from "../lib/auth-middleware.js";

const router = Router();

router.get("/users/:userId", requireAuth, (req: AuthRequest, res) => {
  const { userId } = req.params;
  const user = getUserByUserId(userId);
  if (!user) {
    res.status(404).json({ error: "المستخدم غير موجود" });
    return;
  }
  res.json(toPublicUser(user));
});

router.patch("/users/me/profile", requireAuth, (req: AuthRequest, res) => {
  const { displayName, bio } = req.body as { displayName?: string; bio?: string };
  const updated = updateUser(req.user!.id, {
    ...(displayName !== undefined && { displayName }),
    ...(bio !== undefined && { bio }),
  });
  if (!updated) {
    res.status(404).json({ error: "المستخدم غير موجود" });
    return;
  }
  res.json(toPublicUser(updated));
});

router.post("/users/me/avatar", requireAuth, (req: AuthRequest, res) => {
  const { avatarBase64 } = req.body as { avatarBase64: string };
  if (!avatarBase64) {
    res.status(400).json({ error: "الصورة مطلوبة" });
    return;
  }
  const updated = updateUser(req.user!.id, { avatarBase64 });
  if (!updated) {
    res.status(404).json({ error: "المستخدم غير موجود" });
    return;
  }
  res.json(toPublicUser(updated));
});

export default router;
