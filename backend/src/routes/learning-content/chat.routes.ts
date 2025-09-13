import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { getChats } from "../../services/learning-content/content/chat.controller";

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// GET /api/chats - Get user's chat history
router.get("/", getChats);

export default router;
