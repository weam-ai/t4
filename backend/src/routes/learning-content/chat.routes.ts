import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { getChats, deleteChat } from "../../services/learning-content/content/chat.controller";

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// GET /api/chats - Get user's chat history
router.get("/", getChats);

// DELETE /api/chats/:chatId - Delete a specific chat
router.delete("/:chatId", deleteChat);

export default router;
