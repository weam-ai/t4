import { isValidObjectId } from "mongoose";
import { z } from "zod";

const updateTaskSchema = z.object({
    taskId: z
        .string()
        .refine((str) => {
            return isValidObjectId(str);
        }),
    title: z
        .string()
        .optional(),
    description: z
        .string()
        .optional(),
    status: z
        .enum(["pending", "in_progress", "completed"])
        .optional(),
});

export { updateTaskSchema };
