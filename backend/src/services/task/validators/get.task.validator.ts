import { isValidObjectId } from "mongoose";
import { z } from "zod";

const getTaskByIdSchema = z.object({
    id: z
        .string()
        .refine((str) => {
            return isValidObjectId(str);
        }),
});

const getTaskByUserIdSchema = z.object({
    userId: z
        .string()
        .refine((str) => {
            return isValidObjectId(str);
        }),
});

export { getTaskByIdSchema, getTaskByUserIdSchema };

