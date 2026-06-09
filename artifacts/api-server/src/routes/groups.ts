import { Router } from "express";
import {
  getGroups,
  getGroupById,
  getGroupByGroupId,
  createGroup,
  updateGroup,
  getUserById,
  generateUuid,
  toPublicUser,
  type JoinRequest,
} from "../lib/storage.js";
import { requireAuth, type AuthRequest } from "../lib/auth-middleware.js";

const router = Router();

function enrichGroup(group: ReturnType<typeof getGroupById>, currentUserId?: string) {
  if (!group) return null;
  return {
    id: group.id,
    groupId: group.groupId,
    name: group.name,
    bio: group.bio,
    avatarBase64: group.avatarBase64,
    ownerId: group.ownerId,
    joinRequestsEnabled: group.joinRequestsEnabled,
    memberCount: group.members.length,
    createdAt: group.createdAt,
    members: group.members.map((m) => {
      const user = getUserById(m.userId);
      return { ...m, user: user ? toPublicUser(user) : null };
    }),
  };
}

router.get("/groups", requireAuth, (req: AuthRequest, res) => {
  const me = req.user!;
  const allGroups = getGroups();
  const myGroups = allGroups.filter((g) => g.members.some((m) => m.userId === me.id));
  res.json(myGroups.map((g) => enrichGroup(g, me.id)));
});

router.post("/groups", requireAuth, (req: AuthRequest, res) => {
  const me = req.user!;
  const { name, bio, joinRequestsEnabled } = req.body as {
    name: string;
    bio?: string;
    joinRequestsEnabled?: boolean;
  };
  if (!name) {
    res.status(400).json({ error: "اسم المجموعة مطلوب" });
    return;
  }
  const group = createGroup(me.id, { name, bio, joinRequestsEnabled });
  res.status(201).json(enrichGroup(group, me.id));
});

router.get("/groups/:groupId", requireAuth, (req: AuthRequest, res) => {
  const me = req.user!;
  const group = getGroupByGroupId(req.params.groupId) ?? getGroupById(req.params.groupId);
  if (!group) {
    res.status(404).json({ error: "المجموعة غير موجودة" });
    return;
  }
  res.json(enrichGroup(group, me.id));
});

router.patch("/groups/:groupId", requireAuth, (req: AuthRequest, res) => {
  const me = req.user!;
  const group = getGroupById(req.params.groupId) ?? getGroupByGroupId(req.params.groupId);
  if (!group) {
    res.status(404).json({ error: "المجموعة غير موجودة" });
    return;
  }
  const member = group.members.find((m) => m.userId === me.id);
  if (!member || (member.role !== "owner" && member.role !== "admin")) {
    res.status(403).json({ error: "غير مصرح لك بتعديل المجموعة" });
    return;
  }
  const { name, bio, avatarBase64, joinRequestsEnabled } = req.body as {
    name?: string;
    bio?: string;
    avatarBase64?: string;
    joinRequestsEnabled?: boolean;
  };
  const updated = updateGroup(group.id, {
    ...(name !== undefined && { name }),
    ...(bio !== undefined && { bio }),
    ...(avatarBase64 !== undefined && { avatarBase64 }),
    ...(joinRequestsEnabled !== undefined && { joinRequestsEnabled }),
  });
  res.json(enrichGroup(updated, me.id));
});

router.post("/groups/:groupId/join", requireAuth, (req: AuthRequest, res) => {
  const me = req.user!;
  const group = getGroupByGroupId(req.params.groupId) ?? getGroupById(req.params.groupId);
  if (!group) {
    res.status(404).json({ error: "المجموعة غير موجودة" });
    return;
  }
  if (group.members.some((m) => m.userId === me.id)) {
    res.status(400).json({ error: "أنت عضو في هذه المجموعة بالفعل" });
    return;
  }
  if (!group.joinRequestsEnabled) {
    res.status(403).json({ error: "المجموعة لا تقبل طلبات الانضمام حاليًا" });
    return;
  }
  const existingReq = group.joinRequests.find(
    (r) => r.userId === me.id && r.status === "pending"
  );
  if (existingReq) {
    res.status(400).json({ error: "طلبك قيد المراجعة" });
    return;
  }
  const joinReq: JoinRequest = {
    id: generateUuid(),
    groupId: group.id,
    userId: me.id,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  group.joinRequests.push(joinReq);
  updateGroup(group.id, { joinRequests: group.joinRequests });
  res.json({ success: true, message: "تم إرسال طلب الانضمام" });
});

router.get("/groups/:groupId/join-requests", requireAuth, (req: AuthRequest, res) => {
  const me = req.user!;
  const group = getGroupById(req.params.groupId) ?? getGroupByGroupId(req.params.groupId);
  if (!group) {
    res.status(404).json({ error: "المجموعة غير موجودة" });
    return;
  }
  const member = group.members.find((m) => m.userId === me.id);
  if (!member || (member.role !== "owner" && member.role !== "admin")) {
    res.status(403).json({ error: "غير مصرح" });
    return;
  }
  const pending = group.joinRequests.filter((r) => r.status === "pending").map((r) => {
    const user = getUserById(r.userId);
    return { ...r, user: user ? toPublicUser(user) : null };
  });
  res.json(pending);
});

router.patch("/groups/:groupId/join-requests/:requestId", requireAuth, (req: AuthRequest, res) => {
  const me = req.user!;
  const group = getGroupById(req.params.groupId) ?? getGroupByGroupId(req.params.groupId);
  if (!group) {
    res.status(404).json({ error: "المجموعة غير موجودة" });
    return;
  }
  const member = group.members.find((m) => m.userId === me.id);
  if (!member || (member.role !== "owner" && member.role !== "admin")) {
    res.status(403).json({ error: "غير مصرح" });
    return;
  }
  const { action } = req.body as { action: "accept" | "reject" };
  const reqIdx = group.joinRequests.findIndex((r) => r.id === req.params.requestId);
  if (reqIdx === -1) {
    res.status(404).json({ error: "الطلب غير موجود" });
    return;
  }
  group.joinRequests[reqIdx].status = action === "accept" ? "accepted" : "rejected";
  if (action === "accept") {
    group.members.push({
      userId: group.joinRequests[reqIdx].userId,
      role: "member",
      joinedAt: new Date().toISOString(),
    });
  }
  updateGroup(group.id, { joinRequests: group.joinRequests, members: group.members });
  const user = getUserById(group.joinRequests[reqIdx].userId);
  res.json({ ...group.joinRequests[reqIdx], user: user ? toPublicUser(user) : null });
});

router.delete("/groups/:groupId/members/:memberId", requireAuth, (req: AuthRequest, res) => {
  const me = req.user!;
  const group = getGroupById(req.params.groupId) ?? getGroupByGroupId(req.params.groupId);
  if (!group) {
    res.status(404).json({ error: "المجموعة غير موجودة" });
    return;
  }
  const myMember = group.members.find((m) => m.userId === me.id);
  if (!myMember || (myMember.role !== "owner" && myMember.role !== "admin")) {
    res.status(403).json({ error: "غير مصرح" });
    return;
  }
  const targetMember = group.members.find((m) => m.userId === req.params.memberId);
  if (!targetMember) {
    res.status(404).json({ error: "العضو غير موجود" });
    return;
  }
  if (targetMember.role === "owner") {
    res.status(400).json({ error: "لا يمكن إزالة المالك" });
    return;
  }
  group.members = group.members.filter((m) => m.userId !== req.params.memberId);
  updateGroup(group.id, { members: group.members });
  res.json({ success: true, message: "تم إزالة العضو" });
});

export default router;
