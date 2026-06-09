import type { Request, Response, NextFunction } from "express";
import { getSessionUser, type StoredUser } from "./storage.js";

export interface AuthRequest extends Request {
  user?: StoredUser;
  sessionId?: string;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "غير مصرح" });
    return;
  }
  const sessionId = authHeader.slice(7);
  const user = getSessionUser(sessionId);
  if (!user) {
    res.status(401).json({ error: "الجلسة منتهية أو غير صحيحة" });
    return;
  }
  req.user = user;
  req.sessionId = sessionId;
  next();
}
