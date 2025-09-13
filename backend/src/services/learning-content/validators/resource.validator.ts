import { z } from "zod";

export const createResourceValidator = z.object({
    topic: z.string()
        .min(1, "Topic is required")
        .max(200, "Topic must be less than 200 characters")
        .trim(),
});

export type CreateResourceRequest = z.infer<typeof createResourceValidator>;
