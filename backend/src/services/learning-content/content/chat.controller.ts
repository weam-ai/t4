import { Request, Response } from "express";
import { GetChatsService } from "../get-chats.service";
import { DeleteChatService } from "../delete-chat.service";
import { getChatsValidator, deleteChatValidator } from "../validators/chat.validator";
import { ApiResponse } from "../../../utils/ApiResponse";
import { HttpStatus } from "../../../enums";
import { asyncHandler } from "../../../utils/asyncHandler";
import { ApiError } from "../../../utils/ApiError";

export const getChats = asyncHandler(async (req: Request, res: Response) => {
    // Validate query parameters
    const validatedQuery = getChatsValidator.parse(req.query);

    // Get user from auth middleware
    const user = req.user;

    if (!user) {
        throw new ApiError(HttpStatus.UNAUTHORIZED, "User not authenticated");
    }

    // Get chat history
    const chatHistory = await GetChatsService.execute(user, validatedQuery);

    // Send response
    const response = new ApiResponse(
        HttpStatus.OK,
        chatHistory,
        "Chat history retrieved successfully",
        chatHistory.chats.length
    );

    res.status(HttpStatus.OK).json(response);
});

export const deleteChat = asyncHandler(async (req: Request, res: Response) => {
    // Validate request parameters
    const validatedParams = deleteChatValidator.parse(req.params);

    // Get user from auth middleware
    const user = req.user;

    if (!user) {
        throw new ApiError(HttpStatus.UNAUTHORIZED, "User not authenticated");
    }

    // Delete the chat
    const result = await DeleteChatService.execute(user, { chatId: validatedParams.chatId });

    // Send response
    const response = new ApiResponse(
        HttpStatus.OK,
        result,
        result.message
    );

    res.status(HttpStatus.OK).json(response);
});
