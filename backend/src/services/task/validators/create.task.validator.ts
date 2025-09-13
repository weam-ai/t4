import { z } from "zod";

const createTaskSchema = z.object({
    title: z
        .string()
        .min(3, "Title must be at least 3 characters long")
        .trim(),
    description: z
        .string()
        .trim(),
    status: z
        .enum(["pending", "in-progress", "completed"])
        .optional(),
});

export { createTaskSchema };
