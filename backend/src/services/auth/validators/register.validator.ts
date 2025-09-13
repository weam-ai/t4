import { z } from "zod";

const registerSchema = z.object({
    name: z
        .string()
        .trim()
        .optional(),
    email: z
        .string()
        .trim()
        .email(),
    password: z
        .string()
        .min(8, { message: "Must be at least 8 characters." })
        .trim()
});

export { registerSchema };
