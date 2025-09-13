import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { createResource } from "../../services/learning-content/content/resource.controller";

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// POST /api/resources - Create learning resources for a topic
router.post("/", createResource);

export default router;
