import { IUser } from "../../models/user.model";
import { Chat } from "../../models/chat.model";
import { GetChatsRequest } from "./validators/chat.validator";
import { ApiError } from "../../utils/ApiError";
import { HttpStatus } from "../../enums";

export interface ChatHistoryResponse {
    chats: Array<{
        _id: string;
        topic: string;
        response: {
            topic: string;
            summary: string;
            resources: {
                documentation: Array<{
                    title: string;
                    url: string;
                    description: string;
                    source: string;
                }>;
            youtube: Array<{
                title: string;
                url: string;
                description: string;
                channel: string;
                duration?: string;
                viewCount?: string;
                publishedAt?: string;
                thumbnail?: string;
            }>;
                googleLinks: Array<{
                    title: string;
                    url: string;
                    description: string;
                    searchQuery: string;
                }>;
            };
            learningPath?: {
                beginner: string[];
                intermediate: string[];
                advanced: string[];
            };
            estimatedTime?: string;
            difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
        };
        createdAt: Date;
    }>;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export class GetChatsService {
    static async execute(user: IUser, query: GetChatsRequest): Promise<ChatHistoryResponse> {
        try {
            const { page, limit } = query;
            const skip = (page - 1) * limit;

            // Get total count for pagination
            const total = await Chat.countDocuments({ userId: user._id });

            // Get chats with pagination
            const chats = await Chat.find({ userId: user._id })
                .select("-__v")
                .sort({ createdAt: -1 }) // Sort by newest first
                .skip(skip)
                .limit(limit)
                .lean();

            const totalPages = Math.ceil(total / limit);

            return {
                chats: chats.map(chat => ({
                    _id: chat._id.toString(),
                    topic: chat.topic,
                    response: chat.response,
                    createdAt: chat.createdAt,
                })),
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                },
            };
        } catch (error) {
            throw new ApiError(
                HttpStatus.SERVER_ERROR,
                "Failed to retrieve chat history",
                [error instanceof Error ? error.message : "Unknown error"]
            );
        }
    }
}
