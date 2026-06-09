import { Router } from "express";
import {
  getGifts,
  addGift,
  getUserById,
  getUserByUserId,
  updateUser,
  toPublicUser,
} from "../lib/storage.js";
import { requireAuth, type AuthRequest } from "../lib/auth-middleware.js";

const router = Router();

const GIFT_COSTS: Record<string, number> = {
  rose: 10,
  star: 25,
  crown: 100,
  heart: 15,
  diamond: 200,
};

router.get("/points", requireAuth, (req: AuthRequest, res) => {
  const me = req.user!;
  const gifts = getGifts();
  const giftsReceived = gifts
    .filter((g) => g.toUserId === me.id)
    .map((g) => {
      const fromUser = getUserById(g.fromUserId);
      return { ...g, fromUser: fromUser ? toPublicUser(fromUser) : null };
    });
  const giftsSent = gifts
    .filter((g) => g.fromUserId === me.id)
    .map((g) => {
      const fromUser = getUserById(g.fromUserId);
      return { ...g, fromUser: fromUser ? toPublicUser(fromUser) : null };
    });

  res.json({
    userId: me.id,
    points: me.points,
    giftsReceived,
    giftsSent,
  });
});

router.post("/points/gifts", requireAuth, (req: AuthRequest, res) => {
  const me = req.user!;
  const { toUserId, giftType, points: requestedPoints } = req.body as {
    toUserId: string;
    giftType: string;
    points: number;
  };

  const target = getUserByUserId(toUserId);
  if (!target) {
    res.status(404).json({ error: "المستخدم غير موجود" });
    return;
  }
  if (target.id === me.id) {
    res.status(400).json({ error: "لا يمكنك إرسال هدية لنفسك" });
    return;
  }

  const cost = GIFT_COSTS[giftType];
  if (!cost) {
    res.status(400).json({ error: "نوع الهدية غير صحيح" });
    return;
  }

  if (me.points < cost) {
    res.status(400).json({ error: "رصيدك من النقاط غير كافٍ" });
    return;
  }

  updateUser(me.id, { points: me.points - cost });
  updateUser(target.id, { points: target.points + cost });
  addGift(me.id, target.id, giftType, cost);

  res.json({ success: true, message: `تم إرسال الهدية إلى ${target.displayName}` });
});

export default router;
