import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "../../data");

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

ensureDir(DATA_DIR);

function readJson<T>(filePath: string, defaultValue: T): T {
  try {
    if (!fs.existsSync(filePath)) return defaultValue;
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content) as T;
  } catch {
    return defaultValue;
  }
}

function writeJson(filePath: string, data: unknown): void {
  const dir = path.dirname(filePath);
  ensureDir(dir);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export function generateId(length = 8): string {
  const chars = "0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export function generateUuid(): string {
  return crypto.randomUUID();
}

// ---- Users (data.json) ----

export interface StoredUser {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  bio: string | null;
  avatarBase64: string | null;
  passwordHash: string;
  points: number;
  createdAt: string;
}

const USERS_FILE = path.join(DATA_DIR, "data.json");

export function getUsers(): StoredUser[] {
  return readJson<StoredUser[]>(USERS_FILE, []);
}

export function saveUsers(users: StoredUser[]): void {
  writeJson(USERS_FILE, users);
}

export function getUserByUsername(username: string): StoredUser | null {
  return getUsers().find((u) => u.username === username) ?? null;
}

export function getUserByUserId(userId: string): StoredUser | null {
  return getUsers().find((u) => u.userId === userId) ?? null;
}

export function getUserById(id: string): StoredUser | null {
  return getUsers().find((u) => u.id === id) ?? null;
}

export function createUser(data: Omit<StoredUser, "id" | "userId" | "createdAt">): StoredUser {
  const users = getUsers();
  let userId: string;
  do {
    userId = generateId(8);
  } while (users.some((u) => u.userId === userId));

  const user: StoredUser = {
    ...data,
    id: generateUuid(),
    userId,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);
  return user;
}

export function updateUser(id: string, updates: Partial<StoredUser>): StoredUser | null {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...updates };
  saveUsers(users);
  return users[idx];
}

// ---- User data files (user_{id}.json) ----

export interface UserData {
  friends: string[];
  friendRequests: FriendRequest[];
  sessions: Session[];
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export interface Session {
  sessionId: string;
  userId: string;
  createdAt: string;
}

function getUserDataFile(userId: string): string {
  return path.join(DATA_DIR, `user_${userId}.json`);
}

export function getUserData(userId: string): UserData {
  return readJson<UserData>(getUserDataFile(userId), {
    friends: [],
    friendRequests: [],
    sessions: [],
  });
}

export function saveUserData(userId: string, data: UserData): void {
  writeJson(getUserDataFile(userId), data);
}

// ---- Sessions (sessions.json) ----

interface SessionStore {
  [sessionId: string]: { userId: string; createdAt: string };
}

const SESSIONS_FILE = path.join(DATA_DIR, "sessions.json");

export function getSessions(): SessionStore {
  return readJson<SessionStore>(SESSIONS_FILE, {});
}

export function createSession(userId: string): string {
  const sessionId = generateUuid();
  const sessions = getSessions();
  sessions[sessionId] = { userId, createdAt: new Date().toISOString() };
  writeJson(SESSIONS_FILE, sessions);
  return sessionId;
}

export function getSessionUser(sessionId: string): StoredUser | null {
  const sessions = getSessions();
  const session = sessions[sessionId];
  if (!session) return null;
  return getUserById(session.userId);
}

export function deleteSession(sessionId: string): void {
  const sessions = getSessions();
  delete sessions[sessionId];
  writeJson(SESSIONS_FILE, sessions);
}

// ---- Messages ----

export interface Message {
  id: string;
  fromUserId: string;
  toUserId: string;
  type: "text" | "image" | "video";
  content: string | null;
  mediaBase64: string | null;
  mediaType: string | null;
  createdAt: string;
}

function getMessagesFile(userId1: string, userId2: string): string {
  const sorted = [userId1, userId2].sort();
  return path.join(DATA_DIR, `messages_${sorted[0]}_${sorted[1]}.json`);
}

export function getMessages(userId1: string, userId2: string): Message[] {
  return readJson<Message[]>(getMessagesFile(userId1, userId2), []);
}

export function addMessage(
  fromUserId: string,
  toUserId: string,
  data: Omit<Message, "id" | "fromUserId" | "toUserId" | "createdAt">
): Message {
  const messages = getMessages(fromUserId, toUserId);
  const msg: Message = {
    ...data,
    id: generateUuid(),
    fromUserId,
    toUserId,
    createdAt: new Date().toISOString(),
  };
  messages.push(msg);
  writeJson(getMessagesFile(fromUserId, toUserId), messages);
  return msg;
}

// ---- Groups ----

export interface GroupMember {
  userId: string;
  role: "owner" | "admin" | "member";
  joinedAt: string;
}

export interface JoinRequest {
  id: string;
  groupId: string;
  userId: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export interface Group {
  id: string;
  groupId: string;
  name: string;
  bio: string | null;
  avatarBase64: string | null;
  ownerId: string;
  members: GroupMember[];
  joinRequests: JoinRequest[];
  joinRequestsEnabled: boolean;
  createdAt: string;
}

const GROUPS_FILE = path.join(DATA_DIR, "groups.json");

export function getGroups(): Group[] {
  return readJson<Group[]>(GROUPS_FILE, []);
}

export function saveGroups(groups: Group[]): void {
  writeJson(GROUPS_FILE, groups);
}

export function getGroupById(id: string): Group | null {
  return getGroups().find((g) => g.id === id) ?? null;
}

export function getGroupByGroupId(groupId: string): Group | null {
  return getGroups().find((g) => g.groupId === groupId) ?? null;
}

export function createGroup(
  ownerId: string,
  data: { name: string; bio?: string; joinRequestsEnabled?: boolean }
): Group {
  const groups = getGroups();
  let groupId: string;
  do {
    groupId = generateId(8);
  } while (groups.some((g) => g.groupId === groupId));

  const group: Group = {
    id: generateUuid(),
    groupId,
    name: data.name,
    bio: data.bio ?? null,
    avatarBase64: null,
    ownerId,
    members: [{ userId: ownerId, role: "owner", joinedAt: new Date().toISOString() }],
    joinRequests: [],
    joinRequestsEnabled: data.joinRequestsEnabled ?? true,
    createdAt: new Date().toISOString(),
  };
  groups.push(group);
  saveGroups(groups);
  return group;
}

export function updateGroup(id: string, updates: Partial<Group>): Group | null {
  const groups = getGroups();
  const idx = groups.findIndex((g) => g.id === id);
  if (idx === -1) return null;
  groups[idx] = { ...groups[idx], ...updates };
  saveGroups(groups);
  return groups[idx];
}

// ---- Posts ----

export interface Post {
  id: string;
  authorId: string;
  content: string;
  mediaBase64: string | null;
  mediaType: string | null;
  likes: string[];
  createdAt: string;
}

const POSTS_FILE = path.join(DATA_DIR, "posts.json");

export function getPosts(): Post[] {
  return readJson<Post[]>(POSTS_FILE, []);
}

export function savePosts(posts: Post[]): void {
  writeJson(POSTS_FILE, posts);
}

export function createPost(authorId: string, data: { content: string; mediaBase64?: string; mediaType?: string }): Post {
  const posts = getPosts();
  const post: Post = {
    id: generateUuid(),
    authorId,
    content: data.content,
    mediaBase64: data.mediaBase64 ?? null,
    mediaType: data.mediaType ?? null,
    likes: [],
    createdAt: new Date().toISOString(),
  };
  posts.unshift(post);
  savePosts(posts);
  return post;
}

// ---- Points / Gifts ----

export interface GiftRecord {
  id: string;
  fromUserId: string;
  toUserId: string;
  giftType: string;
  points: number;
  createdAt: string;
}

const GIFTS_FILE = path.join(DATA_DIR, "gifts.json");

export function getGifts(): GiftRecord[] {
  return readJson<GiftRecord[]>(GIFTS_FILE, []);
}

export function saveGifts(gifts: GiftRecord[]): void {
  writeJson(GIFTS_FILE, gifts);
}

export function addGift(fromUserId: string, toUserId: string, giftType: string, points: number): GiftRecord {
  const gifts = getGifts();
  const gift: GiftRecord = {
    id: generateUuid(),
    fromUserId,
    toUserId,
    giftType,
    points,
    createdAt: new Date().toISOString(),
  };
  gifts.push(gift);
  saveGifts(gifts);
  return gift;
}

export function toPublicUser(u: StoredUser) {
  return {
    id: u.id,
    userId: u.userId,
    username: u.username,
    displayName: u.displayName,
    bio: u.bio,
    avatarBase64: u.avatarBase64,
    points: u.points,
    createdAt: u.createdAt,
  };
}
