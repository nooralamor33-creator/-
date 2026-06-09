import { Router } from "express";
import {
  getUserByUserId,
  getUserById,
  getUserData,
  saveUserData,
  generateUuid,
  toPublicUser,
  type FriendRequest,
} from "../lib/storage.js";
import { requireAuth, type AuthRequest } from "../lib/auth-middleware.js";

const router = Router();

router.get("/friends", requireAuth, (req: AuthRequest, res) => {
  const me = req.user!;
  const myData = getUserData(me.id);
  const friends = myData.friends
    .map((fId) => getUserById(fId))
    .filter(Boolean)
    .map((u) => toPublicUser(u!));
  res.json(friends);
});

router.get("/friends/requests", requireAuth, (req: AuthRequest, res) => {
  const me = req.user!;
  const myData = getUserData(me.id);
  const incoming = myData.friendRequests.filter(
    (r) => r.toUserId === me.id && r.status === "pending"
  );
  const withUsers = incoming.map((r) => {
    const fromUser = getUserById(r.fromUserId);
    return { ...r, fromUser: fromUser ? toPublicUser(fromUser) : null };
  });
  res.json(withUsers);
});

router.post("/friends/requests", requireAuth, (req: AuthRequest, res) => {
  const me = req.user!;
  const { toUserId } = req.body as { toUserId: string };

  const target = getUserByUserId(toUserId);
  if (!target) {
    res.status(404).json({ error: "المستخدم غير موجود، تحقق من الـ ID" });
    return;
  }
  if (target.id === me.id) {
    res.status(400).json({ error: "لا يمكنك إضافة نفسك" });
    return;
  }

  const targetData = getUserData(target.id);
  const existingRequest = targetData.friendRequests.find(
    (r) => r.fromUserId === me.id && r.toUserId === target.id && r.status === "pending"
  );
  if (existingRequest) {
    res.status(400).json({ error: "طلب الصداقة مرسل بالفعل" });
    return;
  }
  if (targetData.friends.includes(me.id)) {
    res.status(400).json({ error: "هذا المستخدم صديقك بالفعل" });
    return;
  }

  const request: FriendRequest = {
    id: generateUuid(),
    fromUserId: me.id,
    toUserId: target.id,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  targetData.friendRequests.push(request);
  saveUserData(target.id, targetData);

  res.status(201).json({ ...request, fromUser: toPublicUser(me) });
});

router.patch("/friends/requests/:requestId", requireAuth, (req: AuthRequest, res) => {
  const me = req.user!;
  const { requestId } = req.params;
  const { action } = req.body as { action: "accept" | "reject" };

  const myData = getUserData(me.id);
  const reqIdx = myData.friendRequests.findIndex(
    (r) => r.id === requestId && r.toUserId === me.id && r.status === "pending"
  );
  if (reqIdx === -1) {
    res.status(404).json({ error: "الطلب غير موجود" });
    return;
  }

  myData.friendRequests[reqIdx].status = action === "accept" ? "accepted" : "rejected";

  if (action === "accept") {
    const fromUserId = myData.friendRequests[reqIdx].fromUserId;
    if (!myData.friends.includes(fromUserId)) {
      myData.friends.push(fromUserId);
    }
    const fromUserData = getUserData(fromUserId);
    if (!fromUserData.friends.includes(me.id)) {
      fromUserData.friends.push(me.id);
    }
    saveUserData(fromUserId, fromUserData);
  }

  saveUserData(me.id, myData);
  const fromUser = getUserById(myData.friendRequests[reqIdx].fromUserId);
  res.json({ ...myData.friendRequests[reqIdx], fromUser: fromUser ? toPublicUser(fromUser) : null });
});

router.delete("/friends/:friendId", requireAuth, (req: AuthRequest, res) => {
  const me = req.user!;
  const { friendId } = req.params;
  const friend = getUserById(friendId);
  if (!friend) {
    res.status(404).json({ error: "المستخدم غير موجود" });
    return;
  }

  const myData = getUserData(me.id);
  myData.friends = myData.friends.filter((id) => id !== friendId);
  saveUserData(me.id, myData);

  const friendData = getUserData(friendId);
  friendData.friends = friendData.friends.filter((id) => id !== me.id);
  saveUserData(friendId, friendData);

  res.json({ success: true, message: "تم حذف الصديق" });
});

export default router;
