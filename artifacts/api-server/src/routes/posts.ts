import { Router } from "express";
import { getPosts, savePosts, createPost, getUserById, toPublicUser } from "../lib/storage.js";
import { requireAuth, type AuthRequest } from "../lib/auth-middleware.js";

const router = Router();

router.get("/posts", requireAuth, (req: AuthRequest, res) => {
  const me = req.user!;
  const posts = getPosts();
  const enriched = posts.map((p) => {
    const author = getUserById(p.authorId);
    return {
      ...p,
      author: author ? toPublicUser(author) : null,
      likeCount: p.likes.length,
      isLiked: p.likes.includes(me.id),
    };
  });
  res.json(enriched);
});

router.post("/posts", requireAuth, (req: AuthRequest, res) => {
  const me = req.user!;
  const { content, mediaBase64, mediaType } = req.body as {
    content: string;
    mediaBase64?: string;
    mediaType?: string;
  };
  if (!content) {
    res.status(400).json({ error: "محتوى المنشور مطلوب" });
    return;
  }
  const post = createPost(me.id, { content, mediaBase64, mediaType });
  const author = toPublicUser(me);
  res.status(201).json({ ...post, author, likeCount: 0, isLiked: false });
});

router.post("/posts/:postId/like", requireAuth, (req: AuthRequest, res) => {
  const me = req.user!;
  const { postId } = req.params;
  const posts = getPosts();
  const idx = posts.findIndex((p) => p.id === postId);
  if (idx === -1) {
    res.status(404).json({ error: "المنشور غير موجود" });
    return;
  }
  const likeIdx = posts[idx].likes.indexOf(me.id);
  if (likeIdx === -1) {
    posts[idx].likes.push(me.id);
  } else {
    posts[idx].likes.splice(likeIdx, 1);
  }
  savePosts(posts);
  const author = getUserById(posts[idx].authorId);
  res.json({
    ...posts[idx],
    author: author ? toPublicUser(author) : null,
    likeCount: posts[idx].likes.length,
    isLiked: posts[idx].likes.includes(me.id),
  });
});

export default router;
