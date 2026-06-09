import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import usersRouter from "./users.js";
import friendsRouter from "./friends.js";
import messagesRouter from "./messages.js";
import groupsRouter from "./groups.js";
import postsRouter from "./posts.js";
import pointsRouter from "./points.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(friendsRouter);
router.use(messagesRouter);
router.use(groupsRouter);
router.use(postsRouter);
router.use(pointsRouter);

export default router;
