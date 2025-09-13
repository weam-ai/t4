import { z } from "zod";

const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .email(),
    password: z
        .string()
        .min(8, { message: "Must be at least 8 characters." })
        .trim()
});

export { loginSchema };
