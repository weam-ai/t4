import { z } from "zod";

export const getChatsValidator = z.object({
    page: z.string()
        .optional()
        .transform((val) => val ? parseInt(val, 10) : 1)
        .refine((val) => val > 0, "Page must be greater than 0"),
    limit: z.string()
        .optional()
        .transform((val) => val ? parseInt(val, 10) : 10)
        .refine((val) => val > 0 && val <= 100, "Limit must be between 1 and 100"),
});

export const deleteChatValidator = z.object({
    chatId: z.string()
        .min(1, "Chat ID is required")
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid chat ID format"),
});

export type GetChatsRequest = z.infer<typeof getChatsValidator>;
export type DeleteChatRequest = z.infer<typeof deleteChatValidator>;
